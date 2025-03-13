import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  '/sign-in',
  '/sign-up',
  '/api/auth/status',
  '/api/google',
  '/api/onedrive',
  '/api/dropbox',
  '/api/webhook',
];

// This middleware function enforces Clerk authentication
export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Never process Clerk-related paths or static assets
  if (pathname.includes('/_next') || 
      pathname.includes('/api/auth/clerk') || 
      pathname.endsWith('.ico') || 
      pathname.endsWith('.svg') || 
      pathname.endsWith('.png') || 
      pathname.endsWith('.jpg') || 
      pathname.endsWith('.css') || 
      pathname.endsWith('.js')) {
    return NextResponse.next();
  }
  
  // Check if this is a public path that doesn't need authentication
  const isPublicPath = PUBLIC_PATHS.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // Allow access to public paths without authentication
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check if the user has a Clerk session
  const hasClerkSession = !!req.cookies.get('__clerk_session');
  
  // For all non-public paths, including root '/', redirect to sign-in if not authenticated
  if (!hasClerkSession) {
    // Don't redirect if already on sign-in or sign-up page (avoids loops)
    if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
      return NextResponse.next();
    }
    
    // Create the sign-in URL
    const signInUrl = new URL('/sign-in', req.url);
    return NextResponse.redirect(signInUrl);
  }
  
  // User is authenticated, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/',
  ],
};
