import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/session';
import Proposal from '@/models/Proposal';
import Campaign from '@/models/Campaign';

export async function GET() {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: e.status || 401 });
  }

  await dbConnect();

  const proposals = await Proposal.find({ from: user.id })
    .sort({ updatedAt: -1 })
    .populate('campaign', 'slug title image category creatorName')
    .populate('creator', 'firstName lastName company')
    .lean();

  const active = proposals.filter((p) => p.status === 'accepted');
  const activeTotal = active.reduce((s, p) => s + (p.amount || 0), 0);
  const openCount = proposals.filter((p) => ['open', 'countered'].includes(p.status)).length;
  const awaitingCreator = proposals.filter((p) => p.status === 'open').length;

  // Deployed campaigns table rows (based on accepted proposals).
  // Milestone progress, released tranches, and return values are left as
  // placeholders until we persist real milestone events and payouts.
  const portfolioRows = active.map((p) => ({
    id: p._id,
    reference: p.reference,
    name: p.campaign?.title?.split('—')[0].trim() || 'Campaign',
    sub: `${p.creator?.company || `${p.creator?.firstName || ''} ${p.creator?.lastName || ''}`.trim()} · ${p.campaign?.category || '—'}`,
    slug: p.campaign?.slug,
    image: p.campaign?.image || '',
    structure: p.model,
    amount: p.amount,
    milestone: '—',
    progress: 0,
    released: '—',
    returnValue: '—',
  }));

  // Saved opportunities — featured published campaigns the user hasn't proposed to yet
  const proposedCampaignIds = new Set(proposals.map((p) => String(p.campaign?._id || p.campaign)));
  const saved = await Campaign.find({ status: { $in: ['published', 'funded'] } })
    .sort({ featured: -1, createdAt: -1 })
    .limit(6)
    .lean({ virtuals: true });
  const savedFiltered = saved.filter((c) => !proposedCampaignIds.has(String(c._id))).slice(0, 4);

  const recentProposals = proposals.slice(0, 5).map((p) => ({
    id: p._id,
    reference: p.reference,
    name: p.campaign?.title?.split('—')[0].trim() || 'Campaign',
    status: p.status,
    amount: p.amount,
    model: p.model,
    revenueSharePct: p.revenueSharePct,
    updatedAt: p.updatedAt,
  }));

  // YTD return and avg days to next milestone will come from real payout
  // and milestone events once those are persisted. Until then, show 0.
  const ytdReturn = 0;
  const avgDaysNextMilestone = 0;

  return NextResponse.json({
    user: { name: user.name, role: user.role },
    kpis: {
      deployed: activeTotal,
      activeCount: active.length,
      proposalsOpen: openCount,
      awaitingCreator,
      ytdReturn,
      avgDaysNextMilestone,
    },
    portfolio: portfolioRows,
    saved: savedFiltered.map((c) => ({
      slug: c.slug,
      name: c.title.split('—')[0].trim(),
      category: c.category,
      pct: `${c.percent || 0}%`,
      sub: `Seeks $${(c.seeking || 0).toLocaleString()} · ${c.model === 'sponsor' ? 'Sponsorship' : c.model === 'growth' ? 'Growth Partnership' : 'Rev. Participation'}`,
      image: c.image,
    })),
    recentProposals,
  });
}
