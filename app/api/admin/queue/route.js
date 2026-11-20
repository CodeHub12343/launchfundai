import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { requireAdmin } from '@/lib/admin';
import Campaign from '@/models/Campaign';

export async function GET() {
  try { await requireAdmin(); } catch (e) { return NextResponse.json({ error: e.message }, { status: e.status || 401 }); }
  await dbConnect();

  const items = await Campaign.find({ status: 'in_review' })
    .sort({ updatedAt: -1 })
    .populate('creator', 'firstName lastName company verified createdAt')
    .lean();

  return NextResponse.json({
    items: items.map((c) => {
      const flags = [];
      const creatorCreated = c.creator?.createdAt ? new Date(c.creator.createdAt) : null;
      if (creatorCreated && Date.now() - creatorCreated.getTime() < 30 * 24 * 60 * 60 * 1000) flags.push({ label: 'New creator', variant: 'default' });
      if (c.creator && !c.creator.verified) flags.push({ label: 'ID pending', variant: 'warning' });
      if ((c.model === 'participation' && (c.revenueSharePct || 0) > 15) || /guaranteed|zero[- ]risk/i.test(c.description || '')) {
        flags.push({ label: 'Rev. structure flagged', variant: 'danger' });
      }
      return {
        slug: c.slug,
        title: c.title,
        creator: c.creator?.company || `${c.creator?.firstName || ''} ${c.creator?.lastName || ''}`.trim(),
        submitted: c.updatedAt,
        flags,
      };
    }),
  });
}

export async function POST(req) {
  try { await requireAdmin(); } catch (e) { return NextResponse.json({ error: e.message }, { status: e.status || 401 }); }
  await dbConnect();
  const { slug, action, note } = await req.json().catch(() => ({}));
  if (!slug || !['approve', 'reject'].includes(action)) return NextResponse.json({ error: 'slug and action required' }, { status: 400 });

  const campaign = await Campaign.findOne({ slug });
  if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (campaign.status !== 'in_review') return NextResponse.json({ error: `Campaign is ${campaign.status}` }, { status: 409 });

  campaign.status = action === 'approve' ? 'published' : 'draft';
  if (note) campaign.adminNote = note;
  await campaign.save();

  // Notify creator
  const Notification = (await import('@/models/Notification')).default;
  await Notification.create({
    user: campaign.creator,
    kind: action === 'approve' ? 'approval' : 'warn',
    category: 'system',
    title: action === 'approve' ? 'Campaign approved' : 'Campaign rejected',
    desc: action === 'approve' ? `${campaign.title} is now live on the marketplace.` : (note || 'Please address the review feedback and resubmit.'),
    href: `/campaigns/${campaign.slug}`,
    ctaLabel: 'Open campaign',
  });

  return NextResponse.json({ ok: true, campaign: { slug: campaign.slug, status: campaign.status } });
}
