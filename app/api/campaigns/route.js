import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { slugify, randSuffix } from '@/lib/slug';
import Campaign from '@/models/Campaign';
import User from '@/models/User';
import { CATEGORIES } from '@/lib/categories';

const createSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters'),
  tagline: z.string().trim().optional().default(''),
  description: z.string().trim().optional().default(''),
  category: z.enum(CATEGORIES),
  platformUrl: z.string().trim().optional().default(''),
  pledged: z.coerce.number().nonnegative().default(0),
  goal: z.coerce.number().positive('Goal must be greater than 0'),
  backers: z.coerce.number().nonnegative().default(0),
  daysLeft: z.coerce.number().nonnegative().default(30),
  seeking: z.coerce.number().positive('Seeking amount must be greater than 0'),
  minAcceptable: z.coerce.number().nonnegative().default(0),
  model: z.enum(['sponsor', 'participation', 'growth']).default('participation'),
  revenueSharePct: z.coerce.number().min(0).max(100).optional().default(0),
  returnCap: z.string().trim().optional().default(''),
  jurisdiction: z.string().trim().optional().default('Delaware, USA'),
  image: z.string().trim().optional().default(''),
  gallery: z.array(z.string()).optional().default([]),
  milestones: z
    .array(z.object({ label: z.string(), description: z.string().optional().default(''), amount: z.coerce.number().default(0) }))
    .optional()
    .default([]),
  risks: z
    .array(z.object({ label: z.string(), severity: z.enum(['low', 'medium', 'high']).default('medium'), note: z.string().optional().default('') }))
    .optional()
    .default([]),
});

export async function GET(req) {
  await dbConnect();
  const sp = req.nextUrl.searchParams;
  const cat = sp.get('category');
  const model = sp.get('model');
  const q = sp.get('q');
  const sort = sp.get('sort') || 'trending';
  const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(sp.get('limit') || '12', 10)));

  const filter = { status: { $in: ['published', 'funded'] } };
  if (cat && cat !== 'All') filter.category = cat;
  if (model) filter.model = model;
  if (q) filter.title = { $regex: q, $options: 'i' };

  const sortMap = {
    trending: { featured: -1, views: -1, createdAt: -1 },
    newest: { createdAt: -1 },
    funded: { pledged: -1 },
    closing: { daysLeft: 1 },
  };

  const total = await Campaign.countDocuments(filter);
  const items = await Campaign.find(filter)
    .sort(sortMap[sort] || sortMap.trending)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean({ virtuals: true });

  return NextResponse.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
}

export async function POST(req) {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    return NextResponse.json({ error: 'Sign in to list a campaign' }, { status: e.status || 401 });
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
  const u = await User.findById(user.id).lean();

  let slug = slugify(parsed.data.title) || `campaign-${randSuffix()}`;
  if (await Campaign.exists({ slug })) slug = `${slug}-${randSuffix()}`;

  const campaign = await Campaign.create({
    ...parsed.data,
    slug,
    creator: user.id,
    creatorName: u?.company || `${u?.firstName || ''} ${u?.lastName || ''}`.trim(),
    creatorLocation: u?.location || '',
    status: 'in_review',
  });

  return NextResponse.json({ ok: true, campaign }, { status: 201 });
}
