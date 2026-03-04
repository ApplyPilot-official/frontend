import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

// GET: Get current user's subscription status (for session-based auth)
export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const email = req.nextUrl.searchParams.get('email');
        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        const user = await User.findOne({ email: email.toLowerCase() })
            .select('subscriptionPlan role isEmailVerified name')
            .lean();

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            subscriptionPlan: user.subscriptionPlan,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            name: user.name,
        });
    } catch (error: unknown) {
        console.error('User status error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
