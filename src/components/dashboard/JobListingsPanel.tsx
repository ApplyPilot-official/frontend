"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────
interface Job {
    title: string;
    company: string;
    company_slug?: string;
    location: string | { name: string } | null;
    ats: string;
    url: string;
    absolute_url?: string;
    workplaceType?: string;
    skill_level?: string;
    is_recruiter?: boolean;
}

interface FilterState {
    title: string;
    company: string;
    location: string;
    ats: string;
    skillLevel: string;
    exclude: string;
    remoteOnly: boolean;
    hideRecruiters: boolean;
}

interface Manifest {
    chunks: string[];
    totalJobs: number;
    last_updated: string;
}

const DATA_BASE_URL = "https://feashliaa.github.io/job-board-aggregator/data";
const PER_PAGE = 50;

const ATS_OPTIONS = [
    { value: "", label: "All Platforms" },
    { value: "greenhouse", label: "Greenhouse" },
    { value: "lever", label: "Lever" },
    { value: "workday", label: "Workday" },
    { value: "ashby", label: "Ashby" },
    { value: "bamboohr", label: "BambooHR" },
    { value: "workable", label: "Workable" },
    { value: "icms", label: "iCIMS" },
];

const SKILL_LEVELS = [
    { value: "", label: "All Levels" },
    { value: "internship", label: "Internship" },
    { value: "entry", label: "Entry Level" },
    { value: "mid", label: "Mid Level" },
    { value: "senior", label: "Senior" },
    { value: "lead", label: "Lead" },
    { value: "manager", label: "Manager" },
];

const ATS_COLORS: Record<string, string> = {
    greenhouse: "bg-green-50 text-green-700 border-green-200",
    lever: "bg-blue-50 text-blue-700 border-blue-200",
    workday: "bg-amber-50 text-amber-700 border-amber-200",
    ashby: "bg-cyan-50 text-cyan-700 border-cyan-200",
    icms: "bg-slate-50 text-slate-700 border-slate-200",
    bamboohr: "bg-red-50 text-red-700 border-red-200",
    workable: "bg-violet-50 text-violet-700 border-violet-200",
};

