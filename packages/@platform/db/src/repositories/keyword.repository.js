"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keywordRepository = exports.KeywordRepository = void 0;
const base_repository_1 = require("./base.repository");
const client_1 = require("../client");
class KeywordRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_1.prisma.keyword, 'Keyword');
    }
    /**
     * Find all keywords for a business with optional filters
     */
    async findByBusiness(businessId, filters) {
        const where = {
            businessId,
            ...(filters?.locationId && { locationId: filters.locationId }),
            ...(filters?.status && { status: filters.status }),
            ...(filters?.tags && filters.tags.length > 0 && {
                tags: { hasSome: filters.tags },
            }),
        };
        return this.delegate.findMany({
            where,
            take: filters?.limit,
            skip: filters?.offset,
            orderBy: { createdAt: 'desc' },
            include: {
                location: true,
                ranks: {
                    take: 1,
                    orderBy: { capturedAt: 'desc' },
                },
            },
        });
    }
    /**
     * Find all keywords for a location
     */
    async findByLocation(locationId, filters) {
        const where = {
            locationId,
            ...(filters?.status && { status: filters.status }),
        };
        return this.delegate.findMany({
            where,
            take: filters?.limit,
            skip: filters?.offset,
            orderBy: { createdAt: 'desc' },
        });
    }
    /**
     * Get all active keywords for a business
     */
    async getActiveKeywords(businessId) {
        return this.delegate.findMany({
            where: {
                businessId,
                status: 'active',
                deletedAt: null,
            },
            orderBy: { keyword: 'asc' },
        });
    }
    /**
     * Soft delete a keyword - override to set status as well
     */
    async softDelete(id) {
        return this.delegate.update({
            where: { id },
            data: {
                status: 'archived',
                deletedAt: new Date(),
            },
        });
    }
    /**
     * Bulk create keywords
     */
    async createManyKeywords(data) {
        return this.delegate.createMany({
            data,
            skipDuplicates: true,
        });
    }
    /**
     * Get keyword count by business
     */
    async countByBusiness(businessId, status) {
        return this.delegate.count({
            where: {
                businessId,
                ...(status && { status }),
                deletedAt: null,
            },
        });
    }
    /**
     * Search keywords by text
     */
    async searchKeywords(businessId, searchTerm, limit = 10) {
        return this.delegate.findMany({
            where: {
                businessId,
                keyword: {
                    contains: searchTerm,
                    mode: 'insensitive',
                },
                status: 'active',
                deletedAt: null,
            },
            take: limit,
            orderBy: { keyword: 'asc' },
        });
    }
}
exports.KeywordRepository = KeywordRepository;
// Export singleton instance
exports.keywordRepository = new KeywordRepository();
