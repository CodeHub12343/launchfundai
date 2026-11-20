import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth?.token?.role;

    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    if (pathname.startsWith('/creator') && role !== 'creator') {
      return NextResponse.redirect(new URL(role === 'investor' ? '/investor' : role === 'admin' ? '/admin' : '/', req.url));
    }
    if (pathname.startsWith('/investor') && role !== 'investor') {
      return NextResponse.redirect(new URL(role === 'creator' ? '/creator' : role === 'admin' ? '/admin' : '/', req.url));
    }
    if (pathname.startsWith('/campaigns/new') && role !== 'creator') {
      return NextResponse.redirect(new URL('/explore', req.url));
    }
    if (pathname.startsWith('/studio') && role !== 'creator') {
      return NextResponse.redirect(new URL('/explore', req.url));
    }

    return NextResponse.next();
  },
  {
    pages: { signIn: '/login' },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/creator/:path*',
    '/investor/:path*',
    '/admin/:path*',
    '/studio/:path*',
    '/messages/:path*',
    '/notifications/:path*',
    '/settings/:path*',
    '/campaigns/new',
    '/proposals/:path*',
  ],
};
