import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import Pledge from '@/models/Pledge';
import Campaign from '@/models/Campaign';
import User from '@/models/User';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 501 });
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: 'Missing STRIPE_WEBHOOK_SECRET' }, { status: 500 });

  const sig = req.headers.get('stripe-signature');
  const raw = await req.text();

  let event;
  try {
    event = getStripe().webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    console.error('[stripe webhook] signature error', err?.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    await dbConnect();

    if (event.type === 'checkout.session.completed') {
      const s = event.data.object;
      const pledgeId = s.metadata?.pledgeId || s.client_reference_id;
      if (pledgeId) {
        const pledge = await Pledge.findById(pledgeId);
        if (pledge && pledge.status !== 'paid') {
          pledge.status = 'paid';
          pledge.stripePaymentIntentId = s.payment_intent || pledge.stripePaymentIntentId;
          await pledge.save();
          await Campaign.updateOne(
            { _id: pledge.campaign },
            { $inc: { pledged: pledge.amount, backers: 1 } }
          );
        }
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object;
      const pledgeId = pi.metadata?.pledgeId;
      if (pledgeId) await Pledge.updateOne({ _id: pledgeId, status: 'pending' }, { status: 'failed' });
    } else if (event.type === 'charge.refunded') {
      const ch = event.data.object;
      const pi = ch.payment_intent;
      if (pi) await Pledge.updateOne({ stripePaymentIntentId: pi }, { status: 'refunded' });
    } else if (event.type === 'account.updated') {
      const acct = event.data.object;
      await User.updateOne(
        { stripeAccountId: acct.id },
        { stripePayoutsEnabled: !!acct.payouts_enabled, stripeChargesEnabled: !!acct.charges_enabled }
      );
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[stripe webhook] handler error', err);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }
}
