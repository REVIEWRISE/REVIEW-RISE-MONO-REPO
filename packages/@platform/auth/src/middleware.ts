import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sessionRepository } from '@platform/db';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';

export interface AuthenticatedUser {
    userId: string;
    email: string;
    roles?: any;
    sessionId?: string;
    locationId?: string;
    [key: string]: any;
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?: AuthenticatedUser;
        }
    }
}

/**
 * DB Gatekeeper Middleware
 * 
 * Validates the JWT signature AND actively checks the database to confirm
 * the session has not been revoked. This enables instant logout across all
 * devices when a session is deleted from the database.
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'Authorization header missing' });
        return;
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;

        // DB Gatekeeper: if the token embeds a sessionId, verify it still exists
        if (decoded.sessionId) {
            const session = await sessionRepository.findById(decoded.sessionId);

            if (!session || session.expires < new Date()) {
                res.status(401).json({ success: false, message: 'Session has been revoked', messageCode: 'AUTH_SESSION_REVOKED' });
                return;
            }
        }

        req.user = decoded;
        next();
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({ success: false, message: 'Token expired', messageCode: 'AUTH_TOKEN_EXPIRED' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid token', messageCode: 'AUTH_INVALID_TOKEN' });
        }
    }
};

export const requireRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const userRoles: string[] = Array.isArray(req.user.roles) ? req.user.roles
            : typeof req.user.roles === 'object' && req.user.roles !== null
                ? Object.values(req.user.roles).flat() as string[]
                : req.user.role ? [req.user.role]
                    : [];

        const hasRole = roles.some(r => userRoles.includes(r));

        if (!hasRole) {
            res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
            return;
        }

        next();
    };
};
