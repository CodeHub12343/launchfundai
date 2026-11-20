import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/session';
import { computeCalc } from '@/lib/studio';

export async function POST(req) {
  try { await requireUser(); } catch (e) { return NextResponse.json({ error: 'Unauthenticated' }, { status: e.status || 401 }); }
  const body = await req.json().catch(() => ({}));
  const result = computeCalc(body);
  return NextResponse.json({ ok: true, result });
}
