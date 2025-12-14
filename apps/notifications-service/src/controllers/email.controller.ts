import { Request, Response } from 'express';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import { sendVerificationEmail } from '../services/email.service';

/**
 * Validation schema for verification email request
 */
const sendVerificationEmailSchema = z.object({
    email: z.string().email('Invalid email address'),
    token: z.string().min(1, 'Token is required'),
});

/**
 * Send verification email
 */
export const sendVerificationEmailHandler = async (req: Request, res: Response) => {
    try {
        // Validate request body
        const { email, token } = sendVerificationEmailSchema.parse(req.body);

        await sendVerificationEmail(email, token);

        res.status(200).json(
            createSuccessResponse({}, 'Verification email sent successfully')
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            const validationErrors = error.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message
            }));

            return res.status(400).json(
                createErrorResponse('Validation failed', ErrorCode.BAD_REQUEST, 400, validationErrors)
            );
        }

        console.error('Error sending verification email:', error);
        res.status(500).json(
            createErrorResponse('Failed to send verification email', ErrorCode.INTERNAL_SERVER_ERROR, 500)
        );
    }
};
