import { Request, Response } from 'express';
import { visibilityMetricRepository, visibilityComputationService } from '@platform/db';
import { createSuccessResponse, createErrorResponse } from '@platform/contracts';

export class VisibilityController {
  /**
   * GET /api/visibility/metrics - Get visibility metrics
   */
  async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const {
        businessId,
        locationId,
        periodType,
        startDate,
        endDate,
        limit = 30,
        offset = 0,
      } = req.query;

      if (!businessId) {
        res.status(400).json(createErrorResponse('businessId is required', 400));
        return;
      }

      const metrics = await visibilityMetricRepository.findByBusiness(
        businessId as string,
        {
          locationId: locationId as string | undefined,
          periodType: periodType as string | undefined,
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
        }
      );

      res.json(
        createSuccessResponse(
          metrics.map((m) => ({
            id: m.id,
            businessId: m.businessId,
            locationId: m.locationId || undefined,
            periodStart: m.periodStart.toISOString(),
            periodEnd: m.periodEnd.toISOString(),
            periodType: m.periodType,
            mapPackAppearances: m.mapPackAppearances,
            totalTrackedKeywords: m.totalTrackedKeywords,
            mapPackVisibility: m.mapPackVisibility,
            top3Count: m.top3Count,
            top10Count: m.top10Count,
            top20Count: m.top20Count,
            shareOfVoice: m.shareOfVoice,
            featuredSnippetCount: m.featuredSnippetCount,
            localPackCount: m.localPackCount,
            computedAt: m.computedAt.toISOString(),
            createdAt: m.createdAt.toISOString(),
          }))
        )
      );
    } catch (error) {
      console.error('Error fetching visibility metrics:', error);
      res.status(500).json(createErrorResponse('Failed to fetch visibility metrics', 500));
    }
  }

  /**
   * GET /api/visibility/share-of-voice - Get Share of Voice data with breakdown
   */
  async getShareOfVoice(req: Request, res: Response): Promise<void> {
    try {
      const { businessId, locationId, startDate, endDate } = req.query;

      if (!businessId || !startDate || !endDate) {
        res
          .status(400)
          .json(createErrorResponse('businessId, startDate, and endDate are required', 400));
        return;
      }

      const sovData = await visibilityComputationService.computeShareOfVoice(
        businessId as string,
        (locationId as string) || null,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json(
        createSuccessResponse({
          businessId,
          locationId: locationId || undefined,
          shareOfVoice: sovData.shareOfVoice,
          breakdown: sovData.breakdown,
          periodStart: (startDate as string),
          periodEnd: (endDate as string),
        })
      );
    } catch (error) {
      console.error('Error computing Share of Voice:', error);
      res.status(500).json(createErrorResponse('Failed to compute Share of Voice', 500));
    }
  }

  /**
   * GET /api/visibility/serp-features - Get SERP feature presence data
   */
  async getSerpFeatures(req: Request, res: Response): Promise<void> {
    try {
      const { businessId, locationId, startDate, endDate } = req.query;

      if (!businessId || !startDate || !endDate) {
        res
          .status(400)
          .json(createErrorResponse('businessId, startDate, and endDate are required', 400));
        return;
      }

      const serpData = await visibilityComputationService.trackSerpFeatures(
        businessId as string,
        (locationId as string) || null,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json(
        createSuccessResponse({
          businessId,
          locationId: locationId || undefined,
          periodStart: startDate,
          periodEnd: endDate,
          features: {
            featuredSnippet: serpData.featuredSnippetCount,
            localPack: serpData.localPackCount,
            // Add other SERP features if needed
          },
        })
      );
    } catch (error) {
      console.error('Error fetching SERP features:', error);
      res.status(500).json(createErrorResponse('Failed to fetch SERP features', 500));
    }
  }

  /**
   * GET /api/visibility/heatmap - Get heatmap data
   */
  async getHeatmapData(req: Request, res: Response): Promise<void> {
    try {
      const { businessId, locationId, startDate, endDate, metric = 'rank' } = req.query;

      if (!businessId || !startDate || !endDate) {
        res
          .status(400)
          .json(createErrorResponse('businessId, startDate, and endDate are required', 400));
        return;
      }

      // This is a simplified implementation
      // In a real scenario, you'd build the 2D matrix based on keywords and time periods

      res.json(
        createSuccessResponse({
          businessId,
          locationId: locationId || undefined,
          keywords: [], // Array of keyword names
          periods: [], // Array of time period labels
          data: [], // 2D array of metric values
          metric: metric as string,
        })
      );
    } catch (error) {
      console.error('Error generating heatmap data:', error);
      res.status(500).json(createErrorResponse('Failed to generate heatmap data', 500));
    }
  }

  /**
   * POST /api/visibility/compute - Manually trigger metric computation
   */
  async computeMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { businessId, locationId, periodType, periodStart, periodEnd } = req.body;

      if (!businessId || !periodType || !periodStart || !periodEnd) {
        res
          .status(400)
          .json(
            createErrorResponse(
              'businessId, periodType, periodStart, and periodEnd are required',
              400
            )
          );
        return;
      }

      await visibilityComputationService.computeAllMetrics(
        businessId,
        locationId || null,
        periodType,
        new Date(periodStart),
        new Date(periodEnd)
      );

      res.json(
        createSuccessResponse({
          message: 'Metrics computed successfully',
          businessId,
          periodType,
        })
      );
    } catch (error) {
      console.error('Error computing metrics:', error);
      res.status(500).json(createErrorResponse('Failed to compute metrics', 500));
    }
  }
}

export const visibilityController = new VisibilityController();
