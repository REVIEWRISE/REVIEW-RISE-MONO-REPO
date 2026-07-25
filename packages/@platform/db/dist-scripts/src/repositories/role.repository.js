"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleRepository = exports.RoleRepository = void 0;
const client_1 = require("../client");
const base_repository_1 = require("./base.repository");
/**
 * Role Repository
 *
 * Handles all database operations related to roles and permissions.
 */
class RoleRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_1.prisma.role, 'Role');
    }
    /**
     * Find role by name
     */
    async findByName(name) {
        return this.delegate.findUnique({
            where: { name },
        });
    }
    /**
     * Find role with all permissions
     */
    async findWithPermissions(id) {
        return this.delegate.findUnique({
            where: { id },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
    }
    /**
     * Find role with users who have this role
     */
    async findWithUsers(id) {
        return this.delegate.findUnique({
            where: { id },
            include: {
                userRoles: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                                image: true,
                            },
                        },
                    },
                },
            },
        });
    }
    /**
     * Create role with permissions
     */
    async createWithPermissions(roleData, permissionIds) {
        return this.transaction(async (tx) => {
            // Create role
            const role = await tx.role.create({
                data: roleData,
            });
            // Assign permissions
            if (permissionIds.length > 0) {
                await tx.rolePermission.createMany({
                    data: permissionIds.map((permissionId) => ({
                        roleId: role.id,
                        permissionId,
                    })),
                });
            }
            // Return role with permissions
            return tx.role.findUnique({
                where: { id: role.id },
                include: {
                    permissions: {
                        include: {
                            permission: true,
                        },
                    },
                },
            });
        });
    }
    /**
     * Assign permission to role
     */
    async assignPermission(roleId, permissionId) {
        return client_1.prisma.rolePermission.create({
            data: {
                roleId,
                permissionId,
            },
            include: {
                permission: true,
                role: true,
            },
        });
    }
    /**
     * Remove permission from role
     */
    async removePermission(roleId, permissionId) {
        return client_1.prisma.rolePermission.delete({
            where: {
                roleId_permissionId: {
                    roleId,
                    permissionId,
                },
            },
        });
    }
    /**
     * Sync role permissions (replace all permissions)
     */
    async syncPermissions(roleId, permissionIds) {
        return this.transaction(async (tx) => {
            // Remove all existing permissions
            await tx.rolePermission.deleteMany({
                where: { roleId },
            });
            // Add new permissions
            if (permissionIds.length > 0) {
                await tx.rolePermission.createMany({
                    data: permissionIds.map((permissionId) => ({
                        roleId,
                        permissionId,
                    })),
                });
            }
            // Return updated role
            return tx.role.findUnique({
                where: { id: roleId },
                include: {
                    permissions: {
                        include: {
                            permission: true,
                        },
                    },
                },
            });
        });
    }
    /**
     * Check if role has specific permission
     */
    async hasPermission(roleId, permissionAction) {
        const rolePermission = await client_1.prisma.rolePermission.findFirst({
            where: {
                roleId,
                permission: {
                    action: permissionAction,
                },
            },
        });
        return !!rolePermission;
    }
    /**
     * Get all permissions for a role
     */
    async getPermissions(roleId) {
        const rolePermissions = await client_1.prisma.rolePermission.findMany({
            where: { roleId },
            include: {
                permission: true,
            },
        });
        return rolePermissions.map((rp) => rp.permission);
    }
    /**
     * Find roles with specific permission
     */
    async findByPermission(permissionAction) {
        return this.delegate.findMany({
            where: {
                permissions: {
                    some: {
                        permission: {
                            action: permissionAction,
                        },
                    },
                },
            },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
    }
    /**
     * Get role statistics
     */
    async getStats() {
        const [total, withUsers, withPermissions] = await Promise.all([
            this.count({}),
            this.delegate.count({
                where: {
                    userRoles: {
                        some: {},
                    },
                },
            }),
            this.delegate.count({
                where: {
                    permissions: {
                        some: {},
                    },
                },
            }),
        ]);
        return {
            total,
            withUsers,
            withPermissions,
            withoutPermissions: total - withPermissions,
        };
    }
}
exports.RoleRepository = RoleRepository;
// Export singleton instance
exports.roleRepository = new RoleRepository();
