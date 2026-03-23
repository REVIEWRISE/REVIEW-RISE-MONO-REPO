/* eslint-disable import/no-unresolved */
import type { AdsCopyRequest, AdsCopyResponse, AdsDashboardSummary } from '@platform/contracts';
import apiClient from '@/lib/apiClient';

const resolveBaseUrl = () => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_AD_RISE_API_URL || 'http://localhost:3100/api/v1';
  }

  return '/api/ad-rise';
};

export const AdsDashboardService = {
  getSummary: async (params: { businessId?: string; locationId?: string; dateRange: string }) => {
    try {
      const response = await apiClient.get<AdsDashboardSummary>(`${resolveBaseUrl()}/ads-dashboard/summary`, {
        params,
        headers: { 'x-skip-system-message': '1' }
      });

      return response.data;
    } catch (error: any) {
      const status = error?.response?.status;

      if (!status && error?.code === 'ERR_NETWORK') {
        return {
          data: null,
          unavailable: true,
          message: 'Ads service is offline'
        };
      }

      if (status === 503) {
        return {
          data: null,
          unavailable: true,
          message: 'Ads service is offline'
        };
      }

      if (error?.response) {
        throw error;
      }

      return {
        data: null,
        unavailable: true,
        message: 'Ads service is offline'
      };
    }
  },
  generateCopy: async (payload: AdsCopyRequest) => {
    const response = await apiClient.post<AdsCopyResponse>(`${resolveBaseUrl()}/ads-dashboard/copywriter`, payload, {
      headers: { 'x-skip-system-message': '1' }
    });

    return response.data;
  },
  applyAlert: async (alertId: string) => {
    const response = await apiClient.post<{ applied: boolean; alertId: string }>(
      `${resolveBaseUrl()}/ads-dashboard/alerts/${alertId}/apply`,
      undefined,
      { headers: { 'x-skip-system-message': '1' } }
    );

    return response.data;
  }
};
