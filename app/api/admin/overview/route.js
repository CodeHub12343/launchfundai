import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { requireAdmin } from '@/lib/admin';
import Campaign from '@/models/Campaign';
import User from '@/models/User';
import Proposal from '@/models/Proposal';
import Dispute from '@/models/Dispute';
import ModerationItem from '@/models/ModerationItem';

export async function GET() {
  try { await requireAdmin(); } catch (e) { return NextResponse.json({ error: e.message }, { status: e.status || 401 }); }
  await dbConnect();

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [activeCampaigns, campaignsWk, creators, creatorsWk, partners, partnersWk, pending, openDisputes, agedDisputes] = await Promise.all([
    Campaign.countDocuments({ status: { $in: ['published', 'funded'] } }),
    Campaign.countDocuments({ status: { $in: ['published', 'funded'] }, createdAt: { $gte: weekAgo } }),
    User.countDocuments({ role: 'creator' }),
    User.countDocuments({ role: 'creator', createdAt: { $gte: weekAgo } }),
    User.countDocuments({ role: 'investor' }),
    User.countDocuments({ role: 'investor', createdAt: { $gte: weekAgo } }),
    Campaign.countDocuments({ status: 'in_review' }),
    Dispute.countDocuments({ status: 'open' }),
    Dispute.countDocuments({ status: 'open', createdAt: { $lte: dayAgo } }),
  ]);

  const accepted = await Proposal.aggregate([
    { $match: { status: 'accepted' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const deployedTotal = accepted[0]?.total || 0;

  const buckets = await Proposal.aggregate([
    { $match: { status: 'accepted', createdAt: { $gte: new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000) } } },
    { $group: {
      _id: { $floor: { $divide: [{ $subtract: [new Date(), '$createdAt'] }, 7 * 24 * 60 * 60 * 1000] } },
      total: { $sum: '$amount' },
    } },
    { $sort: { _id: -1 } },
  ]);
  const weeks = Array.from({ length: 12 }, (_, i) => {
    const b = buckets.find((x) => x._id === 11 - i);
    return b?.total || 0;
  });

  return NextResponse.json({
    kpis: {
      activeCampaigns, campaignsWk,
      deployedTotal,
      creators, creatorsWk,
      partners, partnersWk,
      pending,
      openDisputes, agedDisputes,
    },
    weeklyDeployed: weeks,
  });
}
