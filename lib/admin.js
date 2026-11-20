import { requireUser } from '@/lib/session';

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== 'admin') {
    const e = new Error('Admin only');
    e.status = 403;
    throw e;
  }
  return user;
}
