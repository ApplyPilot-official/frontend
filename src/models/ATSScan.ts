// MongoDB model for ATS Screener scan history
import mongoose, { Schema, Document } from "mongoose";

export interface IATSScan extends Document {
    userEmail: string;
    fileName: string;
    scanDate: Date;
    averageScore: number;
    mode: "general" | "targeted";
    jobDescription?: string;
    results: {
        system: string;
        vendor: string;
        overallScore: number;
        passesFilter: boolean;
    }[];
}

const ATSScanSchema = new Schema<IATSScan>({
    userEmail: { type: String, required: true, index: true },
    fileName: { type: String, required: true },
    scanDate: { type: Date, default: Date.now },
    averageScore: { type: Number, required: true },
    mode: { type: String, enum: ["general", "targeted"], default: "general" },
    jobDescription: { type: String },
    results: [{
        system: String,
        vendor: String,
        overallScore: Number,
        passesFilter: Boolean,
    }],
});

export default mongoose.models.ATSScan || mongoose.model<IATSScan>("ATSScan", ATSScanSchema);
