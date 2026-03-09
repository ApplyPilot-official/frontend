import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Profile from '@/models/Profile';
import { getAuthUser } from '@/lib/auth';
import { encryptCredentials, CREDENTIAL_FIELDS, decryptCredentials } from '@/lib/encryption';

// GET: Fetch current user's profile
export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const profile = await Profile.findOne({ userId: user._id }).lean();

        if (!profile) {
            return NextResponse.json({ profile: null });
        }

        // Return profile without resumeBase64 (never send to client)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { resumeBase64: _rb, ...safeProfile } = profile as unknown as Record<string, unknown>;

        // Mask credential fields for display
        if (safeProfile.masterProfile) {
            const mp = { ...(safeProfile.masterProfile as Record<string, unknown>) };
            for (const field of CREDENTIAL_FIELDS) {
                if (mp[field] && typeof mp[field] === 'string') {
                    // Decrypt to get length, then mask
                    try {
                        const decrypted = decryptCredentials({ [field]: mp[field] });
                        const val = decrypted[field] as string;
                        if (field.toLowerCase().includes('password')) {
                            mp[field] = '••••••••';
                        } else if (val && val.length > 4) {
                            mp[field] = val.substring(0, 2) + '•'.repeat(val.length - 4) + val.substring(val.length - 2);
                        }
                    } catch {
                        mp[field] = '••••••••';
                    }
                }
            }
            safeProfile.masterProfile = mp;
        }

        return NextResponse.json({ profile: safeProfile });
    } catch (error: unknown) {
        console.error('Profile fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Create or update profile (legacy — kept for compatibility)
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();

        const profile = await Profile.findOneAndUpdate(
            { userId: user._id },
            { userId: user._id, ...data },
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

// PATCH: Inline field edit — update a single field in masterProfile
export async function PATCH(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { fieldPath, value } = await req.json();

        if (!fieldPath) {
            return NextResponse.json({ error: 'fieldPath is required' }, { status: 400 });
        }

        // Determine if this is a credential field
        const fieldKey = fieldPath.split('.').pop() || '';
        let finalValue = value;

        if (CREDENTIAL_FIELDS.includes(fieldKey) && typeof value === 'string' && value) {
            const encrypted = encryptCredentials({ [fieldKey]: value });
            finalValue = encrypted[fieldKey];
        }

        const update: Record<string, unknown> = {
            [fieldPath]: finalValue,
            updatedAt: new Date(),
        };

        const profile = await Profile.findOneAndUpdate(
            { userId: user._id },
            { $set: update },
            { new: true }
        );

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Field updated successfully',
            updatedField: fieldPath,
        });
    } catch (error: unknown) {
        console.error('Profile patch error:', error);
        return NextResponse.json({ error: 'Failed to update field' }, { status: 500 });
    }
}
