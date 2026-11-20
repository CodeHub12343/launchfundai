import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/session';
import Campaign from '@/models/Campaign';
import Proposal from '@/models/Proposal';
import User from '@/models/User';
import Notification from '@/models/Notification';

const createSchema = z.object({
  campaign: z.string().min(1, 'Campaign is required'),
  model: z.enum(['sponsor', 'participation', 'growth']),
  amount: z.coerce.number().positive('Enter a capital amount'),
  releaseAcross: z.string().optional().default('3 milestones'),
  revenueSharePct: z.coerce.number().min(0).max(100).optional().default(0),
  returnCap: z.string().optional().default(''),
  durationMonths: z.coerce.number().int().min(0).max(240).optional().default(18),
  reportingCadence: z.string().optional().default('Monthly (automated)'),
  message: z.string().trim().optional().default(''),
});

function makeRef() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `LFA-${n}`;
}

export async function GET(req) {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: e.status || 401 });
  }

  await dbConnect();
  const sp = req.nextUrl.searchParams;
  const scope = sp.get('scope') || 'mine';
  const status = sp.get('status');

  const filter = {};
  if (status) filter.status = status;
  if (scope === 'inbox' || user.role === 'creator') filter.creator = user.id;
  else if (scope === 'outbox' || user.role === 'investor') filter.from = user.id;
  else filter.$or = [{ creator: user.id }, { from: user.id }];

  const items = await Proposal.find(filter)
    .sort({ createdAt: -1 })
    .populate('campaign', 'slug title image category')
    .populate('from', 'firstName lastName company avatar')
    .populate('creator', 'firstName lastName company avatar')
    .lean();

  return NextResponse.json({ items });
}

export async function POST(req) {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    return NextResponse.json({ error: 'Sign in to submit interest' }, { status: e.status || 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json({ error: first.message, field: first.path.join('.') }, { status: 400 });
  }

  await dbConnect();
  const campaign = await Campaign.findOne({ slug: parsed.data.campaign }).lean();
  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  if (String(campaign.creator) === user.id) {
    return NextResponse.json({ error: "You can't propose to your own campaign" }, { status: 400 });
  }

  const me = await User.findById(user.id).lean();
  const fromName = me?.company || `${me?.firstName || ''} ${me?.lastName || ''}`.trim();

  let reference = makeRef();
  while (await Proposal.exists({ reference })) reference = makeRef();

  const initialMessage = parsed.data.message;
  const proposal = await Proposal.create({
    reference,
    campaign: campaign._id,
    campaignSlug: campaign.slug,
    creator: campaign.creator,
    from: user.id,
    fromName,
    model: parsed.data.model,
    amount: parsed.data.amount,
    releaseAcross: parsed.data.releaseAcross,
    revenueSharePct: parsed.data.revenueSharePct,
    returnCap: parsed.data.returnCap,
    durationMonths: parsed.data.durationMonths,
    reportingCadence: parsed.data.reportingCadence,
    initialMessage,
    messages: initialMessage
      ? [{ by: user.id, byName: fromName, byRole: me?.role || 'investor', text: initialMessage, at: new Date() }]
      : [],
    history: [{ by: user.id, action: 'submitted', note: `${fromName} submitted interest` }],
  });

  await Notification.create({
    user: campaign.creator,
    kind: 'proposal',
    category: 'proposals',
    title: 'New funding proposal',
    desc: `${fromName} proposed $${Number(parsed.data.amount).toLocaleString()} on ${campaign.title.split('—')[0].trim()}.`,
    href: `/proposals/${reference}`,
    ctaLabel: 'Review proposal',
  });

  return NextResponse.json({ ok: true, proposal }, { status: 201 });
}
