import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CouponCode from '@/models/CouponCode';
import { getAuthUser } from '@/lib/auth';

// Simple in-memory rate limiter (per-user, per-minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(userId: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(userId);

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(userId, { count: 1, resetAt: now + 60000 });
        return false;
    }

    entry.count++;
    if (entry.count > 5) {
        return true;
    }
    return false;
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Rate limit: max 5 validations per minute per user
        if (isRateLimited(user._id.toString())) {
            return NextResponse.json(
                { error: 'Too many requests. Please wait a moment.' },
                { status: 429 }
            );
        }

        const { code } = await req.json();

        if (!code || typeof code !== 'string') {
            return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
        }

        const normalizedCode = code.toUpperCase().trim();

        const coupon = await CouponCode.findOne({
            code: { $regex: new RegExp(`^${normalizedCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        });

        if (!coupon) {
            console.log('Coupon not found:', normalizedCode);
            return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
        }

        if (!coupon.isActive) {
            return NextResponse.json({ error: 'This coupon is no longer active' }, { status: 400 });
        }

        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
            return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 });
        }

        // For single-use coupons, check total usage
        if (coupon.type === 'single-use' && coupon.usedCount >= coupon.maxUses) {
            return NextResponse.json({ error: 'This coupon has been fully redeemed' }, { status: 400 });
        }

        // Check if this user already used this coupon
        if (coupon.usedBy.includes(user.email)) {
            return NextResponse.json({ error: 'You have already used this coupon' }, { status: 400 });
        }

        return NextResponse.json({
            valid: true,
            code: coupon.code,
            discountAmountCents: coupon.discountAmountCents,
            type: coupon.type,
            message: coupon.type === 'referral'
                ? `Referral discount: $${(coupon.discountAmountCents / 100).toFixed(2)} off`
                : `Coupon applied: $${(coupon.discountAmountCents / 100).toFixed(2)} off`,
        });
    } catch (error: unknown) {
        console.error('Coupon validation error:', error);
        return NextResponse.json(
            { error: 'Failed to validate coupon' },
            { status: 500 }
        );
    }
}
