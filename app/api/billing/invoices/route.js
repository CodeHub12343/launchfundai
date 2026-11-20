import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/session';
import Pledge from '@/models/Pledge';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  let u;
  try { u = await requireUser(); } catch (e) { return NextResponse.json({ error: 'Unauthenticated' }, { status: e.status || 401 }); }

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get('limit')) || 25, 100);

  try {
    await dbConnect();
    const q = u.role === 'investor' ? { backer: u.id } : { creator: u.id };
    const pledges = await Pledge.find({ ...q, status: 'paid' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('amount platformFee currency campaignSlug status stripePaymentIntentId createdAt')
      .lean();

    const totals = pledges.reduce((acc, p) => {
      acc.gross += p.amount || 0;
      acc.fees += p.platformFee || 0;
      return acc;
    }, { gross: 0, fees: 0 });

    return NextResponse.json({
      role: u.role,
      totals,
      invoices: pledges.map((p) => ({
        id: p._id.toString(),
        date: p.createdAt,
        campaignSlug: p.campaignSlug,
        amount: p.amount,
        platformFee: p.platformFee,
        net: Math.max(0, (p.amount || 0) - (p.platformFee || 0)),
        currency: p.currency || 'usd',
        paymentIntentId: p.stripePaymentIntentId || '',
        status: p.status,
      })),
    });
  } catch (err) {
    console.error('[billing invoices]', err);
    return NextResponse.json({ invoices: [], totals: { gross: 0, fees: 0 }, role: u.role });
  }
}
