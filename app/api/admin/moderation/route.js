import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { requireAdmin } from '@/lib/admin';
import ModerationItem from '@/models/ModerationItem';

export async function GET() {
  try { await requireAdmin(); } catch (e) { return NextResponse.json({ error: e.message }, { status: e.status || 401 }); }
  await dbConnect();
  const items = await ModerationItem.find({ status: 'open' }).sort({ createdAt: -1 }).limit(20).lean();
  return NextResponse.json({ items });
}

export async function POST(req) {
  try { await requireAdmin(); } catch (e) { return NextResponse.json({ error: e.message }, { status: e.status || 401 }); }
  await dbConnect();
  const body = await req.json().catch(() => ({}));
  const { action = 'create', id, title, reason, severity = 'warning', campaignSlug } = body;
  if (action === 'create') {
    if (!title || !reason) return NextResponse.json({ error: 'title and reason required' }, { status: 400 });
    const item = await ModerationItem.create({ title, reason, severity, campaignSlug });
    return NextResponse.json({ ok: true, item }, { status: 201 });
  }
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const item = await ModerationItem.findById(id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (action === 'resolve') item.status = 'resolved';
  else if (action === 'dismiss') item.status = 'dismissed';
  else return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  await item.save();
  return NextResponse.json({ ok: true, item });
}
