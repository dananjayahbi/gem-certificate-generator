import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'cert-gen-secret-key-change-this-in-production-2024';
const secret = new TextEncoder().encode(JWT_SECRET);

// Public paths that don't require authentication
const publicPaths = ['/login', '/signout', '/reset-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes - they handle their own auth
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Allow public paths without authentication
  if (publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
    // If user is already authenticated and tries to access login, redirect to dashboard
    const token = request.cookies.get('access_token')?.value;
    if (token && pathname.startsWith('/login')) {
      try {
        await jwtVerify(token, secret);
        return NextResponse.redirect(new URL('/', request.url));
      } catch {
        // Token invalid, allow access to login
      }
    }
    return NextResponse.next();
  }

  // For protected routes, check authentication
  const token = request.cookies.get('access_token')?.value;

  if (!token) {
    // Redirect to login if no token
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify token
    const { payload } = await jwtVerify(token, secret);
    
    // Add user info to headers for use in server components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId as string);
    requestHeaders.set('x-user-email', payload.email as string);
    requestHeaders.set('x-user-role', payload.role as string);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    // Token is invalid or expired
    console.error('Token verification failed:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images and other static assets
     */
    '/((?!_next/static|_next/image|favicon.ico|images|fonts|.*\\..*).*)',
  ],
};
