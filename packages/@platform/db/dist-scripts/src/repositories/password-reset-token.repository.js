"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordResetTokenRepository = exports.PasswordResetTokenRepository = void 0;
const client_1 = require("../client");
const base_repository_1 = require("./base.repository");
/**
 * PasswordResetToken Repository
 *
 * Handles all database operations related to password reset tokens.
 */
class PasswordResetTokenRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_1.prisma.passwordResetToken, 'PasswordResetToken');
    }
    /**
     * Create a new password reset token
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
     * Delete token by ID
     */
    async deleteToken(id) {
        return this.delegate.delete({
            where: { id },
        });
    }
}
exports.PasswordResetTokenRepository = PasswordResetTokenRepository;
// Export singleton instance
exports.passwordResetTokenRepository = new PasswordResetTokenRepository();
