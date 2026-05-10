"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adriseOutputRepository = exports.AdriseOutputRepository = void 0;
const client_1 = require("../client");
const base_repository_1 = require("./base.repository");
/**
 * AdriseOutput Repository
 *
 * Handles all database operations related to adrise outputs.
 * Provides type-safe methods for output management.
 */
class AdriseOutputRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_1.prisma.adriseOutput, 'AdriseOutput');
    }
    /**
     * Find outputs by session ID
     */
    async findBySessionId(sessionId) {
        return this.delegate.findMany({
            where: { sessionId },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    /**
     * Find latest output for a session
     */
    async findLatestBySessionId(sessionId) {
        return this.delegate.findFirst({
            where: { sessionId },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}
exports.AdriseOutputRepository = AdriseOutputRepository;
// Export singleton instance
exports.adriseOutputRepository = new AdriseOutputRepository();
