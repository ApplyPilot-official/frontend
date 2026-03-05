import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST() {
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

        if (user.subscriptionPlan === 'none') {
            return NextResponse.json({ error: 'No active subscription to cancel' }, { status: 400 });
        }

        const previousPlan = user.subscriptionPlan;

        // Cancel the subscription
        user.subscriptionPlan = 'none';
        user.subscriptionId = undefined;
        user.subscriptionStartDate = undefined;
        user.subscriptionEndDate = undefined;
        await user.save();

        return NextResponse.json({
            message: 'Subscription cancelled successfully',
            previousPlan,
        });
    } catch (error: unknown) {
        console.error('Cancel subscription error:', error);
        return NextResponse.json(
            { error: 'Failed to cancel subscription' },
            { status: 500 }
        );
    }
}
