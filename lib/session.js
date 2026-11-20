import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    const err = new Error('UNAUTHENTICATED');
    err.status = 401;
    throw err;
  }
  return session.user;
}

export async function getUser() {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

export async function requireRole(role) {
  const user = await requireUser();
  if (user.role !== role && user.role !== 'admin') {
    const err = new Error('FORBIDDEN');
    err.status = 403;
    throw err;
  }
  return user;
}
