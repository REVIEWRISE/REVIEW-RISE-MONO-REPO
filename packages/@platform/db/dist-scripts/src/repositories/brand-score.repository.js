"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.brandScoreRepository = exports.BrandScoreRepository = void 0;
const client_1 = require("../client");
const base_repository_1 = require("./base.repository");
/**
 * Brand Score Repository
 *
 * Handles all database operations related to brand health scores.
 * Provides type-safe methods for score tracking, historical analysis, and trend monitoring.
 */
class BrandScoreRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_1.prisma.brandScore, 'BrandScore');
    }
    /**
     * Find latest score by business ID
     */
    async findLatestByBusinessId(businessId) {
        return this.delegate.findFirst({
            where: { businessId },
            orderBy: { computedAt: 'desc' },
        });
    }
    /**
     * Find score by business ID and period
     */
    async findByBusinessIdAndPeriod(businessId, periodStart, periodEnd) {
        return this.delegate.findFirst({
            where: {
                businessId,
                periodStart,
                periodEnd,
            },
        });
    }
    /**
     * Get score history for a business
     */
    async getScoreHistory(businessId, limit = 30) {
        return this.delegate.findMany({
            where: { businessId },
            orderBy: { computedAt: 'desc' },
            take: limit,
            select: {
                visibilityScore: true,
                trustScore: true,
                consistencyScore: true,
                computedAt: true,
                periodStart: true,
                periodEnd: true,
            },
        });
    }
    /**
     * Get score trend (comparing latest to previous period)
     */
    async getScoreTrend(businessId) {
        const scores = await this.delegate.findMany({
            where: { businessId },
            orderBy: { computedAt: 'desc' },
            take: 2,
        });
        const current = scores[0] || null;
        const previous = scores[1] || null;
        const trends = {
            visibility: current && previous
                ? current.visibilityScore - previous.visibilityScore
                : 0,
            trust: current && previous
                ? current.trustScore - previous.trustScore
                : 0,
            consistency: current && previous
                ? current.consistencyScore - previous.consistencyScore
                : 0,
        };
        return { current, previous, trends };
    }
    /**
     * Get average scores over a period
     */
    async getAverageScores(businessId, startDate, endDate) {
        const scores = await this.delegate.findMany({
            where: {
                businessId,
                computedAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                visibilityScore: true,
                trustScore: true,
                consistencyScore: true,
            },
        });
        if (scores.length === 0) {
            return {
                avgVisibility: 0,
                avgTrust: 0,
                avgConsistency: 0,
                count: 0,
            };
        }
        const sum = scores.reduce((acc, score) => ({
            visibility: acc.visibility + score.visibilityScore,
            trust: acc.trust + score.trustScore,
            consistency: acc.consistency + score.consistencyScore,
        }), { visibility: 0, trust: 0, consistency: 0 });
        return {
            avgVisibility: Math.round(sum.visibility / scores.length),
            avgTrust: Math.round(sum.trust / scores.length),
            avgConsistency: Math.round(sum.consistency / scores.length),
            count: scores.length,
        };
    }
    /**
     * Get score breakdown for latest score
     */
    async getLatestBreakdown(businessId) {
        const score = await this.findLatestByBusinessId(businessId);
        if (!score)
            return null;
        return {
            visibilityBreakdown: score.visibilityBreakdown,
            trustBreakdown: score.trustBreakdown,
            consistencyBreakdown: score.consistencyBreakdown,
        };
    }
    /**
     * Upsert score (create or update based on period)
     */
    async upsertScore(businessId, periodStart, periodEnd, scoreData) {
        const existing = await this.findByBusinessIdAndPeriod(businessId, periodStart, periodEnd);
        if (existing) {
            return this.update(existing.id, {
                ...scoreData,
                computedAt: new Date(),
            });
        }
        else {
            return this.create({
                business: { connect: { id: businessId } },
                periodStart,
                periodEnd,
                ...scoreData,
            });
        }
    }
    /**
     * Delete old scores (cleanup)
     */
    async deleteOldScores(businessId, daysOld = 365) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        return this.deleteMany({
            businessId,
            computedAt: {
                lt: cutoffDate,
            },
        });
    }
    /**
     * Get businesses with low scores (for alerting)
     */
    async findBusinessesWithLowScores(threshold = 50) {
        return this.delegate.findMany({
            where: {
                OR: [
                    { visibilityScore: { lt: threshold } },
                    { trustScore: { lt: threshold } },
                    { consistencyScore: { lt: threshold } },
                ],
            },
            orderBy: {
                computedAt: 'desc',
            },
            distinct: ['businessId'],
        });
    }
}
exports.BrandScoreRepository = BrandScoreRepository;
// Export singleton instance
exports.brandScoreRepository = new BrandScoreRepository();
