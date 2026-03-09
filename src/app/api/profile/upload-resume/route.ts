import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Profile from '@/models/Profile';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { resumeBase64, resumeMimeType, resumeFileName } = await req.json();

        if (!resumeBase64 || !resumeMimeType || !resumeFileName) {
            return NextResponse.json(
                { error: 'Missing required fields: resumeBase64, resumeMimeType, resumeFileName' },
                { status: 400 }
            );
        }

        // Validate mime type
        const allowedMimes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
        ];
        if (!allowedMimes.includes(resumeMimeType)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only PDF and DOCX are supported.' },
                { status: 400 }
            );
        }

        // Upsert profile with resume data
        const profile = await Profile.findOneAndUpdate(
            { userId: user._id },
            {
                userId: user._id,
                resumeBase64,
                resumeMimeType,
                resumeFileName,
                resumeUploadedAt: new Date(),
                processingStatus: 'uploaded',
                extractedData: null,
                gapFields: null,
                masterProfile: null,
                failedSection: null,
            },
            { upsert: true, new: true, runValidators: true }
        );

        return NextResponse.json({
            message: 'Resume uploaded successfully',
            processingStatus: profile.processingStatus,
        });
    } catch (error: unknown) {
        console.error('Resume upload error:', error);
        return NextResponse.json({ error: 'Failed to upload resume' }, { status: 500 });
    }
}
