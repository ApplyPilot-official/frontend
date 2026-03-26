import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFeatureAccess extends Document {
    /** Singleton key — always "default" */
    configKey: string;
    /**
     * Map of featureId → { none: bool, basic: bool, pro: bool, elite: bool }
     * true = feature visible for that plan, false = locked
     */
    features: Record<string, Record<string, boolean>>;
    updatedAt: Date;
}

const FeatureAccessSchema = new Schema<IFeatureAccess>(
    {
        configKey: { type: String, required: true, unique: true, default: 'default' },
        features: { type: Schema.Types.Mixed, required: true, default: {} },
    },
    { timestamps: true }
);

const FeatureAccess: Model<IFeatureAccess> =
    mongoose.models.FeatureAccess || mongoose.model<IFeatureAccess>('FeatureAccess', FeatureAccessSchema);

export default FeatureAccess;