// ── Helpers ────────────────────────────────────────────────────
function getLocationString(loc: Job["location"]): string {
    if (!loc) return "Not specified";
    if (typeof loc === "object") return loc.name || "Not specified";
    return loc || "Not specified";
}

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function fetchAndDecompress(url: string): Promise<Job[]> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load ${url}`);
    const blob = await response.blob();
    const ds = new DecompressionStream("gzip");
    const text = await new Response(blob.stream().pipeThrough(ds))
        .blob()
        .then((b) => b.text());
    return JSON.parse(text);
}

// ── Component ──────────────────────────────────────────────────
export default function JobListingsPanel() {
    const searchParams = useSearchParams();
    const [allJobs, setAllJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [totalChunks, setTotalChunks] = useState(0);
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState("");

    // Saved jobs (localStorage)
    const [savedJobUrls, setSavedJobUrls] = useState<Set<string>>(new Set());
    const [showSavedOnly, setShowSavedOnly] = useState(false);

    // Load saved jobs from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem("applypilot_saved_jobs");
            if (stored) setSavedJobUrls(new Set(JSON.parse(stored)));
        } catch { /* ignore */ }
        // Check if we should show saved view from URL
        if (searchParams.get("view") === "saved") setShowSavedOnly(true);
    }, [searchParams]);

    const toggleSaveJob = useCallback((url: string) => {
        setSavedJobUrls(prev => {
            const next = new Set(prev);
            if (next.has(url)) next.delete(url);
            else next.add(url);
            localStorage.setItem("applypilot_saved_jobs", JSON.stringify([...next]));
            return next;
        });
    }, []);

    const [filters, setFilters] = useState<FilterState>({
        title: "",
        company: "",
        location: "",
        ats: "",
        skillLevel: "",
        exclude: "",
        remoteOnly: false,
        hideRecruiters: true,
    });

    const [currentPage, setCurrentPage] = useState(1);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Load jobs progressively ──────────────────────────────
    useEffect(() => {
        let cancelled = false;

        async function loadJobs() {
            try {
                const manifestRes = await fetch(`${DATA_BASE_URL}/jobs_manifest.json`);
                if (!manifestRes.ok) throw new Error("Failed to load jobs manifest");
                const manifest: Manifest = await manifestRes.json();

                setTotalChunks(manifest.chunks.length);
                setLastUpdated(manifest.last_updated);

                // Load first chunk immediately
                const firstChunk = await fetchAndDecompress(
                    `${DATA_BASE_URL}/${manifest.chunks[0]}`
                );
                if (cancelled) return;
                setAllJobs(firstChunk);
                setLoadingProgress(1);
                setIsLoading(false);

                // Load remaining chunks in parallel batches
                const remaining = manifest.chunks.slice(1);
                const batchSize = 4;
                for (let i = 0; i < remaining.length; i += batchSize) {
                    const batch = remaining.slice(i, i + batchSize);
                    const results = await Promise.all(
                        batch.map((chunk) =>
                            fetchAndDecompress(`${DATA_BASE_URL}/${chunk}`)
                        )
                    );
                    if (cancelled) return;
                    setAllJobs((prev) => {
                        const combined = [...prev];
                        results.forEach((r) => combined.push(...r));
                        return combined;
                    });
                    setLoadingProgress((prev) => prev + batch.length);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error ? err.message : "Failed to load jobs"
                    );
                    setIsLoading(false);
                }
            }
        }

        loadJobs();
        return () => {
            cancelled = true;
        };
    }, []);

    // ── Filtering ────────────────────────────────────────────
    const filteredJobs = useMemo(() => {
        const f = filters;
        const titleRegex = f.title
            ? new RegExp(`\\b${escapeRegex(f.title)}\\b`, "i")
            : null;
        const companyRegex = f.company
            ? new RegExp(`\\b${escapeRegex(f.company)}\\b`, "i")
            : null;
        const locationRegex = f.location
            ? new RegExp(`\\b${escapeRegex(f.location)}\\b`, "i")
            : null;

        return allJobs.filter((job) => {
            // Hide recruiters
            if (f.hideRecruiters && job.is_recruiter === true) return false;

            const title = (job.title || "").toLowerCase();
            const company = (
                job.company ||
                job.company_slug ||
                ""
            ).toLowerCase();
            const location = getLocationString(job.location).toLowerCase();

            // Remote only
            if (f.remoteOnly) {
                const isRemote =
                    location.includes("remote") ||
                    (job.workplaceType &&
                        job.workplaceType.toLowerCase() === "remote");
                if (!isRemote) return false;
            }

            // ATS
            if (f.ats) {
                const jobAts = (job.ats || "").toLowerCase();
                if (jobAts !== f.ats.toLowerCase()) return false;
            }

            // Skill level
            if (f.skillLevel) {
                const jobSkill = (job.skill_level || "").toLowerCase();
                if (jobSkill !== f.skillLevel.toLowerCase()) return false;
            }

            // Exclude keywords
            if (f.exclude) {
                const terms = f.exclude
                    .split(",")
                    .map((t) => t.trim().toLowerCase())
                    .filter(Boolean);
                if (terms.some((term) => title.includes(term))) return false;
            }

            return (
                (!titleRegex || titleRegex.test(title)) &&
                (!companyRegex || companyRegex.test(company)) &&
                (!locationRegex || locationRegex.test(location))
            );
        });
    }, [allJobs, filters]);

    // Apply saved-only filter on top of filtered jobs
    const displayJobs = useMemo(() => {
        if (!showSavedOnly) return filteredJobs;
        return filteredJobs.filter(job => {
            const url = job.absolute_url || job.url;
            return url && savedJobUrls.has(url);
        });
    }, [filteredJobs, showSavedOnly, savedJobUrls]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    // ── Pagination ───────────────────────────────────────────
    const totalPages = Math.ceil(displayJobs.length / PER_PAGE);
    const pageJobs = displayJobs.slice(
        (currentPage - 1) * PER_PAGE,
        currentPage * PER_PAGE
    );

    // ── Stats ────────────────────────────────────────────────
    const companyCount = useMemo(() => {
        return new Set(allJobs.map((j) => j.company_slug || j.company)).size;
    }, [allJobs]);

    // ── Debounced filter update ──────────────────────────────
    const updateFilter = useCallback(
        (key: keyof FilterState, value: string | boolean) => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                setFilters((prev) => ({ ...prev, [key]: value }));
            }, 300);
        },
        []
    );

    const updateFilterImmediate = useCallback(
        (key: keyof FilterState, value: string | boolean) => {
            setFilters((prev) => ({ ...prev, [key]: value }));
        },
        []
    );

    const clearFilters = useCallback(() => {
        setFilters({
            title: "",
            company: "",
            location: "",
            ats: "",
            skillLevel: "",
            exclude: "",
            remoteOnly: false,
            hideRecruiters: true,
        });
        // Reset all input elements
        const inputs = document.querySelectorAll<HTMLInputElement>(".jlp-filter-input");
        inputs.forEach((el) => {
            if (el.type === "checkbox") el.checked = el.name === "hideRecruiters";
            else el.value = "";
        });
        const selects = document.querySelectorAll<HTMLSelectElement>(".jlp-filter-select");
        selects.forEach((el) => (el.value = ""));
    }, []);

    // ── Loading State ────────────────────────────────────────
    if (isLoading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-10 text-center border border-surface-300 shadow-sm"
            >
                <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 border-r-primary-300 border-b-transparent border-l-transparent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-2xl">
                        💼
                    </div>
                </div>
                <h2 className="text-xl font-bold text-surface-950 mb-2">
                    Loading Job Listings
                </h2>
                <p className="text-surface-600 mb-4">
                    Fetching jobs from multiple platforms...
                </p>
                {totalChunks > 0 && (
                    <div className="max-w-xs mx-auto">
                        <div className="w-full bg-surface-200 rounded-full h-2">
                            <div
                                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                    width: `${(loadingProgress / totalChunks) * 100}%`,
                                }}
                            />
                        </div>
                        <p className="text-xs text-surface-500 mt-2">
                            {loadingProgress} / {totalChunks} data chunks loaded
                        </p>
                    </div>
                )}
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-10 text-center border border-red-200 shadow-sm"
            >
                <div className="text-4xl mb-3">⚠️</div>
                <h2 className="text-xl font-bold text-surface-950 mb-2">
                    Failed to Load Jobs
                </h2>
                <p className="text-surface-600">{error}</p>
            </motion.div>
        );
    }

    // ── Main Render ──────────────────────────────────────────
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            {/* Stats Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl px-5 py-3 border border-surface-300 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                        <span className="text-sm font-semibold text-surface-950">
                            {allJobs.length.toLocaleString()}{" "}
                            <span className="text-surface-500 font-normal">jobs</span>
                        </span>
                    </div>
                    <span className="text-surface-300">|</span>
                    <span className="text-sm text-surface-600">
                        <span className="font-semibold text-surface-950">
                            {companyCount.toLocaleString()}
                        </span>{" "}
                        companies
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {/* Saved Jobs Toggle */}
                    <button
                        onClick={() => setShowSavedOnly(prev => !prev)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${showSavedOnly
                                ? "bg-amber-50 text-amber-600 border border-amber-200"
                                : "bg-surface-100 text-surface-600 border border-surface-300 hover:bg-surface-200"
                            }`}
                    >
                        <svg className="w-3.5 h-3.5" fill={showSavedOnly ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        Saved ({savedJobUrls.size})
                    </button>
                    {totalChunks > 0 && loadingProgress < totalChunks && (
                        <span className="text-xs text-primary-500 bg-primary-50 px-2 py-1 rounded-full">
                            Loading more... ({loadingProgress}/{totalChunks})
                        </span>
                    )}
                    {lastUpdated && (
                        <span className="text-xs text-surface-500">
                            Updated{" "}
                            {new Date(lastUpdated).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl border border-surface-300 shadow-sm p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
                    <input
                        type="text"
                        placeholder="Job title..."
                        className="jlp-filter-input px-3 py-2 bg-surface-100 border border-surface-300 rounded-xl text-sm text-surface-950 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-300"
                        onChange={(e) => updateFilter("title", e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Company..."
                        className="jlp-filter-input px-3 py-2 bg-surface-100 border border-surface-300 rounded-xl text-sm text-surface-950 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-300"
                        onChange={(e) => updateFilter("company", e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Location..."
                        className="jlp-filter-input px-3 py-2 bg-surface-100 border border-surface-300 rounded-xl text-sm text-surface-950 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-300"
                        onChange={(e) => updateFilter("location", e.target.value)}
                    />
                    <select
                        className="jlp-filter-select px-3 py-2 bg-surface-100 border border-surface-300 rounded-xl text-sm text-surface-950 focus:outline-none focus:ring-2 focus:ring-primary-300"
                        onChange={(e) =>
                            updateFilterImmediate("ats", e.target.value)
                        }
                    >
                        {ATS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <select
                        className="jlp-filter-select px-3 py-2 bg-surface-100 border border-surface-300 rounded-xl text-sm text-surface-950 focus:outline-none focus:ring-2 focus:ring-primary-300"
                        onChange={(e) =>
                            updateFilterImmediate("skillLevel", e.target.value)
                        }
                    >
                        {SKILL_LEVELS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="Exclude keywords..."
                        className="jlp-filter-input px-3 py-2 bg-surface-100 border border-surface-300 rounded-xl text-sm text-surface-950 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-300"
                        onChange={(e) => updateFilter("exclude", e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-surface-700 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            name="remoteOnly"
                            className="jlp-filter-input w-4 h-4 rounded border-surface-400 text-primary-500 focus:ring-primary-300"
                            onChange={(e) =>
                                updateFilterImmediate("remoteOnly", e.target.checked)
                            }
                        />
                        🏠 Remote Only
                    </label>
                    <label className="flex items-center gap-2 text-sm text-surface-700 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            name="hideRecruiters"
                            className="jlp-filter-input w-4 h-4 rounded border-surface-400 text-primary-500 focus:ring-primary-300"
                            defaultChecked
                            onChange={(e) =>
                                updateFilterImmediate(
                                    "hideRecruiters",
                                    e.target.checked
                                )
                            }
                        />
                        🚫 Hide Recruiters
                    </label>
                    <button
                        onClick={clearFilters}
                        className="ml-auto text-xs text-primary-500 hover:text-primary-600 transition-colors"
                    >
                        Clear All Filters
                    </button>
                    <span className="text-xs text-surface-500">
                        {displayJobs.length.toLocaleString()} results
                    </span>
                </div>
            </div>

            {/* Job Table */}
            <div className="bg-white rounded-2xl border border-surface-300 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-surface-100 border-b border-surface-300">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-600 uppercase tracking-wider">
                                    Company
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-600 uppercase tracking-wider">
                                    Title
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-600 uppercase tracking-wider hidden sm:table-cell">
                                    Location
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-600 uppercase tracking-wider hidden md:table-cell">
                                    Platform
                                </th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-surface-600 uppercase tracking-wider w-24">
                                    Apply
                                </th>
                                <th className="text-center px-2 py-3 text-xs font-semibold text-surface-600 uppercase tracking-wider w-12">
                                    <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-200">
                            {pageJobs.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-12 text-center text-surface-500"
                                    >
                                        <div className="text-3xl mb-2">{showSavedOnly ? "🔖" : "🔍"}</div>
                                        {showSavedOnly ? "No saved jobs yet. Click the bookmark icon to save jobs." : "No jobs found matching your filters."}
                                    </td>
                                </tr>
                            ) : (
                                pageJobs.map((job, i) => {
                                    const atsLower = (
                                        job.ats || "unknown"
                                    ).toLowerCase();
                                    const atsClass =
                                        ATS_COLORS[atsLower] ||
                                        "bg-surface-100 text-surface-700 border-surface-300";
                                    const applyUrl =
                                        job.absolute_url || job.url;

                                    return (
                                        <tr
                                            key={`${applyUrl}-${i}`}
                                            className="hover:bg-surface-50 transition-colors"
                                        >
                                            <td className="px-4 py-3 text-sm font-medium text-surface-950 max-w-[180px] truncate">
                                                {job.company ||
                                                    job.company_slug ||
                                                    "Unknown"}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-surface-700 max-w-[280px]">
                                                <span className="line-clamp-2">
                                                    {job.title ||
                                                        "Not specified"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-surface-600 hidden sm:table-cell max-w-[180px] truncate">
                                                {getLocationString(
                                                    job.location
                                                )}
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                <span
                                                    className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${atsClass}`}
                                                >
                                                    {job.ats || "Unknown"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {applyUrl ? (
                                                    <a
                                                        href={applyUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-primary-600 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 hover:text-primary-700 transition-all"
                                                    >
                                                        Apply →
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-surface-400">
                                                        N/A
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-2 py-3 text-center">
                                                {applyUrl && (
                                                    <button
                                                        onClick={() => toggleSaveJob(applyUrl)}
                                                        className="p-1.5 rounded-lg hover:bg-amber-50 transition-colors group"
                                                        title={savedJobUrls.has(applyUrl) ? "Unsave job" : "Save job"}
                                                    >
                                                        <svg
                                                            className={`w-4 h-4 transition-colors ${savedJobUrls.has(applyUrl) ? "text-amber-500 fill-amber-500" : "text-surface-400 group-hover:text-amber-400"}`}
                                                            fill={savedJobUrls.has(applyUrl) ? "currentColor" : "none"}
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200 bg-surface-50">
                        <button
                            onClick={() =>
                                setCurrentPage((p) => Math.max(1, p - 1))
                            }
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 text-sm font-medium text-surface-700 bg-white border border-surface-300 rounded-lg hover:bg-surface-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            ← Previous
                        </button>
                        <span className="text-sm text-surface-600">
                            Page{" "}
                            <span className="font-semibold text-surface-950">
                                {currentPage}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-surface-950">
                                {totalPages.toLocaleString()}
                            </span>{" "}
                            <span className="hidden sm:inline">
                                ({displayJobs.length.toLocaleString()} jobs)
                            </span>
                        </span>
                        <button
                            onClick={() =>
                                setCurrentPage((p) =>
                                    Math.min(totalPages, p + 1)
                                )
                            }
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 text-sm font-medium text-surface-700 bg-white border border-surface-300 rounded-lg hover:bg-surface-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
