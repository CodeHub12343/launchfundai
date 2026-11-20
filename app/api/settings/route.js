import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/session';
import User from '@/models/User';

export async function GET() {
  let u;
  try { u = await requireUser(); } catch (e) { return NextResponse.json({ error: 'Unauthenticated' }, { status: e.status || 401 }); }
  await dbConnect();
  const user = await User.findById(u.id).lean();
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { passwordHash, ...safe } = user;
  const connectedAccounts = {};
  (user.connectedAccounts || new Map()).forEach?.((v, k) => { connectedAccounts[k] = v; });
  if (user.connectedAccounts && typeof user.connectedAccounts === 'object' && !(user.connectedAccounts instanceof Map)) {
    Object.assign(connectedAccounts, user.connectedAccounts);
  }
  return NextResponse.json({ user: { ...safe, connectedAccounts } });
}

const profileSchema = z.object({
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  company: z.string().trim().optional(),
  bio: z.string().trim().max(500).optional(),
  location: z.string().trim().optional(),
  website: z.string().trim().optional(),
  avatar: z.string().trim().optional(),
}).strict();

const accountSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase()).optional(),
  recoveryEmail: z.string().email().optional().or(z.literal('')),
  twoFactorEnabled: z.boolean().optional(),
}).strict();

const billingSchema = z.object({
  email: z.string().email().optional().or(z.literal('')),
  taxId: z.string().trim().max(40).optional().or(z.literal('')),
}).strict();

const notifSchema = z.object({
  email: z.boolean().optional(),
  product: z.boolean().optional(),
  deals: z.boolean().optional(),
  summary: z.boolean().optional(),
}).strict();

const connectedSchema = z.object({
  provider: z.string().min(1),
  meta: z.string().optional().default(''),
  connected: z.boolean(),
}).strict();

const teamInviteSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().email().transform((v) => v.toLowerCase()),
  role: z.enum(['Admin', 'Editor']),
}).strict();

const legalSchema = z.object({
  jurisdiction: z.string().optional(),
}).strict();

export async function PATCH(req) {
  let u;
  try { u = await requireUser(); } catch (e) { return NextResponse.json({ error: 'Unauthenticated' }, { status: e.status || 401 }); }
  await dbConnect();

  const body = await req.json().catch(() => ({}));
  const { section, data } = body;

  const user = await User.findById(u.id);
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    if (section === 'profile') {
      const d = profileSchema.parse(data || {});
      Object.assign(user, d);
    } else if (section === 'account') {
      const d = accountSchema.parse(data || {});
      if (d.email && d.email !== user.email) {
        const exists = await User.findOne({ email: d.email });
        if (exists) return NextResponse.json({ error: 'Email already in use', field: 'email' }, { status: 409 });
        user.email = d.email;
      }
      if ('recoveryEmail' in d) user.recoveryEmail = d.recoveryEmail;
      if ('twoFactorEnabled' in d) user.twoFactorEnabled = d.twoFactorEnabled;
    } else if (section === 'billing') {
      const d = billingSchema.parse(data || {});
      user.billing = { ...(user.billing?.toObject?.() || user.billing || {}), ...d };
    } else if (section === 'notifications') {
      const d = notifSchema.parse(data || {});
      user.notificationPrefs = { ...(user.notificationPrefs?.toObject?.() || user.notificationPrefs || {}), ...d };
    } else if (section === 'connected') {
      const d = connectedSchema.parse(data || {});
      if (!user.connectedAccounts) user.connectedAccounts = new Map();
      if (user.connectedAccounts instanceof Map) user.connectedAccounts.set(d.provider, { meta: d.meta, connected: d.connected });
      else user.connectedAccounts[d.provider] = { meta: d.meta, connected: d.connected };
    } else if (section === 'team_invite') {
      const d = teamInviteSchema.parse(data || {});
      user.team = user.team || [];
      user.team.push({ name: d.name, email: d.email, role: d.role, invitedAt: new Date() });
    } else if (section === 'team_remove') {
      const email = (data?.email || '').toLowerCase();
      user.team = (user.team || []).filter((t) => t.email !== email);
    } else if (section === 'legal') {
      const d = legalSchema.parse(data || {});
      user.legal = { ...(user.legal?.toObject?.() || user.legal || {}), ...d };
    } else if (section === 'archive') {
      user.archived = true;
    } else if (section === 'unarchive') {
      user.archived = false;
    } else {
      return NextResponse.json({ error: 'Unknown section' }, { status: 400 });
    }
    await user.save();
    const obj = user.toObject({ virtuals: true });
    const { passwordHash, ...safe } = obj;
    const connectedAccounts = {};
    if (user.connectedAccounts instanceof Map) user.connectedAccounts.forEach((v, k) => { connectedAccounts[k] = v; });
    else if (obj.connectedAccounts) Object.assign(connectedAccounts, obj.connectedAccounts);
    safe.connectedAccounts = connectedAccounts;
    return NextResponse.json({ ok: true, user: safe });
  } catch (err) {
    if (err?.issues?.length) {
      const f = err.issues[0];
      return NextResponse.json({ error: f.message, field: f.path.join('.') }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || 'Save failed' }, { status: 400 });
  }
}
