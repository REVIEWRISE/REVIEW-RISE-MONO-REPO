import type { Request, Response } from 'express';
import { z } from 'zod';
import { createErrorResponse, createSuccessResponse, SystemMessageCode } from '@platform/contracts';
import { adsDashboardService } from '../services/ads-dashboard.service';

const summaryQuerySchema = z.object({
  businessId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  dateRange: z.enum(['7D', '30D', '90D']).optional()
});

const copyRequestSchema = z.object({
  businessId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  template: z.string().min(1),
  goal: z.string().optional(),
  offer: z.string().optional(),
  tone: z.string().optional(),
  keywords: z.array(z.string()).default([])
});

export class AdsDashboardController {
  async getSummary(req: Request, res: Response) {
    try {
      const query = summaryQuerySchema.parse(req.query);
      const summary = adsDashboardService.getSummary({
        businessId: query.businessId,
        locationId: query.locationId,
        dateRange: query.dateRange ?? '30D'
      });

      const response = createSuccessResponse(summary, 'Ads dashboard summary fetched', 200, { requestId: req.id });
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      console.error('Failed to fetch ads dashboard summary', error);
      const response = createErrorResponse(
        'Failed to fetch ads dashboard summary',
        SystemMessageCode.INTERNAL_SERVER_ERROR,
        500,
        error?.message,
        req.id
      );
      res.status(response.statusCode).json(response);
    }
  }

  async generateCopy(req: Request, res: Response) {
    try {
      const payload = copyRequestSchema.parse(req.body);
      const output = await adsDashboardService.generateCopy(payload);
      const response = createSuccessResponse(output, 'Ad copy generated', 200, { requestId: req.id });
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      console.error('Failed to generate ad copy', error);
      const response = createErrorResponse(
        'Failed to generate ad copy',
        SystemMessageCode.INTERNAL_SERVER_ERROR,
        500,
        error?.message,
        req.id
      );
      res.status(response.statusCode).json(response);
    }
  }

  async applyAlert(req: Request, res: Response) {
    try {
      const { alertId } = req.params;
      const response = createSuccessResponse({ applied: true, alertId }, 'Optimization applied', 200, { requestId: req.id });
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      console.error('Failed to apply optimization', error);
      const response = createErrorResponse(
        'Failed to apply optimization',
        SystemMessageCode.INTERNAL_SERVER_ERROR,
        500,
        error?.message,
        req.id
      );
      res.status(response.statusCode).json(response);
    }
  }
}

export const adsDashboardController = new AdsDashboardController();
