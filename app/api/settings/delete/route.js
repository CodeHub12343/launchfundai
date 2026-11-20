import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/session';
import User from '@/models/User';
import Proposal from '@/models/Proposal';

export async function POST() {
  let u;
  try { u = await requireUser(); } catch (e) { return NextResponse.json({ error: 'Unauthenticated' }, { status: e.status || 401 }); }
  await dbConnect();

  const active = await Proposal.countDocuments({
    $or: [{ creator: u.id }, { from: u.id }],
    status: { $in: ['open', 'countered', 'accepted'] },
  });
  if (active > 0) {
    return NextResponse.json({ error: `Cannot delete: ${active} active deal${active === 1 ? '' : 's'} in progress.` }, { status: 409 });
  }

  const user = await User.findById(u.id);
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  user.deletedAt = new Date();
  user.archived = true;
  await user.save();
  return NextResponse.json({ ok: true, scheduledDeletionAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
}
