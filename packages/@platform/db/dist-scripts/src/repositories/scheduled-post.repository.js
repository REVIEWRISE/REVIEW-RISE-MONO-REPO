"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduledPostRepository = exports.ScheduledPostRepository = void 0;
const client_1 = require("../client");
const base_repository_1 = require("./base.repository");
/**
 * ScheduledPost Repository
 *
 * Handles all database operations related to scheduled posts.
 * Provides type-safe methods for post scheduling management.
 */
class ScheduledPostRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_1.prisma.scheduledPost, 'ScheduledPost');
    }
    /**
     * Find scheduled posts by business ID
     */
    async findByBusinessId(businessId, options) {
        const where = {
            businessId,
        };
        if (options?.status) {
            where.status = options.status;
        }
        if (options?.from || options?.to) {
            where.scheduledAt = {
                gte: options.from,
                lte: options.to,
            };
        }
        return this.delegate.findMany({
            where,
            include: {
                publishingJobs: true,
            },
            orderBy: {
                scheduledAt: 'asc',
            },
        });
    }
    /**
     * Find scheduled posts by location ID
     */
    async findByLocationId(locationId) {
        return this.delegate.findMany({
            where: { locationId },
            include: {
                publishingJobs: true,
            },
            orderBy: {
                scheduledAt: 'asc',
            },
        });
    }
    /**
     * Find post with its publishing jobs
     */
    async findWithJobs(id) {
        return this.delegate.findUnique({
            where: { id },
            include: {
                publishingJobs: true,
            },
        });
    }
}
exports.ScheduledPostRepository = ScheduledPostRepository;
exports.scheduledPostRepository = new ScheduledPostRepository();
