import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJob extends Document {
    job_id: string;
    title: string;
    company: string;
    location: string;
    role?: string;
    domain?: string;
    job_url?: string;
    apply_link?: string;
    // Salary
    salary_desc?: string;
    min_salary?: number;
    max_salary?: number;
    // Job details
    seniority?: string;
    employment_type?: string;
    work_model?: string;
    is_remote?: boolean;
    summary?: string;
    // Skills & qualifications
    core_skills?: string[];
    skill_summaries?: string[];
    must_have_qualifications?: string[];
    preferred_qualifications?: string[];
    education_summaries?: string[];
    benefits?: string[];
    // Company info
    company_size?: string;
    company_industry?: string;
    company_location?: string;
    company_url?: string;
    // H1B / auth
    is_h1b_sponsor?: boolean;
    is_citizen_only?: boolean;
    is_clearance_required?: boolean;
    // Scores & meta
    display_score?: number;
    rank_desc?: string;
    min_years_experience?: number;
    applicants_count?: number;
    publish_time?: string;
    // Taxonomy
    taxonomy?: string[];
    recommendation_tags?: string[];
    // Source
    source: string;
    fetched_at?: string;
    _migrated_at?: Date;
}

const JobSchema = new Schema<IJob>(
    {
        job_id: { type: String, required: true, unique: true },
        title: { type: String },
        company: { type: String },
        location: { type: String },
        role: { type: String },
        domain: { type: String },
        job_url: { type: String },
        apply_link: { type: String },
        salary_desc: { type: String },
        min_salary: { type: Number },
        max_salary: { type: Number },
        seniority: { type: String },
        employment_type: { type: String },
        work_model: { type: String },
        is_remote: { type: Boolean },
        summary: { type: String },
        core_skills: [{ type: String }],
        skill_summaries: [{ type: String }],
        must_have_qualifications: [{ type: String }],
        preferred_qualifications: [{ type: String }],
        education_summaries: [{ type: String }],
        benefits: [{ type: String }],
        company_size: { type: String },
        company_industry: { type: String },
        company_location: { type: String },
        company_url: { type: String },
        is_h1b_sponsor: { type: Boolean },
        is_citizen_only: { type: Boolean },
        is_clearance_required: { type: Boolean },
        display_score: { type: Number },
        rank_desc: { type: String },
        min_years_experience: { type: Number },
        applicants_count: { type: Number },
        publish_time: { type: String },
        taxonomy: [{ type: String }],
        recommendation_tags: [{ type: String }],
        source: { type: String, required: true },
        fetched_at: { type: String },
        _migrated_at: { type: Date },
    },
    {
        collection: 'jobs',
        strict: false,
    }
);

const Job: Model<IJob> =
    mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);

export default Job;
