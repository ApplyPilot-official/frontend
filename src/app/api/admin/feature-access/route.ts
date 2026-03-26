import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FeatureAccess from '@/models/FeatureAccess';
import { requireAdmin } from '@/lib/auth';
import { getDefaultFeatureAccess, DASHBOARD_FEATURES } from '@/lib/dashboardFeatures';

// GET: Return current feature access config (public — dashboard needs it)
export async function GET() {
    try {
        await dbConnect();

        const config = await FeatureAccess.findOne({ configKey: 'default' }).lean();

        if (!config) {
            // Return defaults if no admin config exists yet
            return NextResponse.json({ features: getDefaultFeatureAccess() });
        }

        // Merge with defaults so new features automatically appear
        const defaults = getDefaultFeatureAccess();
        const merged = { ...defaults };
        for (const featureId of Object.keys(config.features || {})) {
            if (merged[featureId]) {
                merged[featureId] = { ...merged[featureId], ...config.features[featureId] };
            }
        }

        return NextResponse.json({ features: merged });
    } catch {
        return NextResponse.json({ features: getDefaultFeatureAccess() });
    }
}

// PUT: Update feature access config (admin only)
export async function PUT(req: NextRequest) {
    try {
        await dbConnect();
        await requireAdmin(req);

        const { features } = await req.json();

        if (!features || typeof features !== 'object') {
            return NextResponse.json({ error: 'features map is required' }, { status: 400 });
        }

        // Validate: only allow known feature IDs
        const validIds = new Set(DASHBOARD_FEATURES.map(f => f.id));
        for (const key of Object.keys(features)) {
            if (!validIds.has(key)) {
                return NextResponse.json({ error: `Unknown feature: ${key}` }, { status: 400 });
            }
        }

        await FeatureAccess.findOneAndUpdate(
            { configKey: 'default' },
            { $set: { features } },
            { upsert: true, new: true }
        );

        return NextResponse.json({ message: 'Feature access updated', features });
    } catch (error: unknown) {
        if ((error as Error).message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if ((error as Error).message?.includes('Admin')) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
