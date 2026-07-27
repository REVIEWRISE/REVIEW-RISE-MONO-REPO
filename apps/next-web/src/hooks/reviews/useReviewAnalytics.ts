import { useQueryClient } from '@tanstack/react-query'

import { useApiGet, useApiPost } from '@/hooks/useApi'
import { SERVICES_CONFIG } from '@/configs/services'
import { resolveScopedLocationId } from '@/utils/locationId'

interface RatingTrendParams {
  businessId: string
  locationId?: string
  period?: number
}

interface VolumeParams {
  businessId: string
  locationId?: string
  period?: number
}

interface SentimentParams {
  businessId: string
  locationId?: string
  period?: number
  groupBy?: 'day' | 'week'
}

interface KeywordsParams {
  businessId: string
  locationId?: string
  limit?: number
}

interface SummaryParams {
  businessId: string
  locationId?: string
  limit?: number
}

interface MetricsParams {
  businessId: string
  locationId?: string
  period?: number
}

interface ComparisonParams {
  businessId: string
  locationId?: string
}

const REVIEWS_API = SERVICES_CONFIG.review.url

type AnalyticsQuery<T extends { businessId: string; locationId?: string }> = Omit<T, 'locationId'> & {
  locationId?: string
}

const toAnalyticsQuery = <T extends { businessId: string; locationId?: string }>(
  params: T
): AnalyticsQuery<T> => {
  const scopedLocationId = resolveScopedLocationId(params.locationId)
  const { locationId, ...rest } = params

  void locationId

  return scopedLocationId
    ? { ...rest, locationId: scopedLocationId }
    : { ...rest }
}

export const useRatingTrend = (params: RatingTrendParams) => {
  const query = toAnalyticsQuery(params)

  return useApiGet(
    ['analytics', 'rating-trend', params.businessId, query.locationId || 'all', String(params.period)],
    `${REVIEWS_API}/reviews/analytics/rating-trend`,
    query,
    { enabled: !!params.businessId }
  )
}

export const useReviewVolume = (params: VolumeParams) => {
  const query = toAnalyticsQuery(params)

  return useApiGet(
    ['analytics', 'volume', params.businessId, query.locationId || 'all', String(params.period)],
    `${REVIEWS_API}/reviews/analytics/volume`,
    query,
    { enabled: !!params.businessId }
  )
}

export const useSentimentHeatmap = (params: SentimentParams) => {
  const query = toAnalyticsQuery(params)

  return useApiGet(
    ['analytics', 'sentiment', params.businessId, query.locationId || 'all', String(params.period), params.groupBy || 'day'],
    `${REVIEWS_API}/reviews/analytics/sentiment`,
    query,
    { enabled: !!params.businessId }
  )
}

export const useTopKeywords = (params: KeywordsParams) => {
  const query = toAnalyticsQuery(params)

  return useApiGet(
    ['analytics', 'keywords', params.businessId, query.locationId || 'all', String(params.limit)],
    `${REVIEWS_API}/reviews/analytics/keywords`,
    query,
    { enabled: !!params.businessId }
  )
}

export const useRecentSummary = (params: SummaryParams) => {
  const query = toAnalyticsQuery(params)

  return useApiGet(
    ['analytics', 'summary', params.businessId, query.locationId || 'all', String(params.limit)],
    `${REVIEWS_API}/reviews/analytics/summary`,
    query,
    { enabled: !!params.businessId }
  )
}

export const useCompetitorComparison = (params: ComparisonParams) => {
  const query = toAnalyticsQuery(params)

  return useApiGet(
    ['analytics', 'competitor-comparison', params.businessId, query.locationId || 'all'],
    `${REVIEWS_API}/reviews/analytics/competitor-comparison`,
    query,
    { enabled: !!params.businessId }
  )
}

export const useAddCompetitor = () => {
  const queryClient = useQueryClient()

  return useApiPost(
    `${REVIEWS_API}/reviews/analytics/competitors`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['analytics', 'competitor-comparison'] })
      }
    }
  )
}

export const useDashboardMetrics = (params: MetricsParams) => {
  const query = toAnalyticsQuery(params)

  return useApiGet(
    ['analytics', 'metrics', params.businessId, query.locationId || 'all', String(params.period)],
    `${REVIEWS_API}/reviews/analytics/metrics`,
    query,
    { enabled: !!params.businessId }
  )
}

export const useReviewAnalytics = (businessId: string, locationId?: string, period = 30) => {
  const scopedLocationId = resolveScopedLocationId(locationId)

  const trend = useRatingTrend({ businessId, locationId: scopedLocationId, period })
  const volume = useReviewVolume({ businessId, locationId: scopedLocationId, period })
  const sentiment = useSentimentHeatmap({ businessId, locationId: scopedLocationId, period })
  const keywords = useTopKeywords({ businessId, locationId: scopedLocationId })
  const summary = useRecentSummary({ businessId, locationId: scopedLocationId })
  const comparison = useCompetitorComparison({ businessId, locationId: scopedLocationId })
  const metrics = useDashboardMetrics({ businessId, locationId: scopedLocationId, period })
  const addCompetitor = useAddCompetitor()

  return {
    ratingTrend: trend,
    volumeData: volume,
    sentimentData: sentiment,
    keywordsData: keywords,
    summaryData: summary,
    competitorData: comparison,
    dashboardMetrics: metrics,
    addCompetitor,
    isLoading: trend.isLoading || volume.isLoading || sentiment.isLoading || keywords.isLoading || summary.isLoading || comparison.isLoading || metrics.isLoading,
    isError: trend.isError || volume.isError || sentiment.isError || keywords.isError || summary.isError || comparison.isError || metrics.isError
  }
}
