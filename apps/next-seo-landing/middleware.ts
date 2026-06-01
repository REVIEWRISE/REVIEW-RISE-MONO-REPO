import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextResponse, NextRequest } from 'next/server'

const intlMiddleware = createMiddleware(routing)

export default function middleware(request: NextRequest) {
  const host = request.headers.get('host')
  if (host && host.startsWith('www.')) {
    const url = request.nextUrl.clone()
    url.host = host.replace(/^www\./, '')
    return NextResponse.redirect(url)
  }
  return intlMiddleware(request)
}

export const config = {
    matcher: ['/', '/(en|ar)/:path*', '/((?!api|_next|.*\\..*).*)']
}
