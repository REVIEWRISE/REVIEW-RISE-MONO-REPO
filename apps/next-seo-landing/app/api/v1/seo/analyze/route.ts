import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy route: POST /api/v1/seo/analyze
 *
 * In production, the browser calls https://seo-analyzer.vyntrise.com/api/v1/seo/analyze
 * (the fallback in lib/api.ts). Nginx routes everything on that domain to this
 * Next.js app, so we need to proxy the request server-side to the express-seo-health
 * microservice over the internal Docker network.
 *
 * Locally, lib/api.ts uses http://localhost:3011/api/v1 directly, so this route
 * is never hit in development.
 */

const SEO_SERVICE_URL =
  process.env.SEO_HEALTH_INTERNAL_URL ||
  'http://express-seo-health:3011';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const upstreamRes = await fetch(`${SEO_SERVICE_URL}/seo/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward the real client IP for rate-limiting / logging
        'X-Forwarded-For': req.headers.get('x-forwarded-for') || '',
        'X-Real-IP': req.headers.get('x-real-ip') || '',
      },
      body: JSON.stringify(body),
      // 3 minutes — enough for heavy AI recommendation generation
      signal: AbortSignal.timeout(180_000),
    });

    const data = await upstreamRes.json();

    return NextResponse.json(data, { status: upstreamRes.status });
  } catch (err: any) {
    console.error('[SEO proxy] upstream error:', err?.message ?? err);

    const isTimeout = err?.name === 'TimeoutError' || err?.code === 'UND_ERR_CONNECT_TIMEOUT';

    return NextResponse.json(
      {
        success: false,
        error: {
          message: isTimeout
            ? 'Analysis timed out. Please try again.'
            : 'SEO service is temporarily unavailable. Please try again.',
        },
      },
      { status: isTimeout ? 504 : 502 }
    );
  }
}
