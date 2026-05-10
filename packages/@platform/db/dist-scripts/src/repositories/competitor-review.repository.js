"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.competitorReviewRepository = exports.CompetitorReviewRepository = void 0;
const client_1 = require("../client");
const base_repository_1 = require("./base.repository");
class CompetitorReviewRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_1.prisma.competitorReview, 'CompetitorReview');
    }
    /**
     * Get latest competitor comparison data for a business/location
     */
    async getLatestComparison(businessId, locationId) {
        const where = {
            businessId,
            ...(locationId && { locationId })
        };
        return this.delegate.findMany({
            where,
            orderBy: { capturedAt: 'desc' },
            distinct: ['competitorName'],
            take: 10
        });
    }
    /**
     * Upsert competitor review data
     */
    async upsertCompetitorData(data) {
        return this.delegate.create({
            data: {
                business: { connect: { id: data.businessId } },
                ...(data.locationId && { location: { connect: { id: data.locationId } } }),
                competitorName: data.competitorName,
                averageRating: data.averageRating,
                totalReviews: data.totalReviews,
                source: data.source
            }
        });
    }
    /**
     * Get competitor trend over time
     */
    async getCompetitorTrend(params) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - params.periodDays);
        return this.delegate.findMany({
            where: {
                businessId: params.businessId,
                ...(params.locationId && { locationId: params.locationId }),
                competitorName: params.competitorName,
                capturedAt: { gte: startDate }
            },
            orderBy: { capturedAt: 'asc' }
        });
    }
}
exports.CompetitorReviewRepository = CompetitorReviewRepository;
exports.competitorReviewRepository = new CompetitorReviewRepository();
