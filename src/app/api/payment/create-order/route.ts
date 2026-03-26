import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';
import CouponCode from '@/models/CouponCode';
import { getAuthUser } from '@/lib/auth';
import { PLANS, MAX_COUPON_DISCOUNT_CENTS } from '@/lib/plans';
import type { PlanType } from '@/lib/plans';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        // Get authenticated user
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { planId, couponCode } = await req.json();

        // Validate plan
        if (!planId || !PLANS[planId as PlanType]) {
            return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
        }

        const plan = PLANS[planId as PlanType];
        let amountCents = plan.amountCents;

        let couponDiscountCents = 0;

        // Validate and apply coupon if provided
        if (couponCode) {
            const coupon = await CouponCode.findOne({
                code: couponCode.toUpperCase().trim(),
            });

            if (!coupon) {
                return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 });
            }

            if (!coupon.isActive) {
                return NextResponse.json({ error: 'This coupon is no longer active' }, { status: 400 });
            }

            if (coupon.expiresAt && coupon.expiresAt < new Date()) {
                return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 });
            }

            // For single-use: check maxUses
            if (coupon.type === 'single-use' && coupon.usedCount >= coupon.maxUses) {
                return NextResponse.json({ error: 'This coupon has been fully redeemed' }, { status: 400 });
            }

            // Check if this specific user already used this coupon
            if (coupon.usedBy.includes(user.email)) {
                return NextResponse.json({ error: 'You have already used this coupon' }, { status: 400 });
            }

            // Calculate discount — hard cap at MAX_COUPON_DISCOUNT_CENTS ($5.00)
            couponDiscountCents = Math.min(
                coupon.discountAmountCents,
                MAX_COUPON_DISCOUNT_CENTS
            );

            // Ensure discount doesn't exceed order amount (min $1.00 order)
            if (amountCents - couponDiscountCents < 100) {
                couponDiscountCents = amountCents - 100; // Minimum $1.00
            }

            amountCents -= couponDiscountCents;
        }

        // Create Razorpay order — amount is ALWAYS computed server-side
        const order = await razorpay.orders.create({
            amount: amountCents,
            currency: 'USD',
            receipt: `rcpt_${user._id.toString().slice(-8)}_${Date.now().toString(36)}`,
            notes: {
                userId: user._id.toString(),
                userEmail: user.email,
                plan: planId,
                couponCode: couponCode || '',
            },
        });

        // Save payment record
        await Payment.create({
            userId: user._id,
            userEmail: user.email,
            razorpayOrderId: order.id,
            plan: planId,
            amountCents: amountCents,
            currency: 'USD',
            couponCode: couponCode?.toUpperCase() || undefined,
            couponDiscountCents: couponDiscountCents,
            status: 'created',
        });

        return NextResponse.json({
            orderId: order.id,
            amount: amountCents,
            currency: 'USD',
            planName: plan.name,
            originalAmount: plan.amountCents,
            discountApplied: couponDiscountCents,
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        });
    } catch (error: unknown) {
        console.error('Create order error:', error);
        return NextResponse.json(
            { error: 'Failed to create payment order' },
            { status: 500 }
        );
    }
}
