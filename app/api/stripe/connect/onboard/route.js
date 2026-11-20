import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { getStripe, appUrl, isStripeConfigured } from '@/lib/stripe';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function POST() {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe is not configured on this server.' }, { status: 501 });
  }
  try {
    const sessionUser = await requireUser();
    if (sessionUser.role !== 'creator' && sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'Only creators can connect a payout account.' }, { status: 403 });
    }
    await dbConnect();
    const user = await User.findById(sessionUser.id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const stripe = getStripe();
    let accountId = user.stripeAccountId;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        capabilities: { transfers: { requested: true }, card_payments: { requested: true } },
        business_type: 'individual',
      });
      accountId = account.id;
      user.stripeAccountId = accountId;
      await user.save();
    }

    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl()}/creator/payouts?refresh=1`,
      return_url: `${appUrl()}/creator/payouts?connected=1`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: link.url });
  } catch (err) {
    if (err?.status) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error('[stripe connect onboard]', err);
    return NextResponse.json({ error: 'Could not start onboarding.' }, { status: 500 });
  }
}
