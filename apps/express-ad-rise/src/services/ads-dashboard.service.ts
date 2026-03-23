import type {
  AdsCopyRequest,
  AdsCopyResponse,
  AdsDashboardSummary,
  AdsDateRange,
  AdsOptimizationAlert,
  AdsPlatformMetrics,
  AdsLeadLogEntry
} from '@platform/contracts';
import { apiClient } from '@platform/utils/apiClient';

const rangeMultipliers: Record<AdsDateRange, number> = {
  '7D': 0.35,
  '30D': 1,
  '90D': 2.7
};

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash);
};

const seeded = (seed: number, min: number, max: number) => {
  const x = Math.sin(seed) * 10000;
  const frac = x - Math.floor(x);
  return min + frac * (max - min);
};

const round = (value: number, decimals = 2) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const buildPlatformMetrics = (
  platform: 'google' | 'meta',
  seed: number,
  totalSpend: number
): AdsPlatformMetrics => {
  const spendShare = platform === 'google' ? 0.58 : 0.42;
  const spend = round(totalSpend * spendShare, 2);
  const roasBase = platform === 'google' ? 3.4 : 2.6;
  const roas = round(roasBase + seeded(seed + 11, -0.4, 0.5), 2);
  const cpcBase = platform === 'google' ? 1.85 : 0.95;
  const cpc = round(cpcBase + seeded(seed + 19, -0.2, 0.25), 2);
  const ctrBase = platform === 'google' ? 4.2 : 2.8;
  const ctr = round(ctrBase + seeded(seed + 29, -0.6, 0.6), 2);
  const impressions = Math.round(seeded(seed + 31, 38000, 125000));
  const clicks = Math.max(120, Math.round((impressions * ctr) / 100));
  const conversions = Math.max(8, Math.round(clicks * seeded(seed + 37, 0.06, 0.12)));
  const cpl = round(spend / conversions, 2);

  const metrics: AdsPlatformMetrics = {
    platform,
    spend,
    roas,
    cpc,
    ctr,
    impressions,
    clicks,
    conversions,
    cpl
  };

  if (platform === 'google') {
    metrics.impressionShare = round(clamp(seeded(seed + 41, 62, 92), 35, 98), 1);
    metrics.keywords = Math.round(seeded(seed + 43, 24, 58));
  } else {
    metrics.frequency = round(clamp(seeded(seed + 45, 1.4, 2.9), 1.1, 3.2), 2);
    metrics.reach = Math.round(seeded(seed + 47, 22000, 78000));
    metrics.engagement = Math.round(seeded(seed + 49, 1200, 4500));
  }

  return metrics;
};

const buildOptimizationFeed = (seed: number): AdsOptimizationAlert[] => {
  return [
    {
      id: `budget-${seed}`,
      type: 'budget_shift',
      title: 'Shift budget toward Google Search winners',
      impact: 'Projected +12% conversions if moved this week.',
      recommendation: 'Reallocate 15% of Meta prospecting spend to top search ad groups.',
      severity: 'high',
      actionLabel: 'Apply shift',
      actionType: 'apply'
    },
    {
      id: `fatigue-${seed}`,
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
    },
    {
      id: `cannibal-${seed}`,
      type: 'cannibalization',
      title: 'Organic rank #1 overlaps with paid search',
      impact: 'Potential wasted spend on branded terms.',
      recommendation: 'Reduce bids on branded keywords or switch to exact match only.',
      severity: 'low',
      actionLabel: 'How to adjust',
      actionType: 'how_to',
      steps: [
        'Lower bids on branded keywords by 20-30%.',
        'Add negatives for redundant variants.',
        'Monitor impression share after 72 hours.'
      ]
    }
  ];
};

export class AdsDashboardService {
  getSummary(params: {
    businessId?: string;
    locationId?: string;
    dateRange: AdsDateRange;
  }): AdsDashboardSummary {
    const seedBase = hashString(`${params.businessId || 'business'}-${params.locationId || 'location'}`);
    const multiplier = rangeMultipliers[params.dateRange];
    const totalSpend = round(seeded(seedBase, 2400, 8200) * multiplier, 2);

    const google = buildPlatformMetrics('google', seedBase, totalSpend);
    const meta = buildPlatformMetrics('meta', seedBase + 7, totalSpend);

    const roas = round((google.roas * google.spend + meta.roas * meta.spend) / Math.max(1, totalSpend), 2);

    const prevSpend = totalSpend * seeded(seedBase + 3, 0.84, 1.12);
    const prevCpc = (google.cpc + meta.cpc) / 2 * seeded(seedBase + 5, 0.88, 1.1);
    const prevCtr = (google.ctr + meta.ctr) / 2 * seeded(seedBase + 9, 0.82, 1.15);

    const deltas = {
      spend: round(((totalSpend - prevSpend) / prevSpend) * 100, 1),
      cpc: round((((google.cpc + meta.cpc) / 2 - prevCpc) / prevCpc) * 100, 1),
      ctr: round((((google.ctr + meta.ctr) / 2 - prevCtr) / prevCtr) * 100, 1)
    };

    const funnel = {
      impressions: google.impressions + meta.impressions,
      clicks: google.clicks + meta.clicks,
      visits: Math.round((google.clicks + meta.clicks) * 0.82),
      conversions: google.conversions + meta.conversions
    };

    const efficiency = [
      { platform: 'Google Ads', cpl: google.cpl },
      { platform: 'Meta Ads', cpl: meta.cpl }
    ].sort((a, b) => a.cpl - b.cpl);

    const leadLog: AdsLeadLogEntry[] = [
      {
        id: `lead-${seedBase}-1`,
        occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        type: 'Call',
        source: 'Google Search - Pizza Delivery',
        value: round(seeded(seedBase + 101, 18, 48), 2)
      },
      {
        id: `lead-${seedBase}-2`,
        occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        type: 'Form',
        source: 'Meta Leads - Weekend Promo',
        value: round(seeded(seedBase + 103, 12, 36), 2)
      },
      {
        id: `lead-${seedBase}-3`,
        occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
        type: 'Booking',
        source: 'Google Search - Home Cleaning',
        value: round(seeded(seedBase + 105, 24, 78), 2)
      },
      {
        id: `lead-${seedBase}-4`,
        occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
        type: 'Form',
        source: 'Meta Retargeting - Spring Offer',
        value: round(seeded(seedBase + 107, 9, 29), 2)
      }
    ];

    return {
      dateRange: params.dateRange,
      totalSpend,
      roas,
      deltas,
      google,
      meta,
      efficiency,
      optimizationFeed: buildOptimizationFeed(seedBase),
      leadLog,
      funnel
    };
  }

  async generateCopy(request: AdsCopyRequest): Promise<AdsCopyResponse> {
    const aiBaseUrl = process.env.AI_SERVICE_URL || 'http://localhost:3002';
    const response = await apiClient.post<any>(`${aiBaseUrl}/api/v1/ads-copywriter`, request);
    return response.data.data || response.data;
  }
}

export const adsDashboardService = new AdsDashboardService();
