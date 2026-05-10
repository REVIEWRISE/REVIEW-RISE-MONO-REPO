"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visibilityMetricRepository = exports.VisibilityMetricRepository = void 0;
const base_repository_1 = require("./base.repository");
const client_1 = require("../client");
class VisibilityMetricRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_1.prisma.visibilityMetric, 'VisibilityMetric');
    }
    /**
     * Find metrics for a business with optional filters
     */
    async findByBusiness(businessId, filters) {
        const where = {
            businessId,
            ...(filters?.locationId && { locationId: filters.locationId }),
            ...(filters?.periodType && { periodType: filters.periodType }),
            ...(filters?.startDate || filters?.endDate
                ? {
                    periodStart: {
                        ...(filters.startDate && { gte: filters.startDate }),
                        ...(filters.endDate && { lte: filters.endDate }),
                    },
                }
                : {}),
        };
        return this.delegate.findMany({
            where,
            orderBy: { periodStart: 'desc' },
            take: filters?.limit,
            skip: filters?.offset,
        });
    }
    /**
     * Get metrics for a specific period
     */
    async findByPeriod(businessId, periodType, startDate, endDate) {
        return this.delegate.findMany({
            where: {
                businessId,
                periodType,
                periodStart: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: { periodStart: 'asc' },
        });
    }
    /**
     * Get the latest metric for a business/location
     */
    async getLatestMetric(businessId, locationId, periodType) {
        return this.delegate.findFirst({
            where: {
                businessId,
                ...(locationId && { locationId }),
                ...(periodType && { periodType }),
            },
            orderBy: { periodStart: 'desc' },
        });
    }
    /**
     * Upsert a visibility metric
     */
    async upsertMetric(businessId, locationId, periodStart, periodEnd, periodType, data) {
        // Check if metric exists
        const existing = await this.delegate.findFirst({
            where: {
                businessId,
                locationId: locationId || null,
                periodStart,
                periodEnd,
                periodType,
            },
        });
        if (existing) {
            return this.delegate.update({
                where: { id: existing.id },
                data: {
                    ...data,
                    computedAt: new Date(),
                },
            });
        }
        return this.delegate.create({
            data: {
                business: {
                    connect: { id: businessId },
                },
                ...(locationId && {
                    location: {
                        connect: { id: locationId },
                    },
                }),
                periodStart,
                periodEnd,
                periodType,
                ...data,
            },
        });
    }
    /**
     * Get metrics trend over time
     */
    async getTrend(businessId, periodType, numberOfPeriods, locationId) {
        return this.delegate.findMany({
            where: {
                businessId,
                periodType,
                ...(locationId && { locationId }),
            },
            orderBy: { periodStart: 'desc' },
            take: numberOfPeriods,
        });
    }
    /**
     * Get average metrics over a period
     */
    async getAverageMetrics(businessId, startDate, endDate, locationId) {
        const result = await this.delegate.aggregate({
            where: {
                businessId,
                ...(locationId && { locationId }),
                periodStart: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            _avg: {
                mapPackVisibility: true,
                top3Count: true,
                top10Count: true,
                top20Count: true,
                shareOfVoice: true,
            },
        });
        return {
            avgMapPackVisibility: result._avg.mapPackVisibility,
            avgTop3Count: result._avg.top3Count,
            avgTop10Count: result._avg.top10Count,
            avgTop20Count: result._avg.top20Count,
            avgShareOfVoice: result._avg.shareOfVoice,
        };
    }
    /**
     * Compare metrics between two periods
     */
    async comparePeriods(businessId, period1Start, period1End, period2Start, period2End, locationId) {
        const [period1, period2] = await Promise.all([
            this.findByPeriod(businessId, 'daily', period1Start, period1End),
            this.findByPeriod(businessId, 'daily', period2Start, period2End),
        ]);
        return { period1, period2 };
    }
    /**
     * Delete old metrics (for data retention)
     */
    async deleteOlderThan(cutoffDate) {
        return this.delegate.deleteMany({
            where: {
                periodStart: {
                    lt: cutoffDate,
                },
            },
        });
    }
}
exports.VisibilityMetricRepository = VisibilityMetricRepository;
// Export singleton instance
exports.visibilityMetricRepository = new VisibilityMetricRepository();
