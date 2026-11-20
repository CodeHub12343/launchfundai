import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';

const signupSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().email('Enter a valid email').transform((v) => v.toLowerCase()),
  password: z.string().min(12, 'Password must be at least 12 characters'),
  role: z.enum(['creator', 'investor']),
  company: z.string().trim().optional().default(''),
  acceptedTerms: z.boolean().refine((v) => v === true, { message: 'You must agree to the terms' }),
  plan: z.enum(['free', 'pro']).optional(),
});

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json({ error: first.message, field: first.path[0] }, { status: 400 });
  }

  try {
    await dbConnect();
    const existing = await User.findOne({ email: parsed.data.email });
    if (existing) {
      return NextResponse.json({ error: 'An account with that email already exists', field: 'email' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const billingPlan = parsed.data.plan === 'pro' ? 'Creator Pro' : parsed.data.role === 'creator' ? 'Creator Free' : 'Investor';
    const user = await User.create({
      email: parsed.data.email,
      passwordHash,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      role: parsed.data.role,
      company: parsed.data.company,
      acceptedTerms: true,
      billing: { plan: billingPlan },
    });

    return NextResponse.json(
      { ok: true, user: { id: user._id.toString(), email: user.email, role: user.role } },
      { status: 201 }
    );
  } catch (err) {
    console.error('[signup] error', err);
    return NextResponse.json({ error: 'Something went wrong. Try again.' }, { status: 500 });
  }
}
