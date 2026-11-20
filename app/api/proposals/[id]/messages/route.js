import { NextResponse } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/session';
import Proposal from '@/models/Proposal';
import User from '@/models/User';

const bodySchema = z.object({ text: z.string().trim().min(1, 'Write a message') });

export async function POST(req, { params }) {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: e.status || 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  await dbConnect();
  const proposal = mongoose.isValidObjectId(params.id)
    ? await Proposal.findById(params.id)
    : await Proposal.findOne({ reference: params.id.toUpperCase() });
  if (!proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const isCreator = String(proposal.creator) === user.id;
  const isFrom = String(proposal.from) === user.id;
  if (!isCreator && !isFrom && user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const me = await User.findById(user.id).lean();
  const byName = me?.company || `${me?.firstName || ''} ${me?.lastName || ''}`.trim();
  proposal.messages.push({ by: user.id, byName, byRole: me?.role || 'investor', text: parsed.data.text });
  await proposal.save();

  return NextResponse.json({ ok: true, messages: proposal.messages });
}
