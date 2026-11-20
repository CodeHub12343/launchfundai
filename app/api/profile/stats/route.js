import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/session';
import Campaign from '@/models/Campaign';
import Proposal from '@/models/Proposal';
import Pledge from '@/models/Pledge';

export const dynamic = 'force-dynamic';

export async function GET() {
  let u;
  try { u = await requireUser(); } catch (e) { return NextResponse.json({ error: 'Unauthenticated' }, { status: e.status || 401 }); }

  try {
    await dbConnect();
    const isInvestor = u.role === 'investor';

    const [campaigns, publishedCampaigns, pledges, raised, proposals, acceptedProposals] = await Promise.all([
      isInvestor ? 0 : Campaign.countDocuments({ creator: u.id }),
      isInvestor ? 0 : Campaign.countDocuments({ creator: u.id, status: 'published' }),
      Pledge.countDocuments(isInvestor ? { backer: u.id, status: 'paid' } : { creator: u.id, status: 'paid' }),
      Pledge.aggregate([
        { $match: isInvestor ? { backer: u.id, status: 'paid' } : { creator: u.id, status: 'paid' } },
        { $group: { _id: null, sum: { $sum: '$amount' } } },
      ]).then((r) => r[0]?.sum || 0),
      isInvestor ? Proposal.countDocuments({ from: u.id }) : Proposal.countDocuments({ creator: u.id }),
      isInvestor
        ? Proposal.countDocuments({ from: u.id, status: 'accepted' })
        : Proposal.countDocuments({ creator: u.id, status: 'accepted' }),
    ]);

    return NextResponse.json({
      role: u.role,
      campaigns, publishedCampaigns,
      pledges, raised,
      proposals, acceptedProposals,
    });
  } catch (err) {
    console.error('[profile stats]', err);
    return NextResponse.json({
      role: u.role, campaigns: 0, publishedCampaigns: 0, pledges: 0, raised: 0, proposals: 0, acceptedProposals: 0,
    });
  }
}
