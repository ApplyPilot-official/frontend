import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayment extends Document {
    userId: mongoose.Types.ObjectId;
    userEmail: string;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    plan: 'basic' | 'pro' | 'elite';
    amountCents: number;
    currency: string;
    couponCode?: string;
    couponDiscountCents?: number;
    status: 'created' | 'paid' | 'failed';
    createdAt: Date;
    updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        userEmail: { type: String, required: true },
        razorpayOrderId: { type: String, required: true, unique: true },
        razorpayPaymentId: { type: String },
        razorpaySignature: { type: String },
        plan: {
            type: String,
            enum: ['basic', 'pro', 'elite'],
            required: true,
        },
        amountCents: { type: Number, required: true },
        currency: { type: String, default: 'USD' },
        couponCode: { type: String },
        couponDiscountCents: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ['created', 'paid', 'failed'],
            default: 'created',
        },
    },
    { timestamps: true }
);

const Payment: Model<IPayment> =
    mongoose.models.Payment ||
    mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
