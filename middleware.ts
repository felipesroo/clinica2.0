import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'aura-aesthetics-secret-key-2026-secure-jwt'
);

const PUBLIC_PATHS = [
  '/login',
  '/api/auth',
  '/api/seed',
  '/api/admin',
  '/api/webhooks',
  '/api/cron',
  '/api/push'
];

function getPublicBaseUrl(request: NextRequest): string {
  if (process.env.NODE_ENV === 'production') {
    return 'https://agenda.drajordanefaria.com';
  }
  const origin = request.nextUrl.origin;
  return origin.includes('0.0.0.0') ? 'http://localhost:3000' : origin;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets, next internal routes, and public API paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.') ||
    PUBLIC_PATHS.some(path => pathname.startsWith(path))
  ) {
    return NextResponse.next();
  }

  const baseUrl = getPublicBaseUrl(request);

  // Check session cookie
  const token = request.cookies.get('aura_session')?.value;

  if (!token) {
    const loginUrl = new URL('/login', baseUrl);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    return NextResponse.next();
  } catch (err) {
    const loginUrl = new URL('/login', baseUrl);
    loginUrl.searchParams.set('from', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('aura_session');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
