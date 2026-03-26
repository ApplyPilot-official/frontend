import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBusinessInterest extends Document {
    contactName: string;
    companyName: string;
    email: string;
    phone?: string;
    companySize: string;
    message?: string;
    status: 'new' | 'contacted' | 'in_discussion' | 'closed_won' | 'closed_lost';
    adminNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const BusinessInterestSchema = new Schema<IBusinessInterest>(
    {
        contactName: { type: String, required: true, trim: true },
        companyName: { type: String, required: true, trim: true },
        email: { type: String, required: true, lowercase: true, trim: true },
        phone: { type: String, trim: true },
        companySize: { type: String, required: true },
        message: { type: String, trim: true },
        status: {
            type: String,
            enum: ['new', 'contacted', 'in_discussion', 'closed_won', 'closed_lost'],
            default: 'new',
        },
        adminNotes: { type: String, trim: true },
    },
    { timestamps: true }
);

BusinessInterestSchema.index({ status: 1 });
BusinessInterestSchema.index({ createdAt: -1 });

const BusinessInterest: Model<IBusinessInterest> =
    mongoose.models.BusinessInterest ||
    mongoose.model<IBusinessInterest>('BusinessInterest', BusinessInterestSchema);

export default BusinessInterest;
