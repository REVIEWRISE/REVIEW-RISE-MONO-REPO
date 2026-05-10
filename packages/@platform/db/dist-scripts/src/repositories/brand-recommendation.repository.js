"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.brandRecommendationRepository = exports.BrandRecommendationRepository = void 0;
const client_1 = require("../client");
const base_repository_1 = require("./base.repository");
/**
 * Brand Recommendation Repository
 *
 * Handles all database operations related to AI-generated brand recommendations.
 * Provides type-safe methods for recommendation management, filtering, and prioritization.
 */
class BrandRecommendationRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_1.prisma.brandRecommendation, 'BrandRecommendation');
    }
    /**
     * Find recommendations by business ID with advanced filtering
     */
    async findByBusinessId(businessId, filters) {
        const where = {
            businessId,
            ...(filters?.category && { category: filters.category }),
            ...(filters?.status && { status: filters.status }),
        };
        const orderBy = {
            [filters?.sortBy || 'priorityScore']: filters?.order || 'desc',
        };
        return this.delegate.findMany({
            where,
            orderBy,
            take: filters?.limit,
            skip: filters?.offset,
        });
    }
    /**
     * Update recommendation status with automatic timestamp tracking
     */
    async updateStatus(id, status, notes) {
        const updateData = {
            status,
            ...(notes && { notes }),
            ...(status === 'done' && { completedAt: new Date() }),
            ...(status === 'dismissed' && { dismissedAt: new Date() }),
        };
        return this.update(id, updateData);
    }
    /**
     * Get recommendation statistics by business
     */
    async getStatsByBusiness(businessId) {
        const recommendations = await this.delegate.findMany({
            where: { businessId },
            select: {
                status: true,
                category: true,
                impact: true,
            },
        });
        return {
            total: recommendations.length,
            byStatus: this.groupBy(recommendations, 'status'),
            byCategory: this.groupBy(recommendations, 'category'),
            byImpact: this.groupBy(recommendations, 'impact'),
        };
    }
    /**
     * Get top priority recommendations
     */
    async getTopPriority(businessId, limit = 10) {
        return this.delegate.findMany({
            where: {
                businessId,
                status: { in: ['open', 'in_progress'] },
            },
            orderBy: {
                priorityScore: 'desc',
            },
            take: limit,
        });
    }
    /**
     * Get recommendations by category
     */
    async findByCategory(businessId, category) {
        return this.delegate.findMany({
            where: {
                businessId,
                category,
            },
            orderBy: {
                priorityScore: 'desc',
            },
        });
    }
    /**
     * Count open recommendations
     */
    async countOpen(businessId) {
        return this.count({
            businessId,
            status: 'open',
        });
    }
    /**
     * Count completed recommendations
     */
    async countCompleted(businessId) {
        return this.count({
            businessId,
            status: 'done',
        });
    }
    /**
     * Helper method to group items by a key
     */
    groupBy(items, key) {
        return items.reduce((acc, item) => {
            const value = item[key];
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {});
    }
    /**
     * Bulk create recommendations
     */
    async createBulk(recommendations) {
        return this.createMany(recommendations);
    }
    /**
     * Delete old dismissed recommendations (cleanup)
     */
    async deleteOldDismissed(businessId, daysOld = 90) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        return this.deleteMany({
            businessId,
            status: 'dismissed',
            dismissedAt: {
                lt: cutoffDate,
            },
        });
    }
}
exports.BrandRecommendationRepository = BrandRecommendationRepository;
// Export singleton instance
exports.brandRecommendationRepository = new BrandRecommendationRepository();
