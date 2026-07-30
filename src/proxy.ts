import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-default-fallback-secret-key'
);

interface TokenPayload {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

// Renamed from 'middleware' to 'proxy'
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('token')?.value;

  let payload: TokenPayload | null = null;
  if (token) {
    try {
      const { payload: verified } = await jwtVerify(token, JWT_SECRET);
      payload = verified as unknown as TokenPayload;
    } catch {
      payload = null;
    }
  }

  // Admin route protection
  if (pathname.startsWith('/admin')) {
    if (!payload) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Dashboard route protection
  if (pathname.startsWith('/dashboard')) {
    if (!payload) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect logged-in users away from Auth pages
  if (payload && (pathname === '/login' || pathname === '/register')) {
    const targetRoute = payload.role === 'ADMIN' ? '/admin' : '/dashboard';
    return NextResponse.redirect(new URL(targetRoute, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register'],
};