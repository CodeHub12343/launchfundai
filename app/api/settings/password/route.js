import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/session';
import User from '@/models/User';

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(12, 'Password must be at least 12 characters'),
});

export async function POST(req) {
  let u;
  try { u = await requireUser(); } catch (e) { return NextResponse.json({ error: 'Unauthenticated' }, { status: e.status || 401 }); }
  await dbConnect();

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const f = parsed.error.issues[0];
    return NextResponse.json({ error: f.message, field: f.path.join('.') }, { status: 400 });
  }

  const user = await User.findById(u.id).select('+passwordHash');
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!ok) return NextResponse.json({ error: 'Current password is incorrect', field: 'currentPassword' }, { status: 400 });
  user.passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await user.save();
  return NextResponse.json({ ok: true });
}
