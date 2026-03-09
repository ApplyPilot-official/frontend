import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PortfolioRequest from '@/models/PortfolioRequest';
import { getAuthUser, requireAdmin } from '@/lib/auth';

// GET: Fetch user's portfolio request, or all requests for admin
export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const isAdmin = req.nextUrl.searchParams.get('admin') === 'true';
        if (isAdmin) {
            await requireAdmin(req);
            const requests = await PortfolioRequest.find()
                .sort({ createdAt: -1 })
                .lean();
            return NextResponse.json({ requests });
        }

        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const request = await PortfolioRequest.findOne({ userId: user._id }).lean();
        return NextResponse.json({ request: request || null });
    } catch (error: unknown) {
        if ((error as Error).message?.includes('Admin') || (error as Error).message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Portfolio GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Create portfolio request (paid users only)
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check subscription
        if (!user.subscriptionPlan || user.subscriptionPlan === 'none') {
            return NextResponse.json(
                { error: 'Upgrade your plan to request a portfolio website.' },
                { status: 403 }
            );
        }

        // Check for existing request
        const existing = await PortfolioRequest.findOne({ userId: user._id });
        if (existing) {
            return NextResponse.json(
                { error: 'You already have a portfolio request.' },
                { status: 400 }
            );
        }

        const request = await PortfolioRequest.create({
            userId: user._id,
            userEmail: user.email,
            status: 'pending',
        });

        return NextResponse.json({
            message: 'Your request has been recorded successfully. Our team will start working on your portfolio website and notify you once it is ready. The website link will appear in your profile.',
            request,
        });
    } catch (error: unknown) {
        console.error('Portfolio POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
