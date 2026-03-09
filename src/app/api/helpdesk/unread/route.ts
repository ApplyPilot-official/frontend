import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import HelpDeskMessage from '@/models/HelpDeskMessage';
import { getAuthUser } from '@/lib/auth';

// GET: Unread message count for the current user (admin messages they haven't read)
export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const unreadCount = await HelpDeskMessage.countDocuments({
            userId: user._id,
            senderType: 'admin',
            isRead: false,
        });

        return NextResponse.json({ unreadCount });
    } catch (error: unknown) {
        console.error('HelpDesk unread error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
