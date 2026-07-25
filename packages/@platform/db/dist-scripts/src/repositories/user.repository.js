"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const client_1 = require("../client");
const base_repository_1 = require("./base.repository");
/**
 * User Repository
 *
 * Handles all database operations related to users.
 * Provides type-safe methods for user management.
 */
class UserRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_1.prisma.user, 'User');
    }
    /**
     * Find user by email address
     */
    async findByEmail(email) {
        return this.delegate.findUnique({
            where: { email },
        });
    }
    /**
     * Find user with their sessions
     */
    async findWithSessions(id) {
        return this.delegate.findUnique({
            where: { id },
            include: {
                sessions: {
                    where: {
                        expires: {
                            gte: new Date(),
                        },
                    },
                    orderBy: {
                        expires: 'desc',
                    },
                },
            },
        });
    }
    /**
     * Update user email (with verification reset)
     */
    async updateEmail(id, newEmail) {
        return this.delegate.update({
            where: { id },
            data: {
                email: newEmail,
                emailVerified: null, // Reset verification when email changes
            },
        });
    }
    /**
     * Mark email as verified
     */
    async verifyEmail(id) {
        return this.delegate.update({
            where: { id },
            data: {
                emailVerified: new Date(),
            },
        });
    }
    /**
     * Search users by name or email
     */
    async search(query, options) {
        return this.delegate.findMany({
            where: {
                OR: [
                    {
                        email: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                    {
                        name: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                ],
            },
            take: options?.take,
            skip: options?.skip,
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    /**
     * Get user statistics
     */
    async getStats() {
        const [total, verified] = await Promise.all([
            this.count({}),
            this.count({ emailVerified: { not: null } }),
        ]);
        return {
            total,
            active: total,
            verified,
            unverified: total - verified,
        };
    }
    /**
     * Find user by email with roles
     */
    async findByEmailWithRoles(email) {
        return this.delegate.findUnique({
            where: { email },
            include: {
                userRoles: {
                    include: {
                        role: true,
                    },
                },
                userBusinessRoles: {
                    take: 1, // Start with just one business for now
                    include: {
                        business: {
                            include: {
                                locations: {
                                    where: { status: 'active' },
                                    take: 1, // Only need one to use as default
                                    select: { id: true }
                                }
                            }
                        }
                    }
                }
            },
        });
    }
    /**
     * Ensure user has at least one role.
     * Useful for users auto-provisioned by external auth adapters.
     */
    async ensureRoleAssignment(userId, preferredRoles = ['Owner', 'Admin', 'Viewer']) {
        const existing = await client_1.prisma.userRole.findFirst({
            where: { userId },
            select: { id: true }
        });
        if (existing) {
            return;
        }
        const roles = await client_1.prisma.role.findMany({
            where: { name: { in: preferredRoles } },
            select: { id: true, name: true }
        });
        const selected = preferredRoles
            .map(name => roles.find(role => role.name === name))
            .find(Boolean);
        if (!selected) {
            throw new Error(`No default role found in database (expected one of ${preferredRoles.join(', ')})`);
        }
        await client_1.prisma.userRole.create({
            data: {
                userId,
                roleId: selected.id
            }
        });
    }
    /**
     * Create a newly registered user with a default seeded system role.
     */
    async createCustomer(data) {
        // Prefer Owner for self-serve signup.
        // Fallback to Admin/Viewer if Owner is not present in the environment.
        const candidateRoles = ['Owner', 'Admin', 'Viewer'];
        const roles = await client_1.prisma.role.findMany({
            where: { name: { in: candidateRoles } },
            select: { id: true, name: true }
        });
        const defaultRole = candidateRoles
            .map(name => roles.find(role => role.name === name))
            .find(Boolean);
        if (!defaultRole) {
            throw new Error('No default role found in database (expected one of Admin, Owner, Viewer)');
        }
        return this.delegate.create({
            data: {
                ...data,
                userRoles: {
                    create: {
                        role: {
                            connect: { id: defaultRole.id },
                        },
                    },
                },
            },
        });
    }
    /**
     * Update user password
     */
    async updatePassword(id, password) {
        return this.delegate.update({
            where: { id },
            data: { password },
        });
    }
}
exports.UserRepository = UserRepository;
// Export singleton instance
exports.userRepository = new UserRepository();
