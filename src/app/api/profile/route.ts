import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Profile from '@/models/Profile';
import { getAuthUser } from '@/lib/auth';

// GET: Fetch current user's profile
export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const profile = await Profile.findOne({ userId: user._id }).lean();

        return NextResponse.json({ profile: profile || null });
    } catch (error: unknown) {
        console.error('Profile fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Create or update profile
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();

        // Sanitize inputs
        const profileData = {
            userId: user._id,
            fullName: data.fullName || user.name,
            mobileNumber: data.mobileNumber,
            city: data.city,
            state: data.state,
            linkedinUrl: data.linkedinUrl,
            githubUrl: data.githubUrl,
            yearsOfExperience: data.yearsOfExperience,
            currentJobTitle: data.currentJobTitle,
            targetJobTitle: data.targetJobTitle,
            skills: data.skills || [],
            workExperience: data.workExperience || [],
            projects: data.projects || [],
            education: data.education || [],
            visaStatus: data.visaStatus,
            visaType: data.visaType,
            workAuthorization: data.workAuthorization,
            linkedinEmail: data.linkedinEmail,
            linkedinPassword: data.linkedinPassword,
            gmailAppPassword: data.gmailAppPassword,
            resumeUrl: data.resumeUrl,
            isProfileComplete: true,
        };

        const profile = await Profile.findOneAndUpdate(
            { userId: user._id },
            profileData,
            { upsert: true, new: true, runValidators: true }
        );

        return NextResponse.json({
            message: 'Profile saved successfully',
            profile,
        });
    } catch (error: unknown) {
        console.error('Profile save error:', error);
        return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
    }
}
