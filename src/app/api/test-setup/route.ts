import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import CouponCode from '@/models/CouponCode';

// TEMPORARY: Test setup endpoint — remove after testing
export async function GET() {
    try {
        await dbConnect();

        // Update test user to verified + admin (DO NOT touch subscriptionPlan!)
        const user = await User.findOneAndUpdate(
            { email: 'rahj45419@gmail.com' },
            {
                isEmailVerified: true,
                role: 'admin',
            },
            { new: true }
        );

        // Create test coupons
        await CouponCode.deleteMany({ code: { $in: ['WELCOME50', 'RAHUL-REF'] } });

        await CouponCode.create([
            {
                code: 'WELCOME50',
                discountAmountCents: 500,
                type: 'single-use',
                maxUses: 10,
                isActive: true,
                createdBy: 'admin@applypilot.com',
                generationType: 'custom',
            },
            {
                code: 'RAHUL-REF',
                discountAmountCents: 300,
                type: 'referral',
                maxUses: 999999,
                isActive: true,
                createdBy: 'admin@applypilot.com',
                generationType: 'username',
            },
        ]);

        return NextResponse.json({
            message: 'Test setup complete',
            user: user ? {
                email: user.email,
                role: user.role,
                verified: user.isEmailVerified,
                plan: user.subscriptionPlan,
            } : 'NOT FOUND',
            coupons: ['WELCOME50 ($5 single-use)', 'RAHUL-REF ($3 referral)'],
        });
    } catch (error: unknown) {
        console.error('Setup error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
