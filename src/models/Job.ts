import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJob extends Document {
    title: string;
    company: string;
    location: string;
    remote: boolean;
    visaSponsorship: 'H1B' | 'STEM OPT' | 'Green Card' | 'None';
    jobType: 'Full-time' | 'Contract' | 'Part-time';
    applyUrl: string;
    postedAt: Date;
    tags: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
    {
        title: { type: String, required: true },
        company: { type: String, required: true },
        location: { type: String, required: true },
        remote: { type: Boolean, default: false },
        visaSponsorship: {
            type: String,
            enum: ['H1B', 'STEM OPT', 'Green Card', 'None'],
            default: 'None',
        },
        jobType: {
            type: String,
            enum: ['Full-time', 'Contract', 'Part-time'],
            default: 'Full-time',
        },
        applyUrl: { type: String, required: true },
        postedAt: { type: Date, default: Date.now },
        tags: [{ type: String }],
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Job: Model<IJob> =
    mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);

export default Job;
