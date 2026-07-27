"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogRepository = exports.AuditLogRepository = void 0;
const client_1 = require("../client");
const base_repository_1 = require("./base.repository");
/**
 * AuditLog Repository
 *
 * Handles all database operations related to audit logs.
 */
class AuditLogRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_1.prisma.auditLog, 'AuditLog');
    }
    /**
     * Create a new audit log entry
     */
    async log(data) {
        return this.create(data);
    }
    /**
     * Find logs by entity
     */
    async findByEntity(entityId, entityType) {
        return this.findMany({
            where: {
                entityId,
                entityType
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
}
exports.AuditLogRepository = AuditLogRepository;
exports.auditLogRepository = new AuditLogRepository();
