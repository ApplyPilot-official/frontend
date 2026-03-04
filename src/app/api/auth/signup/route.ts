import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { signJWT } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        const { email, password, name } = await req.json();

        if (!email || !password || !name) {
            return NextResponse.json(
                { error: 'Email, password, and name are required' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json(
                { error: 'An account with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Generate verification token
        const verificationToken = uuidv4();
        const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create user
        const user = await User.create({
            email: email.toLowerCase(),
            passwordHash,
            name,
            provider: 'email',
            isEmailVerified: false,
            emailVerificationToken: verificationToken,
            emailVerificationExpiry: verificationExpiry,
            subscriptionPlan: 'none',
            role: 'user',
        });

        // Send verification email
        try {
            await sendVerificationEmail(email, verificationToken, name);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Don't fail signup if email fails — user can request resend
        }

        // Generate JWT
        const token = signJWT({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        return NextResponse.json({
            message: 'Account created! Please check your email to verify your account.',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                isEmailVerified: user.isEmailVerified,
                subscriptionPlan: user.subscriptionPlan,
                role: user.role,
            },
        });
    } catch (error: unknown) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
