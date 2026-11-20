import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Campaign from '@/models/Campaign';
import Proposal from '@/models/Proposal';
import User from '@/models/User';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await dbConnect();
    const [liveCampaigns, acceptedAgg, partners] = await Promise.all([
      Campaign.countDocuments({ status: { $in: ['published', 'funded'] } }),
      Proposal.aggregate([
        { $match: { status: 'accepted' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      User.countDocuments({ role: 'investor' }),
    ]);
    return NextResponse.json({
      liveCampaigns,
      deployedCapital: acceptedAgg[0]?.total || 0,
      partners,
    });
  } catch {
    return NextResponse.json({ liveCampaigns: 0, deployedCapital: 0, partners: 0 });
  }
}
