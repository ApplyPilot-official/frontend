import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        await requireAdmin(req);

        const stats = await Payment.aggregate([
            { $match: { status: 'paid' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amountCents' },
                    totalPayments: { $sum: 1 },
                    byPlan: {
                        $push: '$plan',
                    },
                },
            },
        ]);

        const payments = await Payment.find()
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        const planCounts = stats[0]?.byPlan?.reduce(
            (acc: Record<string, number>, plan: string) => {
                acc[plan] = (acc[plan] || 0) + 1;
                return acc;
            },
            {}
        ) || {};

        return NextResponse.json({
            stats: {
                totalRevenue: stats[0]?.totalRevenue || 0,
                totalPayments: stats[0]?.totalPayments || 0,
                planCounts,
            },
            recentPayments: payments,
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
