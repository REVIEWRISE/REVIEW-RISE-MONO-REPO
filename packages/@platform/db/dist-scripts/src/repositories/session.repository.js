"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionRepository = exports.SessionRepository = void 0;
const client_1 = require("../client");
const base_repository_1 = require("./base.repository");
/**
 * Session Repository
 *
 * Handles all database operations related to sessions.
 */
class SessionRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_1.prisma.session, 'Session');
    }
    /**
     * Create a new session for a user
     */
    async createSession(data) {
        return this.delegate.create({
            data,
        });
    }
    /**
     * Find session by token
     */
    async findSession(sessionToken) {
        return this.delegate.findUnique({
            where: { sessionToken },
            include: {
                user: {
                    include: {
                        userRoles: {
                            include: {
                                role: true,
                            },
                        },
                    },
                },
            },
        });
    }
    /**
     * Delete session by ID
     */
    async deleteSession(id) {
        return this.delegate.delete({
            where: { id },
        });
    }
}
exports.SessionRepository = SessionRepository;
// Export singleton instance
exports.sessionRepository = new SessionRepository();
