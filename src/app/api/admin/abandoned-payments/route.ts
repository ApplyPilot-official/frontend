import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';
import { requireAdmin } from '@/lib/auth';
import { NextRequest } from 'next/server';

// GET: Return all abandoned/incomplete payment attempts (status = 'created')
export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        await requireAdmin(req);

        // Find payments with status 'created' that are older than 10 minutes
        // (to exclude currently in-progress checkouts)
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

        const abandonedPayments = await Payment.find({
            status: 'created',
            createdAt: { $lt: tenMinutesAgo },
        })
            .sort({ createdAt: -1 })
            .limit(200)
            .select('userEmail plan amountCents currency couponCode couponDiscountCents createdAt')
            .lean();

        return NextResponse.json({ payments: abandonedPayments });
    } catch (error: unknown) {
        if ((error as Error).message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if ((error as Error).message?.includes('Admin')) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }
        console.error('Abandoned payments fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
