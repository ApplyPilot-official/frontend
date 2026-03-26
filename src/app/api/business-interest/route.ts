import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BusinessInterest from '@/models/BusinessInterest';
import { requireAdmin } from '@/lib/auth';

// GET: Fetch all business interest submissions (admin only)
export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        await requireAdmin(req);

        const interests = await BusinessInterest.find()
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ interests });
    } catch (error: unknown) {
        if ((error as Error).message?.includes('Admin') || (error as Error).message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('BusinessInterest GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Submit a new business interest (public — no auth required)
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { contactName, companyName, email, phone, companySize, message } = await req.json();

        if (!contactName || !companyName || !email || !companySize) {
            return NextResponse.json(
                { error: 'Contact name, company name, email, and company size are required.' },
                { status: 400 }
            );
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
        }

        const interest = await BusinessInterest.create({
            contactName,
            companyName,
            email,
            phone: phone || undefined,
            companySize,
            message: message || undefined,
            status: 'new',
        });

        return NextResponse.json({
            message: 'Thank you! Our team will reach out to you shortly.',
            interest,
        });
    } catch (error: unknown) {
        console.error('BusinessInterest POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH: Update business interest status/notes (admin only)
export async function PATCH(req: NextRequest) {
    try {
        await dbConnect();
        await requireAdmin(req);

        const { id, status, adminNotes } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const update: Record<string, string> = {};
        if (status) update.status = status;
        if (adminNotes !== undefined) update.adminNotes = adminNotes;

        const updated = await BusinessInterest.findByIdAndUpdate(id, update, { new: true }).lean();

        if (!updated) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json({ interest: updated });
    } catch (error: unknown) {
        if ((error as Error).message?.includes('Admin') || (error as Error).message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('BusinessInterest PATCH error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
