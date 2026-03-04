import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';

// GET: List all users
export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        await requireAdmin(req);

        const users = await User.find()
            .select('-passwordHash -emailVerificationToken')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ users });
    } catch (error: unknown) {
        if ((error as Error).message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if ((error as Error).message?.includes('Admin')) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH: Update user (approve, change subscription, etc.)
export async function PATCH(req: NextRequest) {
    try {
        await dbConnect();
        await requireAdmin(req);

        const { userId, action, value } = await req.json();

        if (!userId || !action) {
            return NextResponse.json({ error: 'userId and action are required' }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        switch (action) {
            case 'changeSubscription':
                if (!['none', 'basic', 'pro', 'elite'].includes(value)) {
                    return NextResponse.json({ error: 'Invalid subscription plan' }, { status: 400 });
                }
                user.subscriptionPlan = value;
                await user.save();
                break;

            case 'changeRole':
                if (!['user', 'admin'].includes(value)) {
                    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
                }
                user.role = value;
                await user.save();
                break;

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        return NextResponse.json({
            message: 'User updated successfully',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                subscriptionPlan: user.subscriptionPlan,
            },
        });
    } catch (error: unknown) {
        if ((error as Error).message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if ((error as Error).message?.includes('Admin')) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
