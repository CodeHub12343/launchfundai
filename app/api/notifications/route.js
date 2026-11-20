import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/session';
import Notification from '@/models/Notification';

export async function GET(req) {
  let user;
  try { user = await requireUser(); } catch (e) { return NextResponse.json({ error: 'Unauthenticated' }, { status: e.status || 401 }); }
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get('filter') || 'all';
  const q = { user: user.id };
  if (filter === 'unread') q.read = false;
  else if (['proposals', 'milestones', 'system'].includes(filter)) q.category = filter;

  const items = await Notification.find(q).sort({ createdAt: -1 }).limit(100).lean();
  const unreadCount = await Notification.countDocuments({ user: user.id, read: false });
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weekCount = await Notification.countDocuments({ user: user.id, createdAt: { $gte: weekAgo } });

  const groups = { Today: [], Yesterday: [], Earlier: [] };
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startYesterday = new Date(startToday.getTime() - 24 * 60 * 60 * 1000);

  items.forEach((n) => {
    const d = new Date(n.createdAt);
    const row = {
      id: n._id,
      kind: n.kind,
      category: n.category,
      title: n.title,
      desc: n.desc,
      href: n.href,
      ctaLabel: n.ctaLabel,
      unread: !n.read,
      time: timeAgo(d),
    };
    if (d >= startToday) groups.Today.push(row);
    else if (d >= startYesterday) groups.Yesterday.push(row);
    else groups.Earlier.push(row);
  });

  return NextResponse.json({ groups, unreadCount, weekCount });
}

export async function POST(req) {
  let user;
  try { user = await requireUser(); } catch (e) { return NextResponse.json({ error: 'Unauthenticated' }, { status: e.status || 401 }); }
  await dbConnect();
  const { action, id } = await req.json().catch(() => ({}));
  if (action === 'mark_all_read') {
    await Notification.updateMany({ user: user.id, read: false }, { $set: { read: true } });
    return NextResponse.json({ ok: true });
  }
  if (action === 'mark_read' && id) {
    await Notification.updateOne({ _id: id, user: user.id }, { $set: { read: true } });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

function timeAgo(d) {
  const ms = Date.now() - new Date(d).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  return `${days}d`;
}
