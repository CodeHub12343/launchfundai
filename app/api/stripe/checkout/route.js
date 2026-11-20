import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dbConnect } from '@/lib/db';
import { getUser } from '@/lib/session';
import { getStripe, platformFeeBps, appUrl, isStripeConfigured } from '@/lib/stripe';
import { resolvePlan } from '@/lib/plans';
import Campaign from '@/models/Campaign';
import User from '@/models/User';
import Pledge from '@/models/Pledge';

export const dynamic = 'force-dynamic';

const Body = z.object({
  campaignSlug: z.string().min(1),
  amount: z.number().int().positive().max(10_000_000),
});

export async function POST(req) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Payments are not enabled on this server yet.' }, { status: 501 });
  }
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const parsed = Body.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  try {
    await dbConnect();
    const campaign = await Campaign.findOne({ slug: parsed.data.campaignSlug });
    if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    if (campaign.status !== 'published' && campaign.status !== 'funded') {
      return NextResponse.json({ error: 'This campaign is not open for pledges.' }, { status: 400 });
    }

    const creator = await User.findById(campaign.creator);
    if (!creator?.stripeAccountId || !creator.stripeChargesEnabled) {
      return NextResponse.json({ error: 'The creator has not finished setting up payouts yet.' }, { status: 400 });
    }

    const amountCents = Math.round(parsed.data.amount * 100);
    const tier = resolvePlan(creator);
    const effectiveBps = Number.isFinite(tier?.platformFeeBps) ? tier.platformFeeBps : platformFeeBps();
    const feeCents = Math.floor((amountCents * effectiveBps) / 10_000);

    const backer = await getUser();
    const stripe = getStripe();

    const pledge = await Pledge.create({
      campaign: campaign._id,
      campaignSlug: campaign.slug,
      creator: creator._id,
      backer: backer?.id || undefined,
      backerEmail: backer?.email || '',
      backerName: backer?.name || '',
      amount: parsed.data.amount,
      platformFee: feeCents / 100,
      stripeDestinationAccount: creator.stripeAccountId,
      status: 'pending',
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: amountCents,
          product_data: {
            name: `Pledge — ${campaign.title}`,
            description: campaign.tagline || undefined,
          },
        },
      }],
      payment_intent_data: {
        application_fee_amount: feeCents,
        transfer_data: { destination: creator.stripeAccountId },
        metadata: { pledgeId: pledge._id.toString(), campaignSlug: campaign.slug },
      },
      customer_email: backer?.email || undefined,
      client_reference_id: pledge._id.toString(),
      success_url: `${appUrl()}/campaigns/${campaign.slug}?pledge=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl()}/campaigns/${campaign.slug}?pledge=cancelled`,
      metadata: { pledgeId: pledge._id.toString(), campaignSlug: campaign.slug, campaignId: campaign._id.toString() },
    });

    pledge.stripeCheckoutSessionId = session.id;
    await pledge.save();

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[stripe checkout]', err);
    return NextResponse.json({ error: 'Could not start checkout.' }, { status: 500 });
  }
}
