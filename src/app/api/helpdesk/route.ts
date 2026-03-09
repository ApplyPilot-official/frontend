import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import HelpDeskMessage from '@/models/HelpDeskMessage';
import { getAuthUser } from '@/lib/auth';

// GET: Fetch conversation messages for current user
export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const messages = await HelpDeskMessage.find({ userId: user._id })
            .sort({ createdAt: 1 })
            .lean();

        // Mark admin messages as read for this user
        await HelpDeskMessage.updateMany(
            { userId: user._id, senderType: 'admin', isRead: false },
            { isRead: true }
        );

        return NextResponse.json({ messages });
    } catch (error: unknown) {
        console.error('HelpDesk GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Send a message
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { messageText, attachmentUrl } = await req.json();
        if (!messageText?.trim()) {
            return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
        }

        const message = await HelpDeskMessage.create({
            userId: user._id,
            userEmail: user.email,
            senderType: 'user',
            messageText: messageText.trim(),
            attachmentUrl: attachmentUrl || undefined,
            isRead: false,
        });

        return NextResponse.json({ message });
    } catch (error: unknown) {
        console.error('HelpDesk POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
