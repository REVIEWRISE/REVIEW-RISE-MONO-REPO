"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.businessRepository = exports.BusinessRepository = void 0;
const client_1 = require("../client");
const base_repository_1 = require("./base.repository");
/**
 * Business Repository
 *
 * Handles all database operations related to businesses.
 * Provides type-safe methods for business management.
 */
class BusinessRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_1.prisma.business, 'Business');
    }
    /**
     * Find business by slug
     */
    async findBySlug(slug) {
        return this.delegate.findUnique({
            where: { slug },
        });
    }
    /**
     * Find business with all locations
     */
    async findWithLocations(id) {
        return this.delegate.findUnique({
            where: { id },
            include: {
                locations: {
                    where: {
                        deletedAt: null,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });
    }
    /**
     * Find business with active subscription
     */
    async findWithSubscription(id) {
        return this.delegate.findUnique({
            where: { id },
            include: {
                subscriptions: {
                    where: {
                        deletedAt: null,
                        status: 'active',
                    },
                    orderBy: {
                        currentPeriodEnd: 'desc',
                    },
                    take: 1,
                },
            },
        });
    }
    /**
     * Check if slug is available
     */
    async isSlugAvailable(slug, excludeId) {
        const existing = await this.delegate.findFirst({
            where: {
                slug,
                id: excludeId ? { not: excludeId } : undefined,
            },
        });
        return !existing;
    }
    /**
     * Generate unique slug from business name
     */
    async generateUniqueSlug(name) {
        const baseSlug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        let slug = baseSlug;
        let counter = 1;
        while (!(await this.isSlugAvailable(slug))) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        return slug;
    }
    /**
     * Search businesses by name
     */
    async search(query, options) {
        return this.delegate.findMany({
            where: {
                name: {
                    contains: query,
                    mode: 'insensitive',
                },
                deletedAt: null,
            },
            take: options?.take,
            skip: options?.skip,
            orderBy: {
                name: 'asc',
            },
        });
    }
    /**
     * Get business statistics
     */
    async getStats() {
        const [total, active, withActiveSubscription] = await Promise.all([
            this.count({}),
            this.count({ deletedAt: null }),
            this.delegate.count({
                where: {
                    deletedAt: null,
                    subscriptions: {
                        some: {
                            status: 'active',
                            deletedAt: null,
                        },
                    },
                },
            }),
        ]);
        return {
            total,
            active,
            withActiveSubscription,
            withoutSubscription: active - withActiveSubscription,
        };
    }
    /**
     * Find businesses by user ID
     */
    async findByUser(userId) {
        return this.delegate.findMany({
            where: {
                userBusinessRoles: {
                    some: {
                        userId: userId,
                        deletedAt: null,
                    },
                },
                deletedAt: null,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}
exports.BusinessRepository = BusinessRepository;
// Export singleton instance
exports.businessRepository = new BusinessRepository();
