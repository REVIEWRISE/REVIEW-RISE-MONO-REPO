"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seoSnapshotRepository = exports.SeoSnapshotRepository = void 0;
const client_1 = require("../client");
const base_repository_1 = require("./base.repository");
/**
 * SeoSnapshot Repository
 *
 * Handles all database operations related to SEO snapshots.
 */
class SeoSnapshotRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_1.prisma.seoSnapshot, 'SeoSnapshot');
    }
    /**
     * Find snapshots by URL
     */
    async findByUrl(url) {
        return this.findMany({
            where: { url },
            orderBy: { createdAt: 'desc' }
        });
    }
    /**
     * Find snapshots by User
     */
    async findByUser(userId) {
        return this.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }
}
exports.SeoSnapshotRepository = SeoSnapshotRepository;
exports.seoSnapshotRepository = new SeoSnapshotRepository();
