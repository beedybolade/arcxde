import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define the precise private application layers that require a session token
const PROTECTED_ROUTES = ['/dashboard', '/settings'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip checks for internal Next.js assets, static bundles, and assets
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Only execute auth enforcement if the user is attempting to hit a protected route
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtected) {
    // Read the cookie token value sent implicitly by the browser
    const token = request.cookies.get('access_token')?.value;

    if (!token) {
      const loginUrl = new URL('/signup', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}
