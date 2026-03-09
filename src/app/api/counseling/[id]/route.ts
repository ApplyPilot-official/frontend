import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CounselingRequest from '@/models/CounselingRequest';
import { requireAdmin } from '@/lib/auth';

// PATCH: Admin updates counseling request status
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        await requireAdmin(req);

        const { status } = await req.json();
        if (!['pending', 'scheduled', 'completed'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const request = await CounselingRequest.findByIdAndUpdate(
            params.id,
            { status },
            { new: true }
        );

        if (!request) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Status updated', request });
    } catch (error: unknown) {
        if ((error as Error).message?.includes('Admin') || (error as Error).message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Counseling PATCH error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
