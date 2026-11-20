import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/session';
import Thread from '@/models/Thread';

export async function GET(_req, { params }) {
  let user;
  try { user = await requireUser(); } catch (e) { return NextResponse.json({ error: 'Unauthenticated' }, { status: e.status || 401 }); }
  await dbConnect();

  const t = await Thread.findById(params.id).lean();
  if (!t) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!t.participants.some((p) => String(p) === String(user.id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // mark read
  await Thread.updateOne(
    { _id: t._id, 'readBy.user': user.id },
    { $set: { 'readBy.$.at': new Date() } }
  );
  await Thread.updateOne(
    { _id: t._id, 'readBy.user': { $ne: user.id } },
    { $push: { readBy: { user: user.id, at: new Date() } } }
  );

  const otherIdx = (t.participants || []).findIndex((p) => String(p) !== String(user.id));
  const idx = otherIdx === -1 ? 0 : otherIdx;

  return NextResponse.json({
    thread: {
      id: t._id,
      subject: t.subject,
      proposalReference: t.proposalReference,
      campaignSlug: t.campaignSlug,
      other: {
        name: t.participantNames?.[idx] || 'Partner',
        avatar: t.participantAvatars?.[idx] || '',
      },
      messages: (t.messages || []).map((m) => ({
        id: m._id,
        by: m.by,
        byName: m.byName,
        byAvatar: m.byAvatar,
        text: m.text,
        at: m.at,
        me: String(m.by) === String(user.id),
      })),
    },
  });
}
