import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MockInterviewRequest from '@/models/MockInterviewRequest';
import { getAuthUser, requireAdmin } from '@/lib/auth';

// GET: Fetch user's mock interview request, or all requests for admin
export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const isAdmin = req.nextUrl.searchParams.get('admin') === 'true';
        if (isAdmin) {
            await requireAdmin(req);
            const requests = await MockInterviewRequest.find()
                .sort({ createdAt: -1 })
                .lean();
            return NextResponse.json({ requests });
        }

        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const request = await MockInterviewRequest.findOne({
            userId: user._id,
            status: { $in: ['pending', 'confirmed'] },
        }).lean();

        return NextResponse.json({ request: request || null });
    } catch (error: unknown) {
        if ((error as Error).message?.includes('Admin') || (error as Error).message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('MockInterview GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Create new mock interview request
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check for existing active request
        const existing = await MockInterviewRequest.findOne({
            userId: user._id,
            status: { $in: ['pending', 'confirmed'] },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'You already have an active mock interview request.' },
                { status: 400 }
            );
        }

        const { preferredSlot1, preferredSlot2, preferredSlot3, timezone, interviewType, notes } = await req.json();

        if (!preferredSlot1 || !preferredSlot2 || !preferredSlot3 || !timezone || !interviewType) {
            return NextResponse.json(
                { error: 'All 3 preferred slots, timezone, and interview type are required.' },
                { status: 400 }
            );
        }

        const request = await MockInterviewRequest.create({
            userId: user._id,
            userEmail: user.email,
            preferredSlot1,
            preferredSlot2,
            preferredSlot3,
            timezone,
            interviewType,
            notes: notes || undefined,
            status: 'pending',
        });

        return NextResponse.json({
            message: 'Your mock interview request has been submitted successfully! We will confirm a slot and reach out to you soon.',
            request,
        });
    } catch (error: unknown) {
        console.error('MockInterview POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH: Update mock interview status (admin)
export async function PATCH(req: NextRequest) {
    try {
        await dbConnect();
        await requireAdmin(req);

        const { id, status, confirmedSlot } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const update: Record<string, string> = {};
        if (status) update.status = status;
        if (confirmedSlot !== undefined) update.confirmedSlot = confirmedSlot;

        const updated = await MockInterviewRequest.findByIdAndUpdate(id, update, { new: true }).lean();

        if (!updated) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json({ request: updated });
    } catch (error: unknown) {
        if ((error as Error).message?.includes('Admin') || (error as Error).message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('MockInterview PATCH error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
