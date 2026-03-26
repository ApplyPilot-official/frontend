import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    email: string;
    passwordHash?: string;
    name: string;
    image?: string;
    role: 'user' | 'admin';
    isEmailVerified: boolean;
    emailVerificationToken?: string;
    emailVerificationExpiry?: Date;
    subscriptionPlan: 'none' | 'basic' | 'pro' | 'elite';
    subscriptionId?: string;
    subscriptionStartDate?: Date;
    subscriptionEndDate?: Date;
    provider: 'google' | 'email';
    // Encrypted credentials for auto-apply
    gmailAddress?: string;
    gmailAppPassword?: string;
    linkedInEmail?: string;
    linkedInPassword?: string;
    linkedInPhone?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: { type: String },
        name: { type: String, required: true, trim: true },
        image: { type: String },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        isEmailVerified: { type: Boolean, default: false },
        emailVerificationToken: { type: String },
        emailVerificationExpiry: { type: Date },
        subscriptionPlan: {
            type: String,
            enum: ['none', 'basic', 'pro', 'elite'],
            default: 'none',
        },
        subscriptionId: { type: String },
        subscriptionStartDate: { type: Date },
        subscriptionEndDate: { type: Date },
        provider: {
            type: String,
            enum: ['google', 'email'],
            default: 'email',
        },
        // Encrypted credentials (AES-256)
        gmailAddress: { type: String },
        gmailAppPassword: { type: String },
        linkedInEmail: { type: String },
        linkedInPassword: { type: String },
        linkedInPhone: { type: String },
    },
    { timestamps: true }
);

// Prevent model recompilation in dev (Next.js hot reload)
const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
