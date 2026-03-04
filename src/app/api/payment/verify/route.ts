import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';
import CouponCode from '@/models/CouponCode';
import { getAuthUser } from '@/lib/auth';
import { sendPaymentConfirmationEmail } from '@/lib/email';
import { PLANS } from '@/lib/plans';
import type { PlanType } from '@/lib/plans';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = await req.json();

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json(
                { error: 'Missing payment verification data' },
                { status: 400 }
            );
        }

        // CRITICAL: Verify Razorpay signature using HMAC SHA256
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            console.error('Payment signature verification FAILED', {
                orderId: razorpay_order_id,
                userId: user._id,
            });

            // Mark payment as failed
            await Payment.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                { status: 'failed' }
            );

            return NextResponse.json(
                { error: 'Payment verification failed — signature mismatch' },
                { status: 400 }
            );
        }

        // Find the payment record
        const payment = await Payment.findOne({
            razorpayOrderId: razorpay_order_id,
        });

        if (!payment) {
            return NextResponse.json(
                { error: 'Payment order not found' },
                { status: 404 }
            );
        }

        // Verify the payment belongs to this user
        if (payment.userId.toString() !== user._id.toString()) {
            return NextResponse.json(
                { error: 'Payment does not belong to this user' },
                { status: 403 }
            );
        }

        // Prevent double-processing
        if (payment.status === 'paid') {
            return NextResponse.json({
                message: 'Payment already verified',
                plan: payment.plan,
            });
        }

        // Update payment record
        payment.razorpayPaymentId = razorpay_payment_id;
        payment.razorpaySignature = razorpay_signature;
        payment.status = 'paid';
        await payment.save();

        // Update user subscription
        const planType = payment.plan as PlanType;
        user.subscriptionPlan = planType;
        user.subscriptionId = razorpay_payment_id;
        await user.save();

        // Update coupon usage if a coupon was used
        if (payment.couponCode) {
            const coupon = await CouponCode.findOne({ code: payment.couponCode });
            if (coupon) {
                coupon.usedCount += 1;
                coupon.usedBy.push(user.email);

                // Track referral conversion
                if (coupon.type === 'referral') {
                    coupon.referralConversions.push({
                        userEmail: user.email,
                        plan: payment.plan,
                        convertedAt: new Date(),
                    });
                }

                await coupon.save();
            }
        }

        // Send confirmation email (don't block response)
        const plan = PLANS[planType];
        sendPaymentConfirmationEmail(
            user.email,
            user.name,
            plan?.name || payment.plan,
            `₹${(payment.amountCents / 100).toFixed(2)}`
        ).catch((err) => console.error('Confirmation email failed:', err));

        return NextResponse.json({
            message: 'Payment verified successfully!',
            plan: payment.plan,
            subscriptionPlan: planType,
        });
    } catch (error: unknown) {
        console.error('Payment verification error:', error);
        return NextResponse.json(
            { error: 'Payment verification failed' },
            { status: 500 }
        );
    }
}
