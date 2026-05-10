"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pendingGoogleConnectionRepository = exports.PendingGoogleConnectionRepository = void 0;
const client_1 = require("../client");
class PendingGoogleConnectionRepository {
    async create(data) {
        return client_1.prisma.pendingGoogleConnection.create({ data });
    }
    async findById(id) {
        return client_1.prisma.pendingGoogleConnection.findUnique({ where: { id } });
    }
    async findByNonce(nonce) {
        return client_1.prisma.pendingGoogleConnection.findUnique({ where: { nonce } });
    }
    async deleteById(id) {
        await client_1.prisma.pendingGoogleConnection.delete({ where: { id } }).catch(() => {
            // Ignore if already deleted
        });
    }
    /**
     * Cleanup expired pending connections (run periodically or on connect attempts).
     */
    async deleteExpired() {
        const result = await client_1.prisma.pendingGoogleConnection.deleteMany({
            where: { expiresAt: { lt: new Date() } },
        });
        return result.count;
    }
    async isExpired(pending) {
        return pending.expiresAt < new Date();
    }
}
exports.PendingGoogleConnectionRepository = PendingGoogleConnectionRepository;
exports.pendingGoogleConnectionRepository = new PendingGoogleConnectionRepository();
