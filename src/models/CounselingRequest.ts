import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICounselingRequest extends Document {
    userId: mongoose.Types.ObjectId;
    userEmail: string;
    preferredTime1: string;
    preferredTime2: string;
    preferredTime3: string;
    timezone: string;
    status: 'pending' | 'scheduled' | 'completed';
    createdAt: Date;
    updatedAt: Date;
}

const CounselingRequestSchema = new Schema<ICounselingRequest>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        userEmail: { type: String, required: true },
        preferredTime1: { type: String, required: true },
        preferredTime2: { type: String, required: true },
        preferredTime3: { type: String, required: true },
        timezone: { type: String, required: true },
        status: {
            type: String,
            enum: ['pending', 'scheduled', 'completed'],
            default: 'pending',
        },
    },
    { timestamps: true }
);

// One active request per user
CounselingRequestSchema.index({ userId: 1, status: 1 });

const CounselingRequest: Model<ICounselingRequest> =
    mongoose.models.CounselingRequest ||
    mongoose.model<ICounselingRequest>('CounselingRequest', CounselingRequestSchema);

export default CounselingRequest;
