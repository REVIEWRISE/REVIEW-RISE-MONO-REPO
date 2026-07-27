"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformIntegrationRepository = exports.PlatformIntegrationRepository = void 0;
const client_1 = require("../client");
const base_repository_1 = require("./base.repository");
class PlatformIntegrationRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_1.prisma.platformIntegration, 'PlatformIntegration');
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
    /**
     * Update encrypted tokens after a refresh.
     * accessToken and refreshToken should already be AES-256-GCM encrypted strings.
     */
    async updateTokens(id, accessToken, refreshToken, expiresAt) {
        return this.update(id, {
            accessToken,
            ...(refreshToken && { refreshToken }),
            ...(expiresAt && { expiresAt: BigInt(expiresAt) }),
        });
    }
    async updateStatus(id, status) {
        return this.update(id, { status });
    }
    async upsertGoogleIntegration(data) {
        return client_1.prisma.platformIntegration.upsert({
            where: {
                locationId_platform: {
                    locationId: data.locationId,
                    platform: 'google',
                },
            },
            create: {
                location: { connect: { id: data.locationId } },
                platform: 'google',
                status: 'active',
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                expiresAt: data.expiresAt,
                gbpAccountId: data.gbpAccountId,
                gbpLocationName: data.gbpLocationName,
                gbpLocationTitle: data.gbpLocationTitle,
                connectedAt: new Date(),
            },
            update: {
                status: 'active',
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                expiresAt: data.expiresAt,
                gbpAccountId: data.gbpAccountId,
                gbpLocationName: data.gbpLocationName,
                gbpLocationTitle: data.gbpLocationTitle,
                connectedAt: new Date(),
            },
        });
    }
}
exports.PlatformIntegrationRepository = PlatformIntegrationRepository;
exports.platformIntegrationRepository = new PlatformIntegrationRepository();
