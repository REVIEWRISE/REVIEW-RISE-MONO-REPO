"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionRepository = exports.PermissionRepository = void 0;
const client_1 = require("../client");
const base_repository_1 = require("./base.repository");
/**
 * Permission Repository
 *
 * Handles all database operations related to permissions.
 */
class PermissionRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_1.prisma.permission, 'Permission');
    }
    /**
     * Find permission by action
     */
    async findByAction(action) {
        return this.delegate.findUnique({
            where: { action },
        });
    }
    /**
     * Find permission with roles that have it
     */
    async findWithRoles(id) {
        return this.delegate.findUnique({
            where: { id },
            include: {
                roles: {
                    include: {
                        role: true,
                    },
                },
            },
        });
    }
    /**
     * Find all permissions for a specific role
     */
    async findByRoleId(roleId) {
        const rolePermissions = await client_1.prisma.rolePermission.findMany({
            where: { roleId },
            include: {
                permission: true,
            },
        });
        return rolePermissions.map((rp) => rp.permission);
    }
    /**
     * Find permissions by action pattern (e.g., "user:*")
     */
    async findByActionPattern(pattern) {
        return this.delegate.findMany({
            where: {
                action: {
                    startsWith: pattern.replace('*', ''),
                },
            },
            orderBy: {
                action: 'asc',
            },
        });
    }
    /**
     * Create multiple permissions at once
     */
    async createBulk(permissions) {
        return this.transaction(async (tx) => {
            const created = await Promise.all(permissions.map((permission) => tx.permission.create({
                data: permission,
            })));
            return created;
        });
    }
    /**
     * Check if permission exists by action
     */
    async existsByAction(action) {
        const permission = await this.findByAction(action);
        return !!permission;
    }
    /**
     * Get permissions grouped by resource
     * e.g., { user: [...], business: [...], ... }
     */
    async getGroupedByResource() {
        const permissions = await this.findAll();
        const grouped = {};
        permissions.forEach((permission) => {
            const [resource] = permission.action.split(':');
            if (!grouped[resource]) {
                grouped[resource] = [];
            }
            grouped[resource].push(permission);
        });
        return grouped;
    }
    /**
     * Get permission statistics
     */
    async getStats() {
        const [total, assigned, unassigned] = await Promise.all([
            this.count({}),
            this.delegate.count({
                where: {
                    roles: {
                        some: {},
                    },
                },
            }),
            this.delegate.count({
                where: {
                    roles: {
                        none: {},
                    },
                },
            }),
        ]);
        return {
            total,
            assigned,
            unassigned,
        };
    }
}
exports.PermissionRepository = PermissionRepository;
// Export singleton instance
exports.permissionRepository = new PermissionRepository();
