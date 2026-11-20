import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/session';
import User from '@/models/User';
import { PLAN_TIERS, CREATOR_TIERS } from '@/lib/plans';

export const dynamic = 'force-dynamic';

const Body = z.object({ plan: z.enum(['free', 'pro']) });

export async function POST(req) {
  let u;
  try { u = await requireUser(); } catch (e) { return NextResponse.json({ error: 'Unauthenticated' }, { status: e.status || 401 }); }

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const parsed = Body.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  if (!CREATOR_TIERS.includes(parsed.data.plan)) return NextResponse.json({ error: 'Plan not available' }, { status: 400 });

  await dbConnect();
  const user = await User.findById(u.id);
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (user.role === 'investor') return NextResponse.json({ error: 'Investor accounts cannot change creator plan.' }, { status: 403 });

  const tier = PLAN_TIERS[parsed.data.plan];
  user.billing = { ...(user.billing?.toObject?.() || user.billing || {}), plan: tier.label };
  await user.save();

  return NextResponse.json({ ok: true, plan: tier });
}
