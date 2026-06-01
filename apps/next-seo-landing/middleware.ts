import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextResponse, NextRequest } from 'next/server'

const intlMiddleware = createMiddleware(routing)

export default function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const host = request.headers.get('host') || url.host

  const forwardedProto = request.headers.get('x-forwarded-proto')
  const proto = forwardedProto || url.protocol.replace(':', '')

  const isLocalhost =
    host.includes('localhost') ||
    host.includes('127.0.0.1') ||
    host.includes('0.0.0.0')

  if (!isLocalhost) {
    const primaryHost = 'seo-analyzer.vyntrise.com'

    if (host.startsWith('www.')) {
      url.host = host.replace(/^www\./, '')
      return NextResponse.redirect(url, 308)
    }

    if (host !== primaryHost) {
      url.host = primaryHost
      return NextResponse.redirect(url, 308)
    }

    if (proto && proto !== 'https') {
      url.protocol = 'https:'
      return NextResponse.redirect(url, 308)
    }
  }

  if (url.pathname.startsWith('/en/') || url.pathname === '/en') {
    url.pathname = url.pathname === '/en' ? '/' : url.pathname.replace(/^\/en/, '')
    return NextResponse.redirect(url, 308)
  }

  if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1)
    return NextResponse.redirect(url, 308)
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/', '/(en|ar)/:path*', '/((?!api|_next|.*\\..*).*)']
}
