export type AdsDateRange = '7D' | '30D' | '90D';

export type AdsPlatformKey = 'google' | 'meta';

export interface AdsPlatformMetrics {
  platform: AdsPlatformKey;
  spend: number;
  roas: number;
  cpc: number;
  ctr: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpl: number;
  impressionShare?: number;
  keywords?: number;
  frequency?: number;
  reach?: number;
  engagement?: number;
}

export interface AdsEfficiencyEntry {
  platform: string;
  cpl: number;
}

export interface AdsOptimizationAlert {
  id: string;
  type: 'budget_shift' | 'ad_fatigue' | 'cannibalization';
  title: string;
  impact: string;
  recommendation: string;
  severity: 'low' | 'medium' | 'high';
  actionLabel: string;
  actionType: 'apply' | 'how_to';
  steps?: string[];
}

export interface AdsLeadLogEntry {
  id: string;
  occurredAt: string;
  type: 'Call' | 'Form' | 'Booking';
  source: string;
  value?: number;
}

export interface AdsFunnelMetrics {
  impressions: number;
  clicks: number;
  visits: number;
  conversions: number;
}

export interface AdsDashboardSummary {
  dateRange: AdsDateRange;
  totalSpend: number;
  roas: number;
  deltas: {
    spend: number;
    cpc: number;
    ctr: number;
  };
  google: AdsPlatformMetrics;
  meta: AdsPlatformMetrics;
  efficiency: AdsEfficiencyEntry[];
  optimizationFeed: AdsOptimizationAlert[];
  leadLog: AdsLeadLogEntry[];
  funnel: AdsFunnelMetrics;
}

export interface AdsCopyRequest {
  businessId?: string;
  locationId?: string;
  template: string;
  goal?: string;
  offer?: string;
  tone?: string;
  keywords: string[];
}

import { z } from 'zod';

export const AdsCopyRequestSchema = z.object({
  businessId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  template: z.string().min(1),
  goal: z.string().optional(),
  offer: z.string().optional(),
  tone: z.string().optional(),
  keywords: z.array(z.string()).default([])
});

export const AdsCopyResponseSchema = z.object({
  headlines: z.array(z.string()),
  descriptions: z.array(z.string()),
  primaryTexts: z.array(z.string()),
  keywordsUsed: z.array(z.string())
});

export interface AdsCopyResponse {
  headlines: string[];
  descriptions: string[];
  primaryTexts: string[];
  keywordsUsed: string[];
}
