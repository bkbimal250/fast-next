import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle /spa-jobs-in-[location] pattern
  // Example: /spa-jobs-in-vashi-navi-mumbai -> /spa-jobs-in/vashi/navi/mumbai
  if (pathname.startsWith('/spa-jobs-in-') && pathname !== '/spa-jobs-in-') {
    const location = pathname.replace('/spa-jobs-in-', '');
    if (location && !location.includes('/')) {
      // Split by hyphens and rewrite to catch-all route
      const locationParts = location.split('-');
      const url = request.nextUrl.clone();
      url.pathname = `/spa-jobs-in/${locationParts.join('/')}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/spa-jobs-in-:path*',
  ],
};

