import { Request, Response } from 'express';
import { createSuccessResponse, createErrorResponse, SystemMessageCode } from '@platform/contracts';
import { reviewSourceRepository, reviewRepository, platformIntegrationRepository, SYNCED_REVIEW_WHERE } from '@platform/db';
import { reviewSyncService } from '../services/review-sync.service';
import * as reviewService from '../services/review.service';

export const listReviewSources = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;

        const sources = await reviewSourceRepository.findByLocationId(locationId);

        // Sanitize secrets before returning
        const sanitizedSources = sources.map(source => ({
            id: source.id,
            locationId: source.locationId,
            platform: source.platform,
            status: source.status,
            createdAt: source.createdAt,
            updatedAt: source.updatedAt,
            // Exclude tokens
        }));

        const response = createSuccessResponse(sanitizedSources, 'Review sources fetched successfully', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);
        res.status(response.statusCode).json(response);
    } catch (error: any) {
        console.error('List review sources error:', error);
        const response = createErrorResponse('Internal server error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const listLocationReviews = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;
        const {
            page,
            limit,
            platform,
            rating,
            startDate,
            endDate,
            sentiment,
            replyStatus,
            search,
        } = req.query;

        const result = await reviewService.listReviewsByLocation({
            locationId,
            page: page ? parseInt(page as string, 10) : 1,
            limit: limit ? parseInt(limit as string, 10) : 20,
            platform: platform as string | undefined,
            rating: rating ? parseInt(rating as string, 10) : undefined,
            startDate: startDate as string | undefined,
            endDate: endDate as string | undefined,
            sentiment: sentiment as string | undefined,
            replyStatus: replyStatus as string | undefined,
        });

        let reviews = result.reviews;

        if (search && typeof search === 'string' && search.trim()) {
            const term = search.trim().toLowerCase();
            reviews = reviews.filter(
                (r) =>
                    (r.content?.toLowerCase().includes(term) ?? false) ||
                    (r.author?.toLowerCase().includes(term) ?? false)
            );
        }

        const response = createSuccessResponse(
            { reviews, pagination: result.pagination },
            'Reviews fetched successfully',
            200,
            { requestId: req.id },
            SystemMessageCode.SUCCESS
        );
        res.status(response.statusCode).json(response);
    } catch (error: any) {
        console.error('List reviews error:', error);
        const response = createErrorResponse('Internal server error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const disconnectReviewSource = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // review source id

        // Soft delete? For now, we can update status to 'disconnected' or delete
        // If we delete, we might lose history. Let's update status.
        // But schema says deletedAt is not on ReviewSource. 
        // Let's delete it for now to allow re-connection cleanly, or introduce status update.
        await reviewSourceRepository.delete(id);

        const response = createSuccessResponse({}, 'Review source disconnected successfully', 200, { requestId: req.id }, SystemMessageCode.REVIEWS_SOURCE_DISCONNECTED);
        res.status(response.statusCode).json(response);
    } catch (error: any) {
        console.error('Disconnect review source error:', error);
        const response = createErrorResponse('Internal server error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
        res.status(response.statusCode).json(response);
    }
};


export const getReviewStats = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;
        const reviews = await reviewRepository.findByLocationId(locationId);
        const sources = await reviewSourceRepository.findActiveByLocationId(locationId);
        
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0 
            ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / totalReviews 
            : 0;

        const unrepliedCount = reviews.filter((r) => !r.response).length;
        const repliedCount = totalReviews - unrepliedCount;
        const responseRate = totalReviews > 0 ? Math.round((repliedCount / totalReviews) * 100) : 0;

        const positiveCount = reviews.filter((r) => r.sentiment?.toLowerCase() === 'positive').length;
        const neutralCount = reviews.filter((r) => r.sentiment?.toLowerCase() === 'neutral').length;
        const negativeCount = reviews.filter((r) => r.sentiment?.toLowerCase() === 'negative').length;
        const analyzedCount = positiveCount + neutralCount + negativeCount;

        const positiveSentiment = analyzedCount > 0
            ? Math.round((positiveCount / analyzedCount) * 100)
            : 0;

        const responseDurations = reviews
            .filter((r) => r.respondedAt && r.publishedAt)
            .map((r) => new Date(r.respondedAt!).getTime() - new Date(r.publishedAt).getTime())
            .filter((ms) => ms >= 0);

        const avgResponseTimeHours = responseDurations.length > 0
            ? Number((responseDurations.reduce((a, b) => a + b, 0) / responseDurations.length / (1000 * 60 * 60)).toFixed(1))
            : null;

        const platformStats = new Map<string, { total: number; ratingSum: number }>();
        reviews.forEach((review) => {
            const key = review.platform === 'gbp' ? 'google' : review.platform;
            const existing = platformStats.get(key) || { total: 0, ratingSum: 0 };
            platformStats.set(key, {
                total: existing.total + 1,
                ratingSum: existing.ratingSum + (review.rating || 0),
            });
        });

        const platformBreakdown = Array.from(platformStats.entries()).map(([platform, stats]) => ({
            platform,
            totalReviews: stats.total,
            averageRating: Number((stats.ratingSum / stats.total).toFixed(1)),
        }));

        const platforms = [...new Set(sources.map(s => s.platform))];

        const response = createSuccessResponse({
            totalReviews,
            averageRating: Number(averageRating.toFixed(1)),
            platforms,
            unrepliedCount,
            responseRate,
            positiveSentiment,
            avgResponseTimeHours,
            platformBreakdown,
            sentimentBreakdown: {
                positive: analyzedCount > 0 ? Math.round((positiveCount / analyzedCount) * 100) : 0,
                neutral: analyzedCount > 0 ? Math.round((neutralCount / analyzedCount) * 100) : 0,
                negative: analyzedCount > 0 ? Math.round((negativeCount / analyzedCount) * 100) : 0,
            },
        }, 'Review stats fetched successfully', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);
        res.status(response.statusCode).json(response);
    } catch (error: any) {
        console.error('Get review stats error:', error);
        const response = createErrorResponse('Internal server error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const syncReviews = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;
        const platform = (req.body?.platform || req.query?.platform) as string | undefined;

        const results = await reviewSyncService.syncReviewsForLocation(locationId, platform);

        if (!results.length) {
            const response = createErrorResponse(
                'No active review sources found. Enable Google review sync first.',
                SystemMessageCode.VALIDATION_ERROR,
                400,
                undefined,
                req.id
            );
            return res.status(response.statusCode).json(response);
        }

        const failed = results.filter((result) => result.status === 'failed');
        const totalSynced = results.reduce((sum, result) => sum + (result.reviewsSynced || 0), 0);

        if (failed.length === results.length) {
            const response = createErrorResponse(
                failed[0]?.errorMessage || 'Review sync failed',
                SystemMessageCode.INTERNAL_SERVER_ERROR,
                502,
                { results },
                req.id
            );
            return res.status(response.statusCode).json(response);
        }

        const message = totalSynced > 0
            ? `Synced ${totalSynced} review${totalSynced === 1 ? '' : 's'} successfully`
            : failed.length > 0
                ? 'Sync completed with warnings'
                : 'Sync completed — no new reviews found on Google';

        const response = createSuccessResponse(
            { results, totalSynced },
            message,
            200,
            { requestId: req.id },
            SystemMessageCode.REVIEWS_SYNC_COMPLETED
        );
        res.status(response.statusCode).json(response);
    } catch (error: any) {
        console.error('Sync reviews error:', error);
        const response = createErrorResponse('Internal server error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const enableGoogleSync = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;

        // Verify that a valid Google PlatformIntegration exists
        const integration = await platformIntegrationRepository.findByLocationIdAndPlatform(locationId, 'google');
        
        if (!integration || integration.status !== 'active') {
            const response = createErrorResponse('No active Google integration found. Please connect your account first.', SystemMessageCode.UNAUTHORIZED, 400, undefined, req.id);
            return res.status(response.statusCode).json(response);
        }

        // Upsert a ReviewSource record indicating that Google sync is enabled for this location
        // Note: The ReviewSource no longer holds tokens; it merely acts as a flag/config
        await reviewSourceRepository.upsertLocationPlatform(locationId, 'google');

        const syncResults = await reviewSyncService.syncReviewsForLocation(locationId);

        const response = createSuccessResponse({ syncResults }, 'Google Review Sync enabled successfully', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);
        res.status(response.statusCode).json(response);
    } catch (error: any) {
        console.error('Enable Google sync error:', error);
        const response = createErrorResponse('Internal server error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const getLocationKeywords = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;
        const { timeRange = '30d' } = req.query;

        // Calculate date range
        const now = new Date();
        const startDate = new Date();
        
        switch (timeRange) {
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '90d':
                startDate.setDate(now.getDate() - 90);
                break;
            case '30d':
            default:
                startDate.setDate(now.getDate() - 30);
                break;
        }

        // Fetch reviews in the time range
        const reviews = await reviewRepository.findMany({
            where: {
                locationId,
                ...SYNCED_REVIEW_WHERE,
                publishedAt: {
                    gte: startDate
                }
            }
        });

        // Aggregate keywords from tags
        const keywordCounts = new Map<string, number>();
        
        reviews.forEach(review => {
            review.tags.forEach(tag => {
                const count = keywordCounts.get(tag) || 0;
                keywordCounts.set(tag, count + 1);
            });
        });

        // Convert to array and sort by count
        const keywords = Array.from(keywordCounts.entries())
            .map(([keyword, count]) => ({ keyword, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 20); // Top 20 keywords

        const response = createSuccessResponse({ keywords }, 'Keywords fetched successfully', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);
        res.status(response.statusCode).json(response);
    } catch (error: any) {
        console.error('Get location keywords error:', error);
        const response = createErrorResponse('Internal server error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
        res.status(response.statusCode).json(response);
    }
};
