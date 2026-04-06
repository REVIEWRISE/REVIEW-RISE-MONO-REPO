/* eslint-disable import/no-unresolved */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';

const buildMockSummary = (businessId: string | null, dateRange: string | null) => {
  const seed = (businessId || 'business').length * 31;
  const spend = Math.round(4200 + seed);
  const googleSpend = Math.round(spend * 0.58);
  const metaSpend = spend - googleSpend;

  return {
    dateRange: dateRange || '30D',
    totalSpend: spend,
    roas: 3.1,
    deltas: { spend: 4.2, cpc: -3.1, ctr: 6.4 },
    google: {
      platform: 'google',
      spend: googleSpend,
      roas: 3.4,
      cpc: 1.82,
      ctr: 4.1,
      impressions: 82000,
      clicks: 3360,
      conversions: 238,
      cpl: 17.64,
      impressionShare: 78.4,
      keywords: 42
    },
    meta: {
      platform: 'meta',
      spend: metaSpend,
      roas: 2.6,
      cpc: 0.92,
      ctr: 2.7,
      impressions: 64000,
      clicks: 1730,
      conversions: 126,
      cpl: 20.64,
      frequency: 2.1,
      reach: 41200,
      engagement: 2800
    },
    efficiency: [
      { platform: 'Google Ads', cpl: 17.64 },
      { platform: 'Meta Ads', cpl: 20.64 }
    ],
    optimizationFeed: [
      {
        id: 'budget-shift-mock',
        type: 'budget_shift',
        title: 'Shift budget toward Google Search winners',
        impact: 'Projected +12% conversions if moved this week.',
        recommendation: 'Reallocate 15% of Meta prospecting spend to top search ad groups.',
        severity: 'high',
        actionLabel: 'Apply shift',
        actionType: 'apply'
      },
      {
        id: 'ad-fatigue-mock',
        type: 'ad_fatigue',
        title: 'Ad fatigue detected on Meta video set',
        impact: 'CTR declined for 5 days, frequency above 2.6.',
        recommendation: 'Refresh creative and rotate in new primary text variants.',
        severity: 'medium',
        actionLabel: 'How to refresh',
        actionType: 'how_to',
        steps: [
          'Swap in new primary text and headline variants from the AI copywriter.',
          'Rotate 2 new creatives into the ad set.',
          'Reset learning by duplicating the ad set if performance stalls.'
        ]
      }
    ],
    leadLog: [
      {
        id: 'lead-mock-1',
        occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        type: 'Call',
        source: 'Google Search - Pizza Delivery',
        value: 38
      },
      {
        id: 'lead-mock-2',
        occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        type: 'Form',
        source: 'Meta Leads - Weekend Promo',
        value: 21
      }
    ],
    funnel: {
      impressions: 146000,
      clicks: 5090,
      visits: 4180,
      conversions: 364
    }
  };
};

const SERVICE_URL = process.env.NEXT_PUBLIC_AD_RISE_API_URL || 'http://localhost:3100/api/v1';

async function proxy(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params;
  const query = req.nextUrl.search;
  const targetPath = path.join('/');
  const url = `${SERVICE_URL}/${targetPath}${query}`;

  const bodyText = req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined;

  try {
    const headers = new Headers();
    const contentType = req.headers.get('content-type');

    if (contentType) headers.set('content-type', contentType);

    // Authorization passthrough
    const auth = req.headers.get('authorization');

    if (auth) headers.set('authorization', auth);

    const response = await fetch(url, {
      method: req.method,
      headers,
      body: bodyText
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const responseContentType = response.headers.get('content-type') || '';

    if (
      responseContentType.includes('application/pdf') ||
      responseContentType.includes('application/octet-stream') ||
      responseContentType.includes('text/csv') ||
      responseContentType.includes('application/vnd') ||
      responseContentType.includes('application/zip')
    ) {
      const buffer = await response.arrayBuffer();
      const passthroughHeaders = new Headers();

      passthroughHeaders.set('content-type', responseContentType);

      const contentDisposition = response.headers.get('content-disposition');

      if (contentDisposition) passthroughHeaders.set('content-disposition', contentDisposition);

      const contentLength = response.headers.get('content-length');

      if (contentLength) passthroughHeaders.set('content-length', contentLength);

      return new NextResponse(buffer, { status: response.status, headers: passthroughHeaders });
    }

    const text = await response.text();
    let data;

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }

    if (data && typeof data === 'object' && 'success' in data && ('data' in data || 'error' in data)) {
      return NextResponse.json(data, { status: response.status });
    }

    if (response.ok) {
      const wrapped = createSuccessResponse(data, 'Success', response.status);

      return NextResponse.json(wrapped, { status: response.status });
    }

    const wrapped = createErrorResponse(
      data.message || data.error || 'Proxy Error',
      data.code || ErrorCode.INTERNAL_SERVER_ERROR,
      response.status,
      data.details || data
    );

    return NextResponse.json(wrapped, { status: response.status });
  } catch (error) {
    const fallbackPath = path.join('/');

    if (fallbackPath === 'ads-dashboard/copywriter') {
      try {
        const aiBaseUrl = process.env.EXPRESS_AI_URL || 'http://localhost:3002/api/v1';
        
        const response = await fetch(`${aiBaseUrl}/ads-copywriter${query}`, {
          method: req.method,
          headers: req.headers,
          body: bodyText
        });


        
        const text = await response.text();
        const data = text ? JSON.parse(text) : {};
        
        return NextResponse.json(data, { status: response.status });
      } catch (fallbackError) {
        console.error('AdRise proxy fallback error:', fallbackError);
      }
    }

    if (fallbackPath === 'ads-dashboard/summary') {
      const businessId = req.nextUrl.searchParams.get('businessId');
      const dateRange = req.nextUrl.searchParams.get('dateRange');
      const mock = buildMockSummary(businessId, dateRange);
      const wrapped = createSuccessResponse(mock, 'Ads dashboard summary (mock)', 200);

      return NextResponse.json(wrapped, { status: 200 });
    }

    console.error('Proxy error:', error);

    const errorResponse = createErrorResponse(
      'AdRise service unavailable',
      ErrorCode.INTERNAL_SERVER_ERROR,
      503,
      String(error)
    );

    return NextResponse.json(errorResponse, { status: 503 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
export const PATCH = proxy;
