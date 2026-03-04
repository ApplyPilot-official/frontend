import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(req: NextRequest) {
    try {
        const token = req.nextUrl.searchParams.get('token');

        if (!token) {
            return NextResponse.redirect(
                new URL('/login?error=invalid-token', req.url)
            );
        }

        await dbConnect();

        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpiry: { $gt: new Date() },
        });

        if (!user) {
            return NextResponse.redirect(
                new URL('/login?error=expired-token', req.url)
            );
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpiry = undefined;
        await user.save();

        return NextResponse.redirect(
            new URL('/login?verified=true', req.url)
        );
    } catch (error: unknown) {
        console.error('Email verification error:', error);
        return NextResponse.redirect(
            new URL('/login?error=verification-failed', req.url)
        );
    }
}
