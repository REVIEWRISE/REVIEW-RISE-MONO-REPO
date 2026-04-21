import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sessionRepository } from '@platform/db';

interface DecodedUser {
    id: string;
    userId: string;
    email: string;
    role?: string;
    roles?: any;
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
        res.status(401).json({ message: 'Authorization header missing' });
        return;
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        console.error('JWT_SECRET not configured');
        res.status(500).json({ message: 'Internal server error' });
        return;
    }

    try {
        const decoded = jwt.verify(token, secret) as DecodedUser;

        // DB Gatekeeper: verify session still exists (not revoked)
        if (decoded.sessionId) {
            const session = await sessionRepository.findById(decoded.sessionId);

            if (!session || (session as any).expires < new Date()) {
                res.status(401).json({ message: 'Session revoked', messageCode: 'AUTH_SESSION_REVOKED' });
                return;
            }
        }

        req.user = { ...decoded, id: decoded.userId ?? decoded.id };
        next();
    } catch {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export const requireRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        if (req.user.role && roles.includes(req.user.role)) {
            next();
        } else {
            res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }
    };
};
