import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        }),
        CredentialsProvider({
            name: 'Email',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                await dbConnect();
                const user = await User.findOne({ email: credentials.email.toLowerCase() });
                if (!user || !user.passwordHash) return null;
                if (user.provider === 'google') return null;
                if (!user.isEmailVerified) return null;

                const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
                if (!isValid) return null;

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    image: user.image || null,
                };
            },
        }),
    ],
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'google' && user.email) {
                try {
                    await dbConnect();
                    const userEmail = user.email as string;
                    const existingUser = await User.findOne({ email: userEmail });
                    if (!existingUser) {
                        await User.create({
                            email: userEmail.toLowerCase(),
                            name: user.name || 'User',
                            image: user.image || undefined,
                            provider: 'google',
                            isEmailVerified: true,
                            subscriptionPlan: 'none',
                            role: 'user',
                        });
                    } else if (user.image && existingUser.image !== user.image) {
                        existingUser.image = user.image;
                        await existingUser.save();
                    }
                } catch (error) {
                    console.error('Error saving Google user:', error);
                }
            }
            return true;
        },
        async jwt({ token }) {
            if (token.email) {
                try {
                    await dbConnect();
                    const dbUser = await User.findOne({ email: token.email });
                    if (dbUser) {
                        token.userId = dbUser._id.toString();
                        token.role = dbUser.role;
                        token.subscriptionPlan = dbUser.subscriptionPlan;
                    }
                } catch (error) {
                    console.error('JWT callback error:', error);
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as Record<string, unknown>).id = token.userId;
                (session.user as Record<string, unknown>).role = token.role;
                (session.user as Record<string, unknown>).subscriptionPlan = token.subscriptionPlan;
            }
            return session;
        },
    },
};
