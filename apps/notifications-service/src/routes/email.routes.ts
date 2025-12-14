import { Router } from 'express';
import { sendVerificationEmailHandler } from '../controllers/email.controller';

const router = Router();

/**
 * POST /api/email/verification
 * Send verification email
 */
router.post('/verification', sendVerificationEmailHandler);

export default router;
