"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewSourceRepository = exports.ReviewSourceRepository = void 0;
const client_1 = require("../client");
const base_repository_1 = require("./base.repository");
class ReviewSourceRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_1.prisma.reviewSource, 'ReviewSource');
    }
    async findByLocationId(locationId) {
        return this.delegate.findMany({
            where: { locationId },
        });
    }
    async findActiveByLocationId(locationId) {
        return this.delegate.findMany({
            where: { locationId, status: 'active' },
        });
    }
    async findByLocationIdAndPlatform(locationId, platform) {
        return this.delegate.findFirst({
            where: { locationId, platform },
        });
    }
    async updateStatus(id, status) {
        return this.update(id, { status });
    }
    async upsertLocationPlatform(locationId, platform) {
        return this.delegate.upsert({
            where: {
                locationId_platform: {
                    locationId,
                    platform
                }
            },
            update: {
                status: 'active'
            },
            create: {
                locationId,
                platform,
                status: 'active'
            }
        });
    }
}
exports.ReviewSourceRepository = ReviewSourceRepository;
exports.reviewSourceRepository = new ReviewSourceRepository();
