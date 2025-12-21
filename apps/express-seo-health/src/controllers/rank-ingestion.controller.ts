import { Request, Response } from 'express';
import { keywordRankRepository, keywordRepository } from '@platform/db';
import { createSuccessResponse, createErrorResponse } from '@platform/contracts';
import type { BulkIngestRanksDTO } from '@platform/contracts';

export class RankIngestionController {
  /**
   * POST /api/ranks/ingest - Ingest rank data from external sources
   */
  async ingestRanks(req: Request, res: Response): Promise<void> {
    try {
      const { keywords }: BulkIngestRanksDTO = req.body;

      if (!Array.isArray(keywords) || keywords.length === 0) {
        res.status(400).json(createErrorResponse('keywords array is required', 400));
        return;
      }

      // Validate that all keyword IDs exist
      const keywordIds = keywords.map((k) => k.keywordId);
      const uniqueKeywordIds = [...new Set(keywordIds)];

      // You could add validation here to ensure keywords exist and belong to authenticated business
      // For now, we'll trust the input

      // Create rank records
      const rankData = keywords.map((k) => ({
        keywordId: k.keywordId,
        rankPosition: k.rankPosition,
        mapPackPosition: k.mapPackPosition,
        hasFeaturedSnippet: k.hasFeaturedSnippet ?? false,
        hasPeopleAlsoAsk: k.hasPeopleAlsoAsk ?? false,
        hasLocalPack: k.hasLocalPack ?? false,
        hasKnowledgePanel: k.hasKnowledgePanel ?? false,
        hasImagePack: k.hasImagePack ?? false,
        hasVideoCarousel: k.hasVideoCarousel ?? false,
        rankingUrl: k.rankingUrl,
        searchLocation: k.searchLocation,
        device: k.device ?? 'desktop',
        capturedAt: k.capturedAt ? new Date(k.capturedAt) : new Date(),
      }));

      const result = await keywordRankRepository.createBatch(rankData);

      res.status(201).json(
        createSuccessResponse({
          ingested: result.count,
          message: `${result.count} rank records ingested successfully`,
        })
      );
    } catch (error) {
      console.error('Error ingesting ranks:', error);
      res.status(500).json(createErrorResponse('Failed to ingest rank data', 500));
    }
  }

  /**
   * POST /api/ranks/ingest/csv - Upload and parse CSV file for rank data
   * Note: This would require multipart/form-data handling (multer or similar)
   */
  async ingestFromCSV(req: Request, res: Response): Promise<void> {
    try {
      // This would be implemented with a file upload middleware
      // For now, return a placeholder response
      res.status(501).json(
        createErrorResponse('CSV upload endpoint not yet implemented', 501)
      );
    } catch (error) {
      console.error('Error ingesting from CSV:', error);
      res.status(500).json(createErrorResponse('Failed to ingest from CSV', 500));
    }
  }
}

export const rankIngestionController = new RankIngestionController();
