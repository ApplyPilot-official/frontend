import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPortfolioRequest extends Document {
    userId: mongoose.Types.ObjectId;
    userEmail: string;
    status: 'pending' | 'in_progress' | 'completed';
    portfolioLink?: string;
    createdAt: Date;
    updatedAt: Date;
}

const PortfolioRequestSchema = new Schema<IPortfolioRequest>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        userEmail: { type: String, required: true },
        status: {
            type: String,
            enum: ['pending', 'in_progress', 'completed'],
            default: 'pending',
        },
        portfolioLink: { type: String },
    },
    { timestamps: true }
);

const PortfolioRequest: Model<IPortfolioRequest> =
    mongoose.models.PortfolioRequest ||
    mongoose.model<IPortfolioRequest>('PortfolioRequest', PortfolioRequestSchema);

export default PortfolioRequest;
