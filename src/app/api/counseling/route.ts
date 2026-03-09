import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CounselingRequest from '@/models/CounselingRequest';
import { getAuthUser, requireAdmin } from '@/lib/auth';

// GET: Fetch user's counseling request, or all requests for admin
export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const isAdmin = req.nextUrl.searchParams.get('admin') === 'true';
        if (isAdmin) {
            await requireAdmin(req);
            const requests = await CounselingRequest.find()
                .sort({ createdAt: -1 })
                .lean();
            return NextResponse.json({ requests });
        }

        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const request = await CounselingRequest.findOne({
            userId: user._id,
            status: { $in: ['pending', 'scheduled'] },
        }).lean();

        return NextResponse.json({ request: request || null });
    } catch (error: unknown) {
        if ((error as Error).message?.includes('Admin') || (error as Error).message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Counseling GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Create new counseling request
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check for existing active request
        const existing = await CounselingRequest.findOne({
            userId: user._id,
            status: { $in: ['pending', 'scheduled'] },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'You already have an active counseling request.' },
                { status: 400 }
            );
        }

        const { preferredTime1, preferredTime2, preferredTime3, timezone } = await req.json();

        if (!preferredTime1 || !preferredTime2 || !preferredTime3 || !timezone) {
            return NextResponse.json(
                { error: 'All 3 preferred time slots and timezone are required.' },
                { status: 400 }
            );
        }

        const request = await CounselingRequest.create({
            userId: user._id,
            userEmail: user.email,
            preferredTime1,
            preferredTime2,
            preferredTime3,
            timezone,
            status: 'pending',
        });

        return NextResponse.json({
            message: 'Your request has been recorded successfully. Our team will reach out to you via email or through the help desk once we schedule your session.',
            request,
        });
    } catch (error: unknown) {
        console.error('Counseling POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
