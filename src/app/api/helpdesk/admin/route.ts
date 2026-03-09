import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import HelpDeskMessage from '@/models/HelpDeskMessage';
import { requireAdmin } from '@/lib/auth';
import mongoose from 'mongoose';

// GET: List all conversations grouped by user (admin only)
export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        await requireAdmin(req);

        // Get all unique users who have messages
        const conversations = await HelpDeskMessage.aggregate([
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: '$userId',
                    userEmail: { $first: '$userEmail' },
                    lastMessage: { $first: '$messageText' },
                    lastMessageAt: { $first: '$createdAt' },
                    lastSenderType: { $first: '$senderType' },
                    totalMessages: { $sum: 1 },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ['$senderType', 'user'] }, { $eq: ['$isRead', false] }] },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
            { $sort: { lastMessageAt: -1 } },
        ]);

        return NextResponse.json({ conversations });
    } catch (error: unknown) {
        if ((error as Error).message?.includes('Admin') || (error as Error).message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('HelpDesk admin GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Admin sends reply to a user
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        await requireAdmin(req);

        const { userId, messageText } = await req.json();
        if (!userId || !messageText?.trim()) {
            return NextResponse.json({ error: 'userId and messageText required' }, { status: 400 });
        }

        // Get the user's email from their most recent message
        const lastMsg = await HelpDeskMessage.findOne({ userId: new mongoose.Types.ObjectId(userId) })
            .sort({ createdAt: -1 });

        if (!lastMsg) {
            return NextResponse.json({ error: 'No conversation found for this user' }, { status: 404 });
        }

        const message = await HelpDeskMessage.create({
            userId: new mongoose.Types.ObjectId(userId),
            userEmail: lastMsg.userEmail,
            senderType: 'admin',
            messageText: messageText.trim(),
            isRead: false,
        });

        // Mark all user messages in this conversation as read
        await HelpDeskMessage.updateMany(
            { userId: new mongoose.Types.ObjectId(userId), senderType: 'user', isRead: false },
            { isRead: true }
        );

        return NextResponse.json({ message });
    } catch (error: unknown) {
        if ((error as Error).message?.includes('Admin') || (error as Error).message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('HelpDesk admin POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH: Admin fetches messages for a specific user
export async function PATCH(req: NextRequest) {
    try {
        await dbConnect();
        await requireAdmin(req);

        const { userId } = await req.json();
        if (!userId) {
            return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }

        const messages = await HelpDeskMessage.find({ userId: new mongoose.Types.ObjectId(userId) })
            .sort({ createdAt: 1 })
            .lean();

        // Mark user messages as read
        await HelpDeskMessage.updateMany(
            { userId: new mongoose.Types.ObjectId(userId), senderType: 'user', isRead: false },
            { isRead: true }
        );

        return NextResponse.json({ messages });
    } catch (error: unknown) {
        if ((error as Error).message?.includes('Admin') || (error as Error).message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('HelpDesk admin PATCH error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
