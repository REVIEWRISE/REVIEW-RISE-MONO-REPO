"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishingJobRepository = exports.PublishingJobRepository = void 0;
const client_1 = require("../client");
const base_repository_1 = require("./base.repository");
/**
 * PublishingJob Repository
 *
 * Handles all database operations related to publishing jobs.
 * Provides type-safe methods for job tracking and retry logic.
 */
class PublishingJobRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_1.prisma.publishingJob, 'PublishingJob');
    }
    /**
     * Find jobs for a specific scheduled post
     */
    async findByPostId(scheduledPostId) {
        return this.delegate.findMany({
            where: { scheduledPostId },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    /**
     * Find pending jobs that need to be processed
     */
    async findPendingJobs() {
        return this.delegate.findMany({
            where: {
                status: 'pending',
                scheduledPost: {
                    scheduledAt: {
                        lte: new Date(),
                    },
                    status: 'scheduled',
                },
            },
            include: {
                scheduledPost: true,
            },
        });
    }
    /**
     * Increment attempt count and update status
     */
    async incrementAttempt(id, error) {
        return this.delegate.update({
            where: { id },
            data: {
                attemptCount: {
                    increment: 1,
                },
                lastAttemptAt: new Date(),
                error: error || null,
                status: 'failed',
            },
        });
    }
}
exports.PublishingJobRepository = PublishingJobRepository;
exports.publishingJobRepository = new PublishingJobRepository();
