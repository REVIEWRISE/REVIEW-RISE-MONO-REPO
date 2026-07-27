"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialConnectionRepository = exports.SocialConnectionRepository = void 0;
const client_1 = require("../client");
const base_repository_1 = require("./base.repository");
const contracts_1 = require("@platform/contracts");
class SocialConnectionRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_1.prisma.socialConnection, 'SocialConnection');
    }
    /**
     * Find all connections for a business
     */
    async findByBusinessId(businessId) {
        const connections = await this.delegate.findMany({
            where: { businessId },
            orderBy: { createdAt: 'desc' },
        });
        return this.decryptConnections(connections);
    }
    /**
     * Find all connections for a location
     */
    async findByLocationId(locationId) {
        const connections = await this.delegate.findMany({
            where: { locationId },
            orderBy: { createdAt: 'desc' },
        });
        return this.decryptConnections(connections);
    }
    /**
     * Find connections by platform
     */
    async findByPlatform(businessId, platform) {
        const connections = await this.delegate.findMany({
            where: { businessId, platform },
            orderBy: { createdAt: 'desc' },
        });
        return this.decryptConnections(connections);
    }
    /**
     * Find a specific connection by business, location, platform, and pageId
     */
    async findByUnique(businessId, locationId, platform, pageId) {
        const connection = await this.delegate.findFirst({
            where: {
                businessId,
                locationId,
                platform,
                pageId,
            },
        });
        return connection ? this.decryptConnection(connection) : null;
    }
    /**
     * Find connections with tokens expiring within the specified hours
     */
    async findExpiringTokens(hoursThreshold = 24) {
        const expiryThreshold = new Date();
        expiryThreshold.setHours(expiryThreshold.getHours() + hoursThreshold);
        const connections = await this.delegate.findMany({
            where: {
                tokenExpiry: {
                    lte: expiryThreshold,
                    gte: new Date(), // Not already expired
                },
                status: 'active',
                refreshToken: {
                    not: null,
                },
            },
        });
        return this.decryptConnections(connections);
    }
    /**
     * Create a new connection with encrypted tokens
     */
    async createWithEncryption(data) {
        const { businessId, locationId, accessToken, refreshToken, ...rest } = data;
        const encryptedData = {
            ...rest,
            accessToken: (0, contracts_1.encrypt)(accessToken),
            refreshToken: refreshToken ? (0, contracts_1.encrypt)(refreshToken) : undefined,
            business: {
                connect: { id: businessId },
            },
            ...(locationId && {
                location: {
                    connect: { id: locationId },
                },
            }),
        };
        const connection = await this.create(encryptedData);
        return this.decryptConnection(connection);
    }
    /**
     * Update tokens with encryption
     */
    async updateTokens(id, tokens) {
        const updateData = {
            accessToken: (0, contracts_1.encrypt)(tokens.accessToken),
            ...(tokens.refreshToken && { refreshToken: (0, contracts_1.encrypt)(tokens.refreshToken) }),
            ...(tokens.tokenExpiry && { tokenExpiry: tokens.tokenExpiry }),
            status: 'active',
            errorMessage: null,
            updatedAt: new Date(),
        };
        const connection = await this.update(id, updateData);
        return this.decryptConnection(connection);
    }
    /**
     * Update connection status
     */
    async updateStatus(id, status, errorMessage) {
        const connection = await this.update(id, {
            status,
            errorMessage: errorMessage || null,
            updatedAt: new Date(),
        });
        return this.decryptConnection(connection);
    }
    /**
     * Update last sync timestamp
     */
    async updateLastSync(id) {
        const connection = await this.update(id, {
            lastSyncAt: new Date(),
            updatedAt: new Date(),
        });
        return this.decryptConnection(connection);
    }
    /**
     * Decrypt a single connection's tokens
     */
    decryptConnection(connection) {
        try {
            return {
                ...connection,
                accessToken: (0, contracts_1.decrypt)(connection.accessToken),
                refreshToken: connection.refreshToken ? (0, contracts_1.decrypt)(connection.refreshToken) : null,
            };
        }
        catch (error) {
            console.error('Error decrypting connection tokens:', error);
            // Return connection with encrypted tokens if decryption fails
            return connection;
        }
    }
    /**
     * Decrypt multiple connections' tokens
     */
    decryptConnections(connections) {
        return connections.map(conn => this.decryptConnection(conn));
    }
    /**
     * Find a single record by ID with decryption
     */
    async findByIdWithDecryption(id) {
        const connection = await super.findById(id);
        return connection ? this.decryptConnection(connection) : null;
    }
    async findById(id) {
        return this.findByIdWithDecryption(id);
    }
    /**
     * Get connection with encrypted tokens (for external API calls)
     */
    async findByIdRaw(id) {
        return super.findById(id);
    }
}
exports.SocialConnectionRepository = SocialConnectionRepository;
exports.socialConnectionRepository = new SocialConnectionRepository();
