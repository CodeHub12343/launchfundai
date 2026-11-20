import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/session';
import Thread from '@/models/Thread';
import User from '@/models/User';
import Notification from '@/models/Notification';

export async function POST(req, { params }) {
  let user;
  try { user = await requireUser(); } catch (e) { return NextResponse.json({ error: 'Unauthenticated' }, { status: e.status || 401 }); }
  await dbConnect();

  const { text } = await req.json().catch(() => ({}));
  if (!text || !text.trim()) return NextResponse.json({ error: 'text required' }, { status: 400 });

  const t = await Thread.findById(params.id);
  if (!t) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!t.participants.some((p) => String(p) === String(user.id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const me = await User.findById(user.id).lean();
  const meName = me?.company || `${me?.firstName || ''} ${me?.lastName || ''}`.trim() || me?.email;

  const msg = { by: user.id, byName: meName, byAvatar: me?.avatar || '', text: text.trim(), at: new Date() };
  t.messages.push(msg);
  t.lastMessageAt = msg.at;
  t.lastMessageText = text.trim().slice(0, 140);
  const myRead = t.readBy.find((r) => String(r.user) === String(user.id));
  if (myRead) myRead.at = new Date(); else t.readBy.push({ user: user.id, at: new Date() });
  await t.save();

  const saved = t.messages[t.messages.length - 1];
  const others = t.participants.filter((p) => String(p) !== String(user.id));
  if (others.length) {
    await Notification.create({
      user: others[0],
      kind: 'message',
      category: 'system',
      title: `${meName} sent a message`,
      desc: saved.text.slice(0, 140),
      href: `/messages`,
      ctaLabel: 'Open message',
    });
  }
  return NextResponse.json({
    message: {
      id: saved._id, by: saved.by, byName: saved.byName, byAvatar: saved.byAvatar,
      text: saved.text, at: saved.at, me: true,
    },
  }, { status: 201 });
}
