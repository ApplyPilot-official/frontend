import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Job from "@/models/Job";

/**
 * GET /api/internal/jobs
 *
 * Returns jobs from the MongoDB `jobs` collection (populated by jobright migration).
 * Uses aggregation pipeline to avoid sort memory limits on Atlas free tier.
 *
 * Query params:
 *   page  – page number (default 1)
 *   limit – results per page (default 5000, max 10000)
 */
export async function GET(req: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(
            10000,
            Math.max(1, parseInt(searchParams.get("limit") || "5000", 10))
        );
        const skip = (page - 1) * limit;

        // Use aggregation pipeline — no sort, avoids Atlas free-tier memory limits
        const pipeline = [
            {
                $project: {
                    _id: 0,
                    job_id: 1,
                    title: 1,
                    company: 1,
                    location: 1,
                    job_url: 1,
                    apply_link: 1,
                    seniority: 1,
                    employment_type: 1,
                    work_model: 1,
                    is_remote: 1,
                    is_h1b_sponsor: 1,
                    publish_time: 1,
                    min_salary: 1,
                    max_salary: 1,
                    salary_desc: 1,
                    source: 1,
                },
            },
            { $skip: skip },
            { $limit: limit },
        ];

        const [jobs, countResult] = await Promise.all([
            Job.aggregate(pipeline),
            Job.countDocuments({}),
        ]);

        // Normalize to match the frontend Job interface
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const normalized = jobs.map((job: any) => ({
            title: job.title || "",
            company: job.company || "",
            location: job.location || "Not specified",
            ats: "global",
            url: job.apply_link || job.job_url || "",
            absolute_url: job.apply_link || job.job_url || "",
            workplaceType: job.work_model || (job.is_remote ? "Remote" : undefined),
            skill_level: job.seniority || undefined,
            is_h1b_sponsor: job.is_h1b_sponsor ?? false,
            publish_time: job.publish_time || undefined,
            employment_type: job.employment_type || undefined,
            work_model: job.work_model || undefined,
            min_salary: job.min_salary ?? undefined,
            max_salary: job.max_salary ?? undefined,
            salary_desc: job.salary_desc || undefined,
            source: "internal" as const,
        }));

        return NextResponse.json({
            jobs: normalized,
            totalJobs: countResult,
            page,
            limit,
            totalPages: Math.ceil(countResult / limit),
        });
    } catch (error) {
        console.error("Internal jobs API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch internal jobs" },
            { status: 500 }
        );
    }
}
