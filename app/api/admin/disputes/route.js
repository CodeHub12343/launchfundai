import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { requireAdmin } from '@/lib/admin';
import Dispute from '@/models/Dispute';

function makeRef() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `D-${n}`;
}

export async function GET(req) {
  try { await requireAdmin(); } catch (e) { return NextResponse.json({ error: e.message }, { status: e.status || 401 }); }
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'open';
  const q = status === 'all' ? {} : { status };
  const items = await Dispute.find(q).sort({ createdAt: -1 }).limit(50).lean();
  return NextResponse.json({
    items: items.map((d) => ({
      id: d._id,
      reference: d.reference,
      subject: d.subject,
      status: d.status,
      severity: d.severity,
      partnerName: d.partnerName,
      creatorName: d.creatorName,
      proposalReference: d.proposalReference,
      note: d.note,
      openedAt: d.createdAt,
      agedDays: Math.floor((Date.now() - new Date(d.createdAt).getTime()) / (24 * 60 * 60 * 1000)),
    })),
  });
}

export async function POST(req) {
  try { await requireAdmin(); } catch (e) { return NextResponse.json({ error: e.message }, { status: e.status || 401 }); }
  await dbConnect();
  const body = await req.json().catch(() => ({}));
  const { action = 'create' } = body;

  if (action === 'create') {
    const { subject = 'Other', severity = 'default', partnerName = '', creatorName = '', proposalReference = '', note = '' } = body;
    let reference = makeRef();
    while (await Dispute.exists({ reference })) reference = makeRef();
    const d = await Dispute.create({ reference, subject, severity, partnerName, creatorName, proposalReference, note });
    return NextResponse.json({ ok: true, dispute: d }, { status: 201 });
  }

  const { id, resolution = '' } = body;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const d = await Dispute.findById(id);
  if (!d) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (action === 'resolve') d.status = 'resolved';
  else if (action === 'reject') d.status = 'rejected';
  else return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  d.resolution = resolution;
  await d.save();
  return NextResponse.json({ ok: true, dispute: d });
}
