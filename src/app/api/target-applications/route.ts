import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TargetApplication from '@/models/TargetApplication';
import { getAuthUser, requireAdmin } from '@/lib/auth';

// GET: Fetch user's targets, or all targets for admin
export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const isAdmin = req.nextUrl.searchParams.get('admin') === 'true';
        if (isAdmin) {
            await requireAdmin(req);
            const targets = await TargetApplication.find()
                .sort({ createdAt: -1 })
                .lean();
            return NextResponse.json({ targets });
        }

        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const targets = await TargetApplication.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .lean();
        return NextResponse.json({ targets });
    } catch (error: unknown) {
        if ((error as Error).message?.includes('Admin') || (error as Error).message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Target apps GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: User submits a target company or role
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { type, name } = await req.json();
        if (!type || !name?.trim()) {
            return NextResponse.json({ error: 'Type and name are required' }, { status: 400 });
        }
        if (!['company', 'role'].includes(type)) {
            return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }

        // Check for duplicate
        const existing = await TargetApplication.findOne({
            userId: user._id,
            type,
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        });
        if (existing) {
            return NextResponse.json({ error: `You already submitted this ${type}.` }, { status: 400 });
        }

        // Roles are auto-approved; companies need admin review
        const status = type === 'role' ? 'approved' : 'pending';

        const target = await TargetApplication.create({
            userId: user._id,
            userEmail: user.email,
            type,
            name: name.trim(),
            status,
        });

        return NextResponse.json({
            message: type === 'role'
                ? 'Role added and auto-approved!'
                : 'Company submitted for review. Admin will update once applied.',
            target,
        });
    } catch (error: unknown) {
        console.error('Target apps POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE: User removes one of their targets
export async function DELETE(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { targetId } = await req.json();
        const target = await TargetApplication.findOneAndDelete({
            _id: targetId,
            userId: user._id,
        });
        if (!target) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Removed' });
    } catch (error: unknown) {
        console.error('Target apps DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
