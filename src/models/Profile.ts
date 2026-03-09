import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProfile extends Document {
    userId: mongoose.Types.ObjectId;
    // Resume storage
    resumeBase64: string;
    resumeMimeType: string;
    resumeFileName: string;
    resumeUploadedAt: Date;
    // Processing state
    processingStatus: 'uploaded' | 'processing' | 'needs_input' | 'complete' | 'approved' | 'failed';
    failedSection?: string;
    // AI-extracted data (raw merge of 5 Gemini calls)
    extractedData?: Record<string, unknown>;
    // Gap fields — mandatory field IDs that AI didn't find
    gapFields?: string[];
    // Final merged profile (extractedData + user gap answers)
    masterProfile?: Record<string, unknown>;
    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        // Resume
        resumeBase64: { type: String },
        resumeMimeType: { type: String },
        resumeFileName: { type: String },
        resumeUploadedAt: { type: Date },
        // Processing
        processingStatus: {
            type: String,
            enum: ['uploaded', 'processing', 'needs_input', 'complete', 'approved', 'failed'],
            default: 'uploaded',
        },
        failedSection: { type: String },
        // Data
        extractedData: { type: Schema.Types.Mixed },
        gapFields: [{ type: String }],
        masterProfile: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);

// Prevent model recompilation in dev (Next.js hot reload)
const Profile: Model<IProfile> =
    mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);

export default Profile;
