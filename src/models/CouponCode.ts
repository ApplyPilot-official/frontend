import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICouponCode extends Document {
    code: string;
    discountAmountCents: number; // Max 500 ($5.00)
    type: 'single-use' | 'referral'; // referral = reusable by different users
    maxUses: number; // For single-use: typically 1. For referral: high number or unlimited
    usedCount: number;
    usedBy: string[]; // Array of user emails — prevents same user using twice
    referralConversions: {
        userEmail: string;
        plan: string;
        convertedAt: Date;
    }[];
    isActive: boolean;
    expiresAt?: Date;
    createdBy: string; // admin email
    generationType: 'email' | 'username' | 'custom';
    createdAt: Date;
    updatedAt: Date;
}

const CouponCodeSchema = new Schema<ICouponCode>(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
            index: true,
        },
        discountAmountCents: {
            type: Number,
            required: true,
            min: 1,
            max: 500, // Hard cap: $5.00 = 500 cents
            validate: {
                validator: function (v: number) {
                    return v >= 1 && v <= 500;
                },
                message: 'Coupon discount cannot exceed $5.00 (500 cents)',
            },
        },
        type: {
            type: String,
            enum: ['single-use', 'referral'],
            default: 'single-use',
        },
        maxUses: { type: Number, required: true, min: 1, default: 1 },
        usedCount: { type: Number, default: 0 },
        usedBy: [{ type: String }],
        referralConversions: [
            {
                userEmail: { type: String, required: true },
                plan: { type: String, required: true },
                convertedAt: { type: Date, default: Date.now },
            },
        ],
        isActive: { type: Boolean, default: true },
        expiresAt: { type: Date },
        createdBy: { type: String, required: true },
        generationType: {
            type: String,
            enum: ['email', 'username', 'custom'],
            default: 'custom',
        },
    },
    { timestamps: true }
);

const CouponCode: Model<ICouponCode> =
    mongoose.models.CouponCode ||
    mongoose.model<ICouponCode>('CouponCode', CouponCodeSchema);

export default CouponCode;
