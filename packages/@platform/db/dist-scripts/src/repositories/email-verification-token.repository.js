"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailVerificationTokenRepository = exports.EmailVerificationTokenRepository = void 0;
const client_1 = require("../client");
const base_repository_1 = require("./base.repository");
/**
 * EmailVerificationToken Repository
 *
 * Handles all database operations related to email verification tokens.
 */
class EmailVerificationTokenRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_1.prisma.emailVerificationToken, 'EmailVerificationToken');
    }
    /**
     * Create a new email verification token
     */
    async createToken(data) {
        return this.delegate.create({
            data,
        });
    }
    /**
     * Find token by token string
     */
    async findByToken(token) {
        return this.delegate.findUnique({
            where: { token },
        });
    }
    /**
     * Delete all tokens for a specific email
     */
    async deleteByEmail(email) {
        return this.delegate.deleteMany({
            where: { email },
        });
    }
    /**
     * Delete token by ID
     */
    async deleteToken(id) {
        return this.delegate.delete({
            where: { id },
        });
    }
}
exports.EmailVerificationTokenRepository = EmailVerificationTokenRepository;
// Export singleton instance
exports.emailVerificationTokenRepository = new EmailVerificationTokenRepository();
