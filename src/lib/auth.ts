import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from './db';
import User, { IUser } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'applypilot-jwt-secret';

export function signJWT(payload: Record<string, unknown>): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyJWT(token: string): Record<string, unknown> | null {
    try {
        return jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
    } catch {
        return null;
    }
}

export async function getAuthUser(req: NextRequest): Promise<IUser | null> {
    // First try JWT from Authorization header (for email/password users)
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = verifyJWT(token);
        if (decoded?.userId) {
            await dbConnect();
            const user = await User.findById(decoded.userId);
            return user;
        }
    }

    // Fallback to NextAuth session (for Google OAuth users)
    try {
        const session = await getServerSession();
        if (session?.user?.email) {
            await dbConnect();
            const user = await User.findOne({ email: session.user.email });
            return user;
        }
    } catch {
        // Session not available
    }

    return null;
}

export async function requireAuth(req: NextRequest): Promise<IUser> {
    const user = await getAuthUser(req);
    if (!user) {
        throw new Error('Unauthorized');
    }
    return user;
}

export async function requireAdmin(req: NextRequest): Promise<IUser> {
    const user = await requireAuth(req);
    if (user.role !== 'admin') {
        throw new Error('Forbidden: Admin access required');
    }
    return user;
}
