import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Staff dashboard protection
  if (path.startsWith('/control-room-code-007')) {
    const sessionCookie = request.cookies.get('zalen-gam-session');

    if (path === '/control-room-code-007') {
      return NextResponse.next();
    }

    if (!sessionCookie && path !== '/control-room-code-007') {
      return NextResponse.redirect(new URL('/control-room-code-007', request.url));
    }
  }

  // API rate limiting headers
  if (path.startsWith('/api/')) {
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/control-room-code-007/:path*', '/api/:path*'],
};
