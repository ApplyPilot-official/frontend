import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LinkedInMakeover from '@/models/LinkedInMakeover';
import { getAuthUser, requireAdmin } from '@/lib/auth';

// GET: Fetch user's LinkedIn makeover request, or all requests for admin
export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const isAdmin = req.nextUrl.searchParams.get('admin') === 'true';
        if (isAdmin) {
            await requireAdmin(req);
            const requests = await LinkedInMakeover.find()
                .sort({ createdAt: -1 })
                .lean();
            return NextResponse.json({ requests });
        }

        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const request = await LinkedInMakeover.findOne({ userId: user._id }).lean();
        return NextResponse.json({ request: request || null });
    } catch (error: unknown) {
        if ((error as Error).message?.includes('Admin') || (error as Error).message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('LinkedIn makeover GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

import crypto from 'crypto';

function getEncryptionKey(): Buffer {
    const secret = process.env.JWT_SECRET || 'applypilot-default-secret-key-32b';
    return crypto.createHash('sha256').update(secret).digest();
}

function encrypt(text: string): string {
    if (!text) return '';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', getEncryptionKey(), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

// POST: Create LinkedIn makeover request (pro users only)
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check subscription — requires pro or elite
        const allowedPlans = ['pro', 'elite'];
        if (!user.subscriptionPlan || !allowedPlans.includes(user.subscriptionPlan)) {
            return NextResponse.json(
                { error: 'Upgrade to Pro or Elite plan to request a LinkedIn makeover.' },
                { status: 403 }
            );
        }

        // Check for existing request
        const existing = await LinkedInMakeover.findOne({ userId: user._id });
        if (existing) {
            return NextResponse.json(
                { error: 'You already have a LinkedIn makeover request.' },
                { status: 400 }
            );
        }

        const { linkedinUrl, notes, serviceType, linkedInLoginEmail, linkedInLoginPassword, linkedInLoginPhone } = await req.json();
        if (!linkedinUrl?.trim()) {
            return NextResponse.json(
                { error: 'LinkedIn profile URL is required.' },
                { status: 400 }
            );
        }

        const requestData: Record<string, unknown> = {
            userId: user._id,
            userEmail: user.email,
            linkedinUrl: linkedinUrl.trim(),
            notes: notes?.trim() || undefined,
            serviceType: serviceType || 'suggestions',
            status: 'pending',
        };

        // Encrypt credentials for done-for-you service
        if (serviceType === 'done_for_you') {
            if (linkedInLoginEmail) requestData.linkedInLoginEmail = encrypt(linkedInLoginEmail);
            if (linkedInLoginPassword) requestData.linkedInLoginPassword = encrypt(linkedInLoginPassword);
            if (linkedInLoginPhone) requestData.linkedInLoginPhone = encrypt(linkedInLoginPhone);
        }

        const request = await LinkedInMakeover.create(requestData);

        return NextResponse.json({
            message: 'Your LinkedIn makeover request has been recorded successfully. Our team will review your profile and reach out once the makeover is ready.',
            request,
        });
    } catch (error: unknown) {
        console.error('LinkedIn makeover POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
