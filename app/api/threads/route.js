import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/session';
import Thread from '@/models/Thread';
import User from '@/models/User';

export async function GET() {
  let user;
  try { user = await requireUser(); } catch (e) { return NextResponse.json({ error: 'Unauthenticated' }, { status: e.status || 401 }); }
  await dbConnect();

  const threads = await Thread.find({ participants: user.id })
    .sort({ lastMessageAt: -1 })
    .limit(50)
    .lean();

  const items = threads.map((t) => {
    const otherIdx = (t.participants || []).findIndex((p) => String(p) !== String(user.id));
    const idx = otherIdx === -1 ? 0 : otherIdx;
    const lastRead = (t.readBy || []).find((r) => String(r.user) === String(user.id))?.at;
    const unread = !lastRead || new Date(t.lastMessageAt) > new Date(lastRead);
    return {
      id: t._id,
      who: t.participantNames?.[idx] || 'Partner',
      pic: t.participantAvatars?.[idx] || '',
      sub: t.lastMessageText || '',
      time: timeAgo(t.lastMessageAt),
      unread,
      subject: t.subject,
      proposalReference: t.proposalReference,
      campaignSlug: t.campaignSlug,
    };
  });

  const unreadCount = items.filter((i) => i.unread).length;
  return NextResponse.json({ threads: items, unreadCount });
}

export async function POST(req) {
  let user;
  try { user = await requireUser(); } catch (e) { return NextResponse.json({ error: 'Unauthenticated' }, { status: e.status || 401 }); }
  await dbConnect();

  const body = await req.json().catch(() => ({}));
  const { participantEmail, subject = '', text = '' } = body;
  if (!participantEmail) return NextResponse.json({ error: 'participantEmail required' }, { status: 400 });

  const other = await User.findOne({ email: participantEmail.toLowerCase() }).lean();
  if (!other) return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
  if (String(other._id) === String(user.id)) return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 });

  // reuse existing 1:1 thread with no proposal binding
  const existing = await Thread.findOne({
    participants: { $all: [user.id, other._id], $size: 2 },
    proposal: { $exists: false },
  });
  if (existing) return NextResponse.json({ thread: { id: existing._id } });

  const me = await User.findById(user.id).lean();
  const meName = me?.company || `${me?.firstName || ''} ${me?.lastName || ''}`.trim() || me?.email;
  const otherName = other.company || `${other.firstName || ''} ${other.lastName || ''}`.trim() || other.email;

  const t = await Thread.create({
    participants: [user.id, other._id],
    participantNames: [meName, otherName],
    participantAvatars: [me?.avatar || '', other.avatar || ''],
    subject,
    messages: text ? [{ by: user.id, byName: meName, byAvatar: me?.avatar || '', text, at: new Date() }] : [],
    lastMessageAt: new Date(),
    lastMessageText: text || '',
    readBy: [{ user: user.id, at: new Date() }],
  });

  return NextResponse.json({ thread: { id: t._id } }, { status: 201 });
}

function timeAgo(d) {
  if (!d) return '';
  const ms = Date.now() - new Date(d).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  return `${days}d`;
}
