import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/session';
import User from '@/models/User';
import { getStripe, appUrl, isStripeConfigured } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST() {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe is not configured on this server.' }, { status: 501 });
  }
  let u;
  try { u = await requireUser(); } catch (e) { return NextResponse.json({ error: 'Unauthenticated' }, { status: e.status || 401 }); }

  try {
    await dbConnect();
    const user = await User.findById(u.id);
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const stripe = getStripe();
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.billing?.email || user.email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
        metadata: { userId: user._id.toString(), role: user.role },
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl()}/settings?tab=billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err?.type === 'StripeInvalidRequestError' && /No configuration provided/.test(err.message || '')) {
      return NextResponse.json({
        error: 'Stripe Billing Portal is not configured yet. Open https://dashboard.stripe.com/test/settings/billing/portal and save the default configuration.',
      }, { status: 400 });
    }
    console.error('[billing portal]', err);
    return NextResponse.json({ error: 'Could not open billing portal.' }, { status: 500 });
  }
}
