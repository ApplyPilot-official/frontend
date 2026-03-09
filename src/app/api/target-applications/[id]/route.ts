import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TargetApplication from '@/models/TargetApplication';
import { requireAdmin } from '@/lib/auth';

// PATCH: Admin updates status of a target application
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        await requireAdmin(req);

        const { status } = await req.json();
        if (!status || !['pending', 'approved', 'applied', 'not_available'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const target = await TargetApplication.findByIdAndUpdate(
            params.id,
            { status },
            { new: true }
        );

        if (!target) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Updated', target });
    } catch (error: unknown) {
        if ((error as Error).message?.includes('Admin') || (error as Error).message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Target apps PATCH error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
