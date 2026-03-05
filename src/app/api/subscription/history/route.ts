import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';
import User from '@/models/User';

export async function GET() {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email.toLowerCase() });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const payments = await Payment.find({ userId: user._id, status: 'paid' })
            .sort({ createdAt: -1 })
            .limit(20)
            .select('plan amountCents currency couponCode couponDiscountCents status createdAt')
            .lean();

        return NextResponse.json({ payments });
    } catch (error: unknown) {
        console.error('Payment history error:', error);
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }
}
