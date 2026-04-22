import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sessionRepository } from '@platform/db';

interface DecodedUser {
    userId: string;
    email: string;
    roles?: string[] | Record<string, string[]>;
    sessionId?: string;
    [key: string]: any;
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?: DecodedUser;
        }
    }
}

/**
 * DB Gatekeeper Middleware
 * Validates JWT signature AND checks session still exists in the database.
 * This enforces instant logout when a session is revoked.
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'Authorization header missing' });
        return;
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET || 'super-secret-key-change-me';

    try {
        const decoded = jwt.verify(token, secret) as DecodedUser;

        // DB Gatekeeper: verify session still exists (not revoked)
        if (decoded.sessionId) {
            const session = await sessionRepository.findById(decoded.sessionId);

            if (!session || (session as any).expires < new Date()) {
                res.status(401).json({ success: false, message: 'Session revoked', messageCode: 'AUTH_SESSION_REVOKED' });
                return;
            }
        }

        req.user = decoded;
        next();
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({ success: false, message: 'Token expired' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }
    }
};
