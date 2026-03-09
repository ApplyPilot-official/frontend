import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

// GET: Get current user's subscription status (for session-based auth)
// Also auto-expires subscriptions that have passed their end date
export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const email = req.nextUrl.searchParams.get('email');
        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        const user = await User.findOne({ email: email.toLowerCase() })
            .select('subscriptionPlan subscriptionStartDate subscriptionEndDate role isEmailVerified name subscriptionId');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Auto-backfill: if user has an active plan but no dates, set them now
        if (
            user.subscriptionPlan !== 'none' &&
            !user.subscriptionStartDate
        ) {
            const now = new Date();
            const endDate = new Date(now);
            // Admin users get a longer default window; regular users get 30 days
            const daysToAdd = user.role === 'admin' ? 365 : 30;
            endDate.setDate(endDate.getDate() + daysToAdd);
            user.subscriptionStartDate = now;
            user.subscriptionEndDate = endDate;
            await user.save();
            console.log(`Auto-backfilled subscription dates for ${user.email}: +${daysToAdd} days`);
        }

        // Auto-expire: if subscription end date has passed, reset to 'none'
        // Skip auto-expire for admin users — they manage their own subscriptions
        if (
            user.role !== 'admin' &&
            user.subscriptionPlan !== 'none' &&
            user.subscriptionEndDate &&
            new Date(user.subscriptionEndDate) < new Date()
        ) {
            console.log(`Auto-expiring subscription for ${user.email}: endDate ${user.subscriptionEndDate} has passed`);
            user.subscriptionPlan = 'none';
            user.subscriptionId = undefined;
            user.subscriptionStartDate = undefined;
            user.subscriptionEndDate = undefined;
            await user.save();
        }

        return NextResponse.json({
            subscriptionPlan: user.subscriptionPlan,
            subscriptionStartDate: user.subscriptionStartDate || null,
            subscriptionEndDate: user.subscriptionEndDate || null,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            name: user.name,
        });
    } catch (error: unknown) {
        console.error('User status error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
