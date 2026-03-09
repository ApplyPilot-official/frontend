import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LinkedInMakeover from '@/models/LinkedInMakeover';
import { requireAdmin } from '@/lib/auth';

// PATCH: Admin updates LinkedIn makeover request status and/or deliverable URL
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        await requireAdmin(req);

        const { status, deliverableUrl } = await req.json();

        const update: Record<string, unknown> = {};
        if (status) {
            if (!['pending', 'in_progress', 'completed'].includes(status)) {
                return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
            }
            update.status = status;
        }
        if (deliverableUrl !== undefined) {
            update.deliverableUrl = deliverableUrl;
        }

        const request = await LinkedInMakeover.findByIdAndUpdate(
            params.id,
            update,
            { new: true }
        );

        if (!request) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Updated', request });
    } catch (error: unknown) {
        if ((error as Error).message?.includes('Admin') || (error as Error).message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('LinkedIn makeover PATCH error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
