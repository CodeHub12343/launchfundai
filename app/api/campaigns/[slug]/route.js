import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/session';
import Campaign from '@/models/Campaign';

const patchSchema = z.object({
  title: z.string().trim().min(3).optional(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  pledged: z.coerce.number().nonnegative().optional(),
  backers: z.coerce.number().nonnegative().optional(),
  daysLeft: z.coerce.number().nonnegative().optional(),
  seeking: z.coerce.number().positive().optional(),
  minAcceptable: z.coerce.number().nonnegative().optional(),
  model: z.enum(['sponsor', 'participation', 'growth']).optional(),
  revenueSharePct: z.coerce.number().min(0).max(100).optional(),
  returnCap: z.string().optional(),
  jurisdiction: z.string().optional(),
  image: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  status: z.enum(['draft', 'in_review', 'published', 'funded', 'archived']).optional(),
  milestones: z.array(z.any()).optional(),
  risks: z.array(z.any()).optional(),
});

export async function GET(_req, { params }) {
  await dbConnect();
  const campaign = await Campaign.findOne({ slug: params.slug })
    .populate('creator', 'firstName lastName company location avatar verified')
    .lean({ virtuals: true });
  if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  Campaign.updateOne({ _id: campaign._id }, { $inc: { views: 1 } }).catch(() => {});
  return NextResponse.json({ campaign });
}

export async function PATCH(req, { params }) {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: e.status || 401 });
  }

  await dbConnect();
  const campaign = await Campaign.findOne({ slug: params.slug });
  if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (String(campaign.creator) !== user.id && user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json({ error: first.message, field: first.path.join('.') }, { status: 400 });
  }

  Object.assign(campaign, parsed.data);
  await campaign.save();
  return NextResponse.json({ ok: true, campaign });
}

export async function DELETE(_req, { params }) {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: e.status || 401 });
  }
  await dbConnect();
  const campaign = await Campaign.findOne({ slug: params.slug });
  if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (String(campaign.creator) !== user.id && user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  campaign.status = 'archived';
  await campaign.save();
  return NextResponse.json({ ok: true });
}
