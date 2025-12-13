import { Router } from 'express';
import {
    loginAttemptLimiter,
    createUserLimiter,
    passwordResetLimiter,
    refreshTokenLimiter,
    forgotPasswordLimiter,
} from '../../middlewares/rateLimiter';
import { register, login, refreshToken, forgotPassword, resetPassword } from '../../controllers/auth.controller';

const router = Router();

router.post('/register', createUserLimiter, register);
router.post('/login', loginAttemptLimiter, login);
router.post('/refresh-token', refreshTokenLimiter, refreshToken);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPassword);

export default router;