import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Profile from '@/models/Profile';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';

// GET: List all profiles with user email (admin only)
export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        await requireAdmin(req);

        const profiles = await Profile.find()
            .select('-resumeBase64 -extractedData -masterProfile')
            .sort({ updatedAt: -1 })
            .lean();

        // Attach user emails
        const userIds = profiles.map(p => p.userId);
        const users = await User.find({ _id: { $in: userIds } }).select('email name').lean();
        const userMap = new Map(users.map(u => [u._id.toString(), u]));

        const result = profiles.map(p => ({
            ...p,
            userEmail: userMap.get(p.userId.toString())?.email || 'Unknown',
            userName: userMap.get(p.userId.toString())?.name || 'Unknown',
        }));

        return NextResponse.json({ profiles: result });
    } catch (error: unknown) {
        if ((error as Error).message?.includes('Admin') || (error as Error).message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Admin profiles GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH: Admin updates profile processing status (e.g. accept / reject)
export async function PATCH(req: NextRequest) {
    try {
        await dbConnect();
        await requireAdmin(req);

        const { profileId, processingStatus } = await req.json();
        if (!profileId || !processingStatus) {
            return NextResponse.json({ error: 'profileId and processingStatus required' }, { status: 400 });
        }

        const validStatuses = ['uploaded', 'processing', 'needs_input', 'complete', 'approved', 'failed'];
        if (!validStatuses.includes(processingStatus)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const profile = await Profile.findByIdAndUpdate(
            profileId,
            { processingStatus },
            { new: true }
        ).select('-resumeBase64 -extractedData -masterProfile');

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Profile status updated', profile });
    } catch (error: unknown) {
        if ((error as Error).message?.includes('Admin') || (error as Error).message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Admin profiles PATCH error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
