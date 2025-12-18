import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get('accessToken')

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/register', '/forgot-password', '/api/auth/login', '/api/auth/logout']

  // Check if the current path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  // If user is authenticated and tries to access login page, redirect to dashboard
  if (accessToken && isPublicPath && pathname !== '/api/auth/logout') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If user is not authenticated and tries to access protected page
  if (!accessToken && !isPublicPath) {
    // Allow access to other API routes or static files if needed,
    // but for now we protect everything else
    if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
      return NextResponse.next()
    }

    const loginUrl = new URL('/login', request.url)

    loginUrl.searchParams.set('returnUrl', pathname)

    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    '/((?!_next/static|_next/image|favicon.ico|images).*)',
  ],
}
