import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILinkedInMakeover extends Document {
    userId: mongoose.Types.ObjectId;
    userEmail: string;
    linkedinUrl: string;
    notes?: string;
    status: 'pending' | 'in_progress' | 'completed';
    deliverableUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

const LinkedInMakeoverSchema = new Schema<ILinkedInMakeover>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        userEmail: { type: String, required: true },
        linkedinUrl: { type: String, required: true },
        notes: { type: String },
        status: {
            type: String,
            enum: ['pending', 'in_progress', 'completed'],
            default: 'pending',
        },
        deliverableUrl: { type: String },
    },
    { timestamps: true }
);

const LinkedInMakeover: Model<ILinkedInMakeover> =
    mongoose.models.LinkedInMakeover ||
    mongoose.model<ILinkedInMakeover>('LinkedInMakeover', LinkedInMakeoverSchema);

export default LinkedInMakeover;
