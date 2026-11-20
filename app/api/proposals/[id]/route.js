import { NextResponse } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/session';
import Proposal from '@/models/Proposal';
import Notification from '@/models/Notification';

const findById = async (id) => {
  if (mongoose.isValidObjectId(id)) return Proposal.findById(id);
  return Proposal.findOne({ reference: id.toUpperCase() });
};

const patchSchema = z.object({
  action: z.enum(['accept', 'counter', 'decline', 'withdraw', 'request_documents']),
  note: z.string().optional().default(''),
  terms: z
    .object({
      amount: z.coerce.number().positive().optional(),
      revenueSharePct: z.coerce.number().min(0).max(100).optional(),
      returnCap: z.string().optional(),
      durationMonths: z.coerce.number().int().min(0).max(240).optional(),
      releaseAcross: z.string().optional(),
    })
    .optional(),
});

export async function GET(_req, { params }) {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: e.status || 401 });
  }

  await dbConnect();
  const proposal = await (await findById(params.id))
    ?.populate('campaign', 'slug title image category pledged goal')
    .then((p) => (p ? p.populate('from', 'firstName lastName company avatar role') : p))
    .then((p) => (p ? p.populate('creator', 'firstName lastName company avatar role') : p));

  if (!proposal) return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
  if (
    String(proposal.creator._id || proposal.creator) !== user.id &&
    String(proposal.from._id || proposal.from) !== user.id &&
    user.role !== 'admin'
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ proposal });
}

export async function PATCH(req, { params }) {
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

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json({ error: first.message, field: first.path.join('.') }, { status: 400 });
  }

  await dbConnect();
  const proposal = await findById(params.id);
  if (!proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const isCreator = String(proposal.creator) === user.id;
  const isFrom = String(proposal.from) === user.id;
  if (!isCreator && !isFrom && user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { action, note, terms } = parsed.data;

  // Who can do what
  const allowed = {
    accept: isCreator,
    counter: isCreator || isFrom,
    decline: isCreator,
    withdraw: isFrom,
    request_documents: isCreator,
  };
  if (!allowed[action]) {
    return NextResponse.json({ error: `Only ${action === 'withdraw' ? 'the sender' : 'the campaign creator'} can ${action} this proposal` }, { status: 403 });
  }
  if (['accepted', 'declined', 'withdrawn', 'expired'].includes(proposal.status)) {
    return NextResponse.json({ error: `Proposal is already ${proposal.status}` }, { status: 409 });
  }

  const nextStatus = {
    accept: 'accepted',
    counter: 'countered',
    decline: 'declined',
    withdraw: 'withdrawn',
    request_documents: proposal.status,
  }[action];

  if (action === 'counter' && terms) {
    if (terms.amount != null) proposal.amount = terms.amount;
    if (terms.revenueSharePct != null) proposal.revenueSharePct = terms.revenueSharePct;
    if (terms.returnCap != null) proposal.returnCap = terms.returnCap;
    if (terms.durationMonths != null) proposal.durationMonths = terms.durationMonths;
    if (terms.releaseAcross != null) proposal.releaseAcross = terms.releaseAcross;
  }
  proposal.status = nextStatus;
  proposal.history.push({ by: user.id, action: action === 'request_documents' ? 'documents_requested' : nextStatus, note, terms: terms || null });
  await proposal.save();

  const recipient = isCreator ? proposal.from : proposal.creator;
  const titles = {
    accept: 'Your proposal was accepted',
    counter: isCreator ? 'Creator countered your proposal' : 'Investor countered their proposal',
    decline: 'Your proposal was declined',
    withdraw: 'Investor withdrew their proposal',
    request_documents: 'Creator requested documents',
  };
  await Notification.create({
    user: recipient,
    kind: 'proposal',
    category: 'proposals',
    title: titles[action],
    desc: note || `Proposal #${proposal.reference}`,
    href: `/proposals/${proposal.reference}`,
    ctaLabel: 'Open proposal',
  });

  return NextResponse.json({ ok: true, proposal });
}
