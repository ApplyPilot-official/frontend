import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Profile from '@/models/Profile';
import { getAuthUser } from '@/lib/auth';
import { encryptCredentials, CREDENTIAL_FIELDS } from '@/lib/encryption';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const profile = await Profile.findOne({ userId: user._id });
        if (!profile) {
            return NextResponse.json({ error: 'No profile found' }, { status: 404 });
        }

        if (!profile.extractedData) {
            return NextResponse.json(
                { error: 'No extracted data found. Please process your resume first.' },
                { status: 400 }
            );
        }

        const gapAnswers = await req.json();

        // Start with extractedData as the base
        const masterProfile: Record<string, unknown> = { ...(profile.extractedData as Record<string, unknown>) };

        // Merge gap answers — handle both flat fields and array fields
        for (const [key, value] of Object.entries(gapAnswers)) {
            if (value === undefined) continue;

            // Check if this is a credential field that needs encryption
            if (CREDENTIAL_FIELDS.includes(key) && typeof value === 'string' && value) {
                const encrypted = encryptCredentials({ [key]: value });
                masterProfile[key] = encrypted[key];
            } else {
                masterProfile[key] = value;
            }
        }

        // Save merged profile
        profile.masterProfile = masterProfile;
        profile.processingStatus = 'complete';
        profile.gapFields = [];
        await profile.save();

        return NextResponse.json({
            message: 'Profile completed successfully',
            processingStatus: 'complete',
        });
    } catch (error: unknown) {
        console.error('Gap submit error:', error);
        return NextResponse.json({ error: 'Failed to save profile data' }, { status: 500 });
    }
}
