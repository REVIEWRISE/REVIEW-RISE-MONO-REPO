"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adriseSessionRepository = exports.AdriseSessionRepository = void 0;
const client_1 = require("../client");
const base_repository_1 = require("./base.repository");
/**
 * AdriseSession Repository
 *
 * Handles all database operations related to adrise sessions.
 * Provides type-safe methods for session management.
 */
class AdriseSessionRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_1.prisma.adriseSession, 'AdriseSession');
    }
    /**
     * Find session with its versions and outputs
     */
    async findWithDetails(id) {
        return this.delegate.findUnique({
            where: { id },
            include: {
                versions: {
                    orderBy: {
                        versionNumber: 'desc',
                    },
                },
                outputs: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });
    }
    /**
     * Find sessions by business ID
     */
    async findByBusinessId(businessId) {
        return this.delegate.findMany({
            where: { businessId },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    /**
     * Find sessions by user ID
     */
    async findByUserId(userId) {
        return this.delegate.findMany({
            where: { userId },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}
exports.AdriseSessionRepository = AdriseSessionRepository;
// Export singleton instance
exports.adriseSessionRepository = new AdriseSessionRepository();
