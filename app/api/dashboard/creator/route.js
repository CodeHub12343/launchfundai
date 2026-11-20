import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/session';
import Campaign from '@/models/Campaign';
import Proposal from '@/models/Proposal';

export async function GET() {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: e.status || 401 });
  }

  await dbConnect();

  const campaigns = await Campaign.find({ creator: user.id }).sort({ updatedAt: -1 }).lean({ virtuals: true });
  const primary = campaigns.find((c) => ['published', 'funded', 'in_review'].includes(c.status)) || campaigns[0] || null;

  const proposals = await Proposal.find({ creator: user.id })
    .sort({ createdAt: -1 })
    .populate('from', 'firstName lastName company avatar')
    .populate('campaign', 'slug title')
    .lean();

  const openProposals = proposals.filter((p) => ['open', 'countered'].includes(p.status));

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newThisWeek = proposals.filter((p) => new Date(p.createdAt) >= sevenDaysAgo).length;

  const totalPledged = campaigns.reduce((s, c) => s + (c.pledged || 0), 0);
  const totalGoal = campaigns.reduce((s, c) => s + (c.goal || 0), 0);
  const fundingPct = totalGoal ? Math.round((totalPledged / totalGoal) * 100) : 0;
  const totalSeeking = campaigns.reduce((s, c) => s + (c.seeking || 0), 0);

  // Deployed capital = accepted proposals
  const acceptedProposals = proposals.filter((p) => p.status === 'accepted');
  const deployedCapital = acceptedProposals.reduce((s, p) => s + (p.amount || 0), 0);

  // Recent activity = last 10 proposal events + milestone statuses
  const activity = proposals.slice(0, 6).flatMap((p) => {
    const fromName = p.from?.company || `${p.from?.firstName || ''} ${p.from?.lastName || ''}`.trim() || p.fromName;
    const label = {
      open: `${fromName} submitted a funding proposal`,
      countered: `${fromName} countered the proposal`,
      accepted: `You accepted ${fromName}'s proposal`,
      declined: `You declined ${fromName}'s proposal`,
      withdrawn: `${fromName} withdrew their proposal`,
      expired: `${fromName}'s proposal expired`,
    }[p.status] || `${fromName} · ${p.status}`;
    return [{ at: p.updatedAt, label, status: p.status, reference: p.reference }];
  });

  return NextResponse.json({
    user: { name: user.name, role: user.role },
    kpis: {
      totalPledged,
      fundingPct,
      proposalsOpen: openProposals.length,
      newThisWeek,
      totalSeeking,
    },
    primaryCampaign: primary ? {
      slug: primary.slug,
      title: primary.title,
      image: primary.image,
      pledged: primary.pledged,
      goal: primary.goal,
      percent: primary.percent,
      daysLeft: primary.daysLeft,
      status: primary.status,
      model: primary.model,
      seeking: primary.seeking,
    } : null,
    campaigns: campaigns.map((c) => ({
      slug: c.slug, title: c.title, image: c.image, status: c.status,
      percent: c.percent, daysLeft: c.daysLeft, category: c.category,
    })),
    proposals: openProposals.slice(0, 5).map((p) => ({
      id: p._id,
      reference: p.reference,
      fromName: p.from?.company || `${p.from?.firstName || ''} ${p.from?.lastName || ''}`.trim() || p.fromName,
      fromAvatar: p.from?.avatar || '',
      amount: p.amount,
      model: p.model,
      revenueSharePct: p.revenueSharePct,
      status: p.status,
      createdAt: p.createdAt,
      campaignSlug: p.campaign?.slug || p.campaignSlug,
    })),
    deployedCapital,
    activity,
  });
}
