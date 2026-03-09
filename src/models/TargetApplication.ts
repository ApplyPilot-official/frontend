import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITargetApplication extends Document {
    userId: mongoose.Types.ObjectId;
    userEmail: string;
    type: 'company' | 'role';
    name: string;
    status: 'pending' | 'approved' | 'applied' | 'not_available';
    createdAt: Date;
    updatedAt: Date;
}

const TargetApplicationSchema = new Schema<ITargetApplication>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        userEmail: { type: String, required: true },
        type: { type: String, enum: ['company', 'role'], required: true },
        name: { type: String, required: true },
        status: {
            type: String,
            enum: ['pending', 'approved', 'applied', 'not_available'],
            default: 'pending',
        },
    },
    { timestamps: true }
);

// Compound index for efficient queries
TargetApplicationSchema.index({ userId: 1, type: 1 });

const TargetApplication: Model<ITargetApplication> =
    mongoose.models.TargetApplication ||
    mongoose.model<ITargetApplication>('TargetApplication', TargetApplicationSchema);

export default TargetApplication;
