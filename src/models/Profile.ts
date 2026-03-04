import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProfile extends Document {
    userId: mongoose.Types.ObjectId;
    // Personal Info
    fullName: string;
    mobileNumber?: string;
    city?: string;
    state?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    // Professional Info
    yearsOfExperience?: number;
    currentJobTitle?: string;
    targetJobTitle?: string;
    skills: string[];
    workExperience: {
        company: string;
        role: string;
        startDate: string;
        endDate?: string;
        description: string;
    }[];
    projects: {
        title: string;
        techStack: string[];
        description: string;
        url?: string;
    }[];
    education: {
        institution: string;
        degree: string;
        graduationYear: string;
    }[];
    // Visa & Immigration
    visaType?: string;
    visaExpiryDate?: Date;
    workAuthorizationStatus?: string;
    // Automation Credentials (encrypted)
    linkedinEmail?: string;
    linkedinPassword?: string;
    gmailEmail?: string;
    gmailPassword?: string;
    // Resume
    resumeUrl?: string;
    parsedResumeData?: Record<string, unknown>;
    // Flags
    isProfileComplete: boolean;
    isAdminApproved: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        fullName: { type: String, required: true },
        mobileNumber: { type: String },
        city: { type: String },
        state: { type: String },
        linkedinUrl: { type: String },
        githubUrl: { type: String },
        yearsOfExperience: { type: Number },
        currentJobTitle: { type: String },
        targetJobTitle: { type: String },
        skills: [{ type: String }],
        workExperience: [
            {
                company: String,
                role: String,
                startDate: String,
                endDate: String,
                description: String,
            },
        ],
        projects: [
            {
                title: String,
                techStack: [String],
                description: String,
                url: String,
            },
        ],
        education: [
            {
                institution: String,
                degree: String,
                graduationYear: String,
            },
        ],
        visaType: { type: String },
        visaExpiryDate: { type: Date },
        workAuthorizationStatus: { type: String },
        linkedinEmail: { type: String },
        linkedinPassword: { type: String },
        gmailEmail: { type: String },
        gmailPassword: { type: String },
        resumeUrl: { type: String },
        parsedResumeData: { type: Schema.Types.Mixed },
        isProfileComplete: { type: Boolean, default: false },
        isAdminApproved: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Profile: Model<IProfile> =
    mongoose.models.Profile ||
    mongoose.model<IProfile>('Profile', ProfileSchema);

export default Profile;
