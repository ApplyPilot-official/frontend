import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMockInterviewRequest extends Document {
    userId: mongoose.Types.ObjectId;
    userEmail: string;
    preferredSlot1: string;
    preferredSlot2: string;
    preferredSlot3: string;
    timezone: string;
    interviewType: string;
    notes?: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    confirmedSlot?: string;
    createdAt: Date;
    updatedAt: Date;
}

const MockInterviewRequestSchema = new Schema<IMockInterviewRequest>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        userEmail: { type: String, required: true },
        preferredSlot1: { type: String, required: true },
        preferredSlot2: { type: String, required: true },
        preferredSlot3: { type: String, required: true },
        timezone: { type: String, required: true },
        interviewType: { type: String, required: true },
        notes: { type: String, trim: true },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'completed', 'cancelled'],
            default: 'pending',
        },
        confirmedSlot: { type: String },
    },
    { timestamps: true }
);

MockInterviewRequestSchema.index({ userId: 1, status: 1 });

const MockInterviewRequest: Model<IMockInterviewRequest> =
    mongoose.models.MockInterviewRequest ||
    mongoose.model<IMockInterviewRequest>('MockInterviewRequest', MockInterviewRequestSchema);

export default MockInterviewRequest;
