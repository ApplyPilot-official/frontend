import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Profile from '@/models/Profile';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const profile = await Profile.findOne({ userId: user._id })
            .select('processingStatus gapFields failedSection extractedData masterProfile resumeFileName resumeUploadedAt')
            .lean();

        if (!profile) {
            return NextResponse.json({
                processingStatus: null,
                gapFields: null,
                failedSection: null,
            });
        }

        return NextResponse.json({
            processingStatus: profile.processingStatus,
            gapFields: profile.gapFields || null,
            failedSection: profile.failedSection || null,
            hasExtractedData: !!profile.extractedData,
            hasMasterProfile: !!profile.masterProfile,
            resumeFileName: profile.resumeFileName || null,
            resumeUploadedAt: profile.resumeUploadedAt || null,
        });
    } catch (error: unknown) {
        console.error('Profile status error:', error);
        return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
    }
}
