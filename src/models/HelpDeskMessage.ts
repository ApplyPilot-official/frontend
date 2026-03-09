import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHelpDeskMessage extends Document {
    userId: mongoose.Types.ObjectId;
    userEmail: string;
    senderType: 'user' | 'admin';
    messageText: string;
    attachmentUrl?: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const HelpDeskMessageSchema = new Schema<IHelpDeskMessage>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        userEmail: { type: String, required: true },
        senderType: {
            type: String,
            enum: ['user', 'admin'],
            required: true,
        },
        messageText: { type: String, required: true },
        attachmentUrl: { type: String },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Fast lookup for user conversations + unread count
HelpDeskMessageSchema.index({ userId: 1, createdAt: 1 });
HelpDeskMessageSchema.index({ userId: 1, isRead: 1, senderType: 1 });

const HelpDeskMessage: Model<IHelpDeskMessage> =
    mongoose.models.HelpDeskMessage ||
    mongoose.model<IHelpDeskMessage>('HelpDeskMessage', HelpDeskMessageSchema);

export default HelpDeskMessage;
