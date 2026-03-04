import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';
import CouponCode from '@/models/CouponCode';
import { getAuthUser } from '@/lib/auth';
import { PLANS, MAX_COUPON_DISCOUNT_PAISE } from '@/lib/plans';
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
        let amountPaise = plan.amountPaise;

        let couponDiscountPaise = 0;

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

            // Calculate discount — hard cap at MAX_COUPON_DISCOUNT_PAISE (₹400 ≈ $5)
            couponDiscountPaise = Math.min(
                coupon.discountAmountCents * 100, // Convert cents concept to paise
                MAX_COUPON_DISCOUNT_PAISE
            );

            // Ensure discount doesn't exceed order amount (min ₹1 order)
            if (amountPaise - couponDiscountPaise < 100) {
                couponDiscountPaise = amountPaise - 100; // Minimum ₹1
            }

            amountPaise -= couponDiscountPaise;
        }

        // Create Razorpay order — amount is ALWAYS computed server-side
        const order = await razorpay.orders.create({
            amount: amountPaise,
            currency: 'INR',
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
            amountCents: amountPaise, // Store in paise
            currency: 'INR',
            couponCode: couponCode?.toUpperCase() || undefined,
            couponDiscountCents: couponDiscountPaise,
            status: 'created',
        });

        return NextResponse.json({
            orderId: order.id,
            amount: amountPaise,
            currency: 'INR',
            planName: plan.name,
            originalAmount: plan.amountPaise,
            discountApplied: couponDiscountPaise,
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
