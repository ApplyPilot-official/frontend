import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { signJWT } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        await dbConnect();

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        if (user.provider === 'google') {
            return NextResponse.json(
                { error: 'This account uses Google sign-in. Please use the Google button.' },
                { status: 400 }
            );
        }

        if (!user.passwordHash) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        if (!user.isEmailVerified) {
            return NextResponse.json(
                { error: 'Please verify your email before logging in. Check your inbox.' },
                { status: 403 }
            );
        }

        const token = signJWT({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        return NextResponse.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                image: user.image,
                isEmailVerified: user.isEmailVerified,
                subscriptionPlan: user.subscriptionPlan,
                role: user.role,
            },
        });
    } catch (error: unknown) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
