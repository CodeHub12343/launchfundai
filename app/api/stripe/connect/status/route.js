import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sessionUser = await requireUser();
    await dbConnect();
    const user = await User.findById(sessionUser.id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (!user.stripeAccountId || !isStripeConfigured()) {
      return NextResponse.json({
        configured: isStripeConfigured(),
        connected: false,
        payoutsEnabled: false,
        chargesEnabled: false,
      });
    }

    const stripe = getStripe();
    const acct = await stripe.accounts.retrieve(user.stripeAccountId);
    user.stripePayoutsEnabled = !!acct.payouts_enabled;
    user.stripeChargesEnabled = !!acct.charges_enabled;
    await user.save();

    return NextResponse.json({
      configured: true,
      connected: true,
      accountId: acct.id,
      payoutsEnabled: !!acct.payouts_enabled,
      chargesEnabled: !!acct.charges_enabled,
      detailsSubmitted: !!acct.details_submitted,
      requirements: acct.requirements || null,
    });
  } catch (err) {
    if (err?.status) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error('[stripe connect status]', err);
    return NextResponse.json({ error: 'Could not read payout status.' }, { status: 500 });
  }
}
