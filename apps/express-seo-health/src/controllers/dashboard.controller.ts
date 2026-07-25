import { Request, Response } from 'express';
import { createSuccessResponse, createErrorResponse } from '@platform/contracts';
import { businessRepository, seoSnapshotRepository, visibilityMetricRepository, locationRepository } from '@platform/db';

export const getDashboardSummary = async (req: Request, res: Response): Promise<void> => {
    try {
        const inputLocationId = (req.query.locationId as string) || (req.params.locationId as string);
        const inputBusinessId = req.query.businessId as string;

        let businessId = inputBusinessId;

        // Resolve businessId if only locationId is provided
        if (!businessId) {
            if (inputLocationId && inputLocationId !== 'all') {
                const location = await locationRepository.findById(inputLocationId);
                if (location) {
                    businessId = location.businessId;
                }
            } else if (inputLocationId === 'all') {
                const firstBusiness = await businessRepository.findFirst({
                    where: { deletedAt: null }
                });
                if (firstBusiness) {
                    businessId = firstBusiness.id;
                }
            }
        }

        // Wait, what if locationId === 'all'? Usually it's meant to aggregate. 
        // For SEO, we need a businessId. If 'all', and no businessId is provided, we might fail.
        // But for dashboard, 'all' without businessId means "all businesses", but SEO snapshot is per url.
        // Actually HomeDashboard has locationFilter which might be 'all' early on. In that case, it relies on the user's default business.
        // But currently let's just make sure we check businessId exists.

        if (!businessId) {
            const errorResponse = createErrorResponse('businessId or locationId is required', 'BAD_REQUEST' as any, 400, undefined, req.id);
            res.status(errorResponse.statusCode).json(errorResponse);
            return;
        }

        const business = await businessRepository.findById(businessId);

        let seoScore = 0;
        let seoFixes: string[] = [];
        let seoChange = 0;

        if (business && business.website) {
            let websiteUrl = business.website;
            if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
                websiteUrl = 'https://' + websiteUrl;
            }

            const snapshots = await seoSnapshotRepository.findByUrl(websiteUrl);

            if (snapshots.length > 0) {
                const latest = snapshots[0];
                seoScore = latest.healthScore || 0;

                const recs = Array.isArray(latest.recommendations) ? latest.recommendations : [];
                seoFixes = recs.slice(0, 3).map((r: any) => `${r.issue} - ${r.recommendation}`);

                if (snapshots.length > 1) {
                    const previous = snapshots[1];
                    seoChange = seoScore - (previous.healthScore || 0);
                }
            }
        }

        // Fetch 7-day visibility trend as a proxy for SEO trends if no historical snapshots
        const endDate = new Date();

        // Native date handling equivalent to startOfDay(subDays(endDate, 6))
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);

        const metrics = await visibilityMetricRepository.findMany({
            where: {
                businessId,
                periodType: 'daily',
                periodStart: {
                    gte: startDate
                }
            },
            orderBy: {
                periodStart: 'asc'
            }
        });

        // Initialize 7 days trend
        const trends = [];
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 6; i >= 0; i--) {
            const d = new Date(endDate);
            d.setDate(d.getDate() - i);
            const dateStr = daysOfWeek[d.getDay()];

            const dStrFormatted = d.toISOString().split('T')[0];
            const metric = metrics.find(m => new Date(m.periodStart).toISOString().split('T')[0] === dStrFormatted);

            // We use shareOfVoice or mapPackVisibility as a proxy for seo trend, scaled to 100
            // If we have a snapshot score, we can use it, but trend requires daily data.
            trends.push({
                date: dateStr,
                seo: metric ? Math.round(metric.shareOfVoice * 100) : (seoScore > 0 ? seoScore : 0)
            });
        }

        const data = {
            seoScore,
            seoFixes: seoFixes.length > 0 ? seoFixes : ['No critical issues found'],
            trends,
            weeklyDigest: {
                seoChange,
            }
        };

        const response = createSuccessResponse(
            data,
            'Dashboard summary retrieved successfully',
            200,
            { requestId: req.id },
            'SUCCESS' as any
        );

        res.status(response.statusCode).json(response);
    } catch (error: any) {
        const response = createErrorResponse(
            error.message || 'Failed to retrieve dashboard summary',
            'INTERNAL_SERVER_ERROR' as any,
            500,
            process.env.NODE_ENV === 'development' ? error.stack : undefined,
            req.id
        );
        res.status(response.statusCode).json(response);
    }
};
