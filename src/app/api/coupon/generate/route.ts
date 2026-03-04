import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CouponCode from '@/models/CouponCode';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const admin = await requireAdmin(req);

        const {
            code,
            discountAmountCents,
            type = 'single-use',
            maxUses = 1,
            expiresAt,
            generationType = 'custom',
        } = await req.json();

        if (!code || typeof code !== 'string') {
            return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
        }

        // Sanitize code
        const sanitizedCode = code.toUpperCase().replace(/[^A-Z0-9_-]/g, '').trim();

        if (sanitizedCode.length < 3 || sanitizedCode.length > 30) {
            return NextResponse.json(
                { error: 'Code must be 3-30 characters (letters, numbers, hyphens, underscores)' },
                { status: 400 }
            );
        }

        // Enforce $5 max discount — HARD CAP
        const clampedDiscount = Math.min(Math.max(discountAmountCents || 100, 1), 500);

        // Check for existing code
        const existing = await CouponCode.findOne({ code: sanitizedCode });
        if (existing) {
            return NextResponse.json({ error: 'A coupon with this code already exists' }, { status: 409 });
        }

        // For referral type, set high maxUses (effectively unlimited re-use by different users)
        const effectiveMaxUses = type === 'referral' ? 999999 : Math.min(maxUses, 100);

        const coupon = await CouponCode.create({
            code: sanitizedCode,
            discountAmountCents: clampedDiscount,
            type,
            maxUses: effectiveMaxUses,
            isActive: true,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
            createdBy: admin.email,
            generationType,
        });

        return NextResponse.json({
            message: 'Coupon created successfully',
            coupon: {
                code: coupon.code,
                discountAmountCents: coupon.discountAmountCents,
                type: coupon.type,
                maxUses: coupon.maxUses,
                expiresAt: coupon.expiresAt,
                generationType: coupon.generationType,
            },
        });
    } catch (error: unknown) {
        console.error('Coupon generation error:', error);
        if ((error as Error).message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if ((error as Error).message?.includes('Admin')) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }
        return NextResponse.json(
            { error: 'Failed to create coupon' },
            { status: 500 }
        );
    }
}

// GET: List all coupons (admin only)
export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        await requireAdmin(req);

        const coupons = await CouponCode.find()
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ coupons });
    } catch (error: unknown) {
        console.error('Coupon list error:', error);
        if ((error as Error).message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if ((error as Error).message?.includes('Admin')) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }
        return NextResponse.json(
            { error: 'Failed to list coupons' },
            { status: 500 }
        );
    }
}
