"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adriseSessionVersionRepository = exports.AdriseSessionVersionRepository = void 0;
const client_1 = require("../client");
const base_repository_1 = require("./base.repository");
/**
 * AdriseSessionVersion Repository
 *
 * Handles all database operations related to adrise session versions.
 * Provides type-safe methods for session version management.
 */
class AdriseSessionVersionRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_1.prisma.adriseSessionVersion, 'AdriseSessionVersion');
    }
    /**
     * Find versions by session ID
     */
    async findBySessionId(sessionId) {
        return this.delegate.findMany({
            where: { sessionId },
            orderBy: {
                versionNumber: 'desc',
            },
        });
    }
    /**
     * Get the latest version number for a session
     */
    async getLatestVersionNumber(sessionId) {
        const latest = await this.delegate.findFirst({
            where: { sessionId },
            orderBy: {
                versionNumber: 'desc',
            },
            select: {
                versionNumber: true,
            },
        });
        return latest ? latest.versionNumber : 0;
    }
}
exports.AdriseSessionVersionRepository = AdriseSessionVersionRepository;
// Export singleton instance
exports.adriseSessionVersionRepository = new AdriseSessionVersionRepository();
