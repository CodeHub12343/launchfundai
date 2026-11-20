import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { requireUser } from '@/lib/session';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export async function POST(req) {
  try {
    await requireUser();
  } catch (e) {
    return NextResponse.json({ error: 'Sign in to upload images' }, { status: e.status || 401 });
  }

  let form;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = form.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const ext = ALLOWED[file.type];
  if (!ext) {
    return NextResponse.json({ error: 'Only JPEG, PNG, WebP, or GIF images are allowed' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Image must be 5 MB or less' }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const name = `${Date.now().toString(36)}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
  const dir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);

  return NextResponse.json({ ok: true, url: `/uploads/${name}` }, { status: 201 });
}
