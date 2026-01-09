import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CRITICAL: Handle /besttopspas/ routes FIRST - this must be the first check
  // Spa routes should NEVER be processed by the job route logic below
  if (pathname.startsWith('/besttopspas/') && pathname.length > 13) {
    // This is a spa route - let it through to the besttopspas/[spa-slug] route
    return NextResponse.next();
  }
  if (pathname === '/besttopspas' || pathname.startsWith('/besttopspas/')) {
    return NextResponse.next();
  }

  // CRITICAL: Exclude /jobs/ routes that don't contain -jobs-in-
  // These are job detail pages
  if (pathname.startsWith('/jobs/') && !pathname.includes('-jobs-in-')) {
    // This is a job detail page - let it through
    return NextResponse.next();
  }
  
  // Skip middleware for other non-job routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/dashboard/') ||
    pathname.startsWith('/apply/')
  ) {
    return NextResponse.next();
  }

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
    // Only match /spa-jobs-in- pattern
    // This ensures we only process spa-jobs-in routes, not other routes
    '/spa-jobs-in-:path*',
  ],
};

