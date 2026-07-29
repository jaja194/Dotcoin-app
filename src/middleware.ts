import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Convert secret key to Uint8Array for Web Crypto API compatibility
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-default-fallback-secret-key'
);

interface TokenPayload {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Get token from HTTP-only cookie
  const token = request.cookies.get('token')?.value;

  // 2. Decode & verify JWT token payload
  let payload: TokenPayload | null = null;
  if (token) {
    try {
      const { payload: verified } = await jwtVerify(token, JWT_SECRET);
      payload = verified as unknown as TokenPayload;
    } catch {
      // Invalid/expired token
      payload = null;
    }
  }

  // 3. Protection Logic for /admin Routes
  if (pathname.startsWith('/admin')) {
    if (!payload) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (payload.role !== 'ADMIN') {
      // Unauthorized user trying to access admin portal -> redirect to user dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 4. Protection Logic for /dashboard Routes
  if (pathname.startsWith('/dashboard')) {
    if (!payload) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 5. Redirect logged-in users away from Auth pages (/login, /register)
  if (payload && (pathname === '/login' || pathname === '/register')) {
    const targetRoute = payload.role === 'ADMIN' ? '/admin' : '/dashboard';
    return NextResponse.redirect(new URL(targetRoute, request.url));
  }

  return NextResponse.next();
}

// 6. Matcher Config: Run middleware ONLY on specified routes (skips static files & API)
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register'],
};