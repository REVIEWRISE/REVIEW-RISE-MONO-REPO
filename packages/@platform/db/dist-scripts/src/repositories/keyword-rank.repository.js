"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keywordRankRepository = exports.KeywordRankRepository = void 0;
const base_repository_1 = require("./base.repository");
const client_1 = require("../client");
class KeywordRankRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_1.prisma.keywordRank, 'KeywordRank');
    }
    /**
     * Create a batch of rank records
     */
    async createBatch(data) {
        return this.delegate.createMany({
            data,
            skipDuplicates: false,
        });
    }
    /**
     * Get rank history for a keyword
     */
    async findByKeyword(keywordId, filters) {
        const where = {
            keywordId,
            ...(filters?.startDate || filters?.endDate
                ? {
                    capturedAt: {
                        ...(filters.startDate && { gte: filters.startDate }),
                        ...(filters.endDate && { lte: filters.endDate }),
                    },
                }
                : {}),
            ...(filters?.device && { device: filters.device }),
        };
        return this.delegate.findMany({
            where,
            orderBy: { capturedAt: 'desc' },
            take: filters?.limit,
            skip: filters?.offset,
        });
    }
    /**
     * Get the latest rank for each keyword
     */
    async findLatestRanks(keywordIds) {
        // Use raw SQL for better performance with window functions
        const ranks = await client_1.prisma.$queryRaw `
      SELECT DISTINCT ON ("keywordId") *
      FROM "KeywordRank"
      WHERE "keywordId" = ANY(${keywordIds}::uuid[])
      ORDER BY "keywordId", "capturedAt" DESC
    `;
        return ranks;
    }
    /**
     * Get ranks between two dates
     */
    async findRanksBetween(keywordId, startDate, endDate) {
        return this.delegate.findMany({
            where: {
                keywordId,
                capturedAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: { capturedAt: 'asc' },
        });
    }
    /**
     * Calculate average rank position for a keyword over a period
     */
    async getAveragePosition(keywordId, startDate, endDate) {
        const result = await this.delegate.aggregate({
            where: {
                keywordId,
                capturedAt: {
                    gte: startDate,
                    lte: endDate,
                },
                rankPosition: {
                    not: null,
                },
            },
            _avg: {
                rankPosition: true,
            },
        });
        return result._avg.rankPosition;
    }
    /**
     * Get all ranks for multiple keywords in a date range
     */
    async findRanksForKeywords(keywordIds, startDate, endDate) {
        return this.delegate.findMany({
            where: {
                keywordId: {
                    in: keywordIds,
                },
                capturedAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: [{ keywordId: 'asc' }, { capturedAt: 'desc' }],
        });
    }
    /**
     * Count ranks with Map Pack presence
     */
    async countMapPackPresence(keywordIds, startDate, endDate) {
        return this.delegate.count({
            where: {
                keywordId: {
                    in: keywordIds,
                },
                capturedAt: {
                    gte: startDate,
                    lte: endDate,
                },
                mapPackPosition: {
                    not: null,
                },
            },
        });
    }
    /**
     * Count ranks by position range
     */
    async countByPositionRange(keywordIds, startDate, endDate, minPosition, maxPosition) {
        return this.delegate.count({
            where: {
                keywordId: {
                    in: keywordIds,
                },
                capturedAt: {
                    gte: startDate,
                    lte: endDate,
                },
                rankPosition: {
                    gte: minPosition,
                    lte: maxPosition,
                },
            },
        });
    }
    /**
     * Get SERP feature statistics
     */
    async getSerpFeatureStats(keywordIds, startDate, endDate) {
        // Count true values for each SERP feature
        const ranks = await this.delegate.findMany({
            where: {
                keywordId: {
                    in: keywordIds,
                },
                capturedAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                hasFeaturedSnippet: true,
                hasPeopleAlsoAsk: true,
                hasLocalPack: true,
                hasKnowledgePanel: true,
                hasImagePack: true,
                hasVideoCarousel: true,
            },
        });
        return {
            featuredSnippet: ranks.filter(r => r.hasFeaturedSnippet).length,
            peopleAlsoAsk: ranks.filter(r => r.hasPeopleAlsoAsk).length,
            localPack: ranks.filter(r => r.hasLocalPack).length,
            knowledgePanel: ranks.filter(r => r.hasKnowledgePanel).length,
            imagePack: ranks.filter(r => r.hasImagePack).length,
            videoCarousel: ranks.filter(r => r.hasVideoCarousel).length,
        };
    }
}
exports.KeywordRankRepository = KeywordRankRepository;
// Export singleton instance
exports.keywordRankRepository = new KeywordRankRepository();
