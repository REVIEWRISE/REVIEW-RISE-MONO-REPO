import { Request, Response } from 'express';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import { userRepository } from '@platform/db';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { z } from 'zod';
import { registerSchema } from '../validations/auth.validation';

dotenv.config({ path: '../../.env' });
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.example' });

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}

export const register = async (req: Request, res: Response) => {
    try {
        // Validate and normalize input using Zod
        // This will throw if validation fails
        const { email, password, firstName, lastName } = registerSchema.parse(req.body);

        const existingUser = await userRepository.findByEmail(email);

        if (existingUser) {
            return res.status(400).json(
                createErrorResponse('User already exists', ErrorCode.BAD_REQUEST, 400)
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userRepository.createCustomer({
            email,
            password: hashedPassword,
            name: `${firstName} ${lastName}`,
        });

        res.status(201).json(
            createSuccessResponse({ userId: user.id }, 'User created successfully', 201)
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            const validationErrors = error.issues.map(e => ({
                field: e.path.join('.'),
                message: e.message
            }));

            return res.status(400).json(
                createErrorResponse('Validation failed', ErrorCode.BAD_REQUEST, 400, validationErrors)
            );
        }

        console.error('Registration error:', error);
        res.status(500).json(
            createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500)
        );
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { userRoles: { include: { role: true } } }
        });

        if (!user || !user.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate Access Token (JWT)
        const accessToken = jwt.sign(
            { userId: user.id, email: user.email, roles: user.userRoles.map(ur => ur.role.name) },
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        // Generate Refresh Token (Session)
        const refreshToken = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

        await prisma.session.create({
            data: {
                sessionToken: refreshToken,
                userId: user.id,
                expires: expiresAt,
            }
        });

        res.json({
            message: 'Login successful',
            accessToken,
            refreshToken
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
    }

    try {
        const session = await prisma.session.findUnique({
            where: { sessionToken: refreshToken },
            include: { user: { include: { userRoles: { include: { role: true } } } } }
        });

        if (!session) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        if (session.expires < new Date()) {
            await prisma.session.delete({ where: { id: session.id } });
            return res.status(401).json({ message: 'Refresh token expired' });
        }

        const user = session.user;
        const newAccessToken = jwt.sign(
            { userId: user.id, email: user.email, roles: user.userRoles.map(ur => ur.role.name) },
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.json({
            accessToken: newAccessToken
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};