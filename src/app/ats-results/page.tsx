"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Download,
    User,
    Mail,
    Phone,
    MapPin,
    Linkedin,
    Github,
    Target,
    Compass,
    Code2,
    FolderKanban,
    Briefcase,
    AlertTriangle,
    AlertCircle,
    Info,
    Lightbulb,
    CheckCircle2,
    XCircle,
    TrendingUp,
    Loader2,
    Search,
    Sparkles,
    FileCheck,
    Layout,
    Zap,
    Hash,
    Code,
    Star,
    ArrowRight,
} from "lucide-react";
import type {
    AnalysisResult,
    ScoreBreakdown,
    SkillsData,
    ExperienceSummary,
    Project,
    ATSIssue,
    Suggestion,
    KeywordsAnalysis,
} from "@/types/ats-types";
import Link from "next/link";

/* ═══════════════════════════════════════════════════
   Score Circle — animated SVG ring
   ═══════════════════════════════════════════════════ */
function ScoreCircle({ score, size = 120 }: { score: number; size?: number }) {
    const [animatedScore, setAnimatedScore] = useState(0);
    const strokeWidth = size * 0.08;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (animatedScore / 100) * circumference;

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedScore(score), 100);
        return () => clearTimeout(timer);
    }, [score]);

    const getColor = (s: number) => {
        if (s >= 80) return { stroke: "#10b981", glow: "rgba(16,185,129,0.3)" };
        if (s >= 60) return { stroke: "#f59e0b", glow: "rgba(245,158,11,0.3)" };
        return { stroke: "#ef4444", glow: "rgba(239,68,68,0.3)" };
    };

    const colors = getColor(score);

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="transform -rotate-90"
            >
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{
                        transition: "stroke-dashoffset 1s ease-out",
                        filter: `drop-shadow(0 0 6px ${colors.glow})`,
                    }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                    className="font-bold"
                    style={{ fontSize: size * 0.3, color: colors.stroke }}
                >
                    {animatedScore}
                </span>
                <span className="text-surface-500" style={{ fontSize: size * 0.1 }}>
                    / 100
                </span>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   Score Breakdown Card
   ═══════════════════════════════════════════════════ */
const breakdownItems = [
    { key: "keyword_relevance", label: "Keyword Relevance", icon: Target, color: "from-blue-500 to-cyan-400" },
    { key: "section_completeness", label: "Section Completeness", icon: FileCheck, color: "from-purple-500 to-violet-400" },
    { key: "formatting_score", label: "Formatting", icon: Layout, color: "from-emerald-500 to-green-400" },
    { key: "skill_relevance", label: "Skill Relevance", icon: Code2, color: "from-orange-500 to-amber-400" },
    { key: "experience_clarity", label: "Experience Clarity", icon: Briefcase, color: "from-pink-500 to-rose-400" },
    { key: "project_impact", label: "Project Impact", icon: FolderKanban, color: "from-indigo-500 to-blue-400" },
];

function ScoreBreakdownCard({ breakdown }: { breakdown: ScoreBreakdown }) {
    const getBarColor = (score: number) => {
        if (score >= 80) return "bg-emerald-500";
        if (score >= 60) return "bg-amber-500";
        return "bg-red-500";
    };

    return (
        <div className="bg-white border border-surface-300 shadow-sm rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-surface-950 mb-6">Score Breakdown</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {breakdownItems.map((item) => {
                    const score = breakdown[item.key as keyof ScoreBreakdown];
                    return (
                        <div key={item.key} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center`}>
                                        <item.icon className="w-4 h-4 text-surface-950" />
                                    </div>
                                    <span className="text-sm font-medium text-surface-700">
                                        {item.label}
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-surface-950">{score}</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${getBarColor(score)} rounded-full transition-all duration-700`}
                                    style={{ width: `${score}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   Skills Card
   ═══════════════════════════════════════════════════ */
function SkillsCard({ skills }: { skills: SkillsData }) {
    const getStrengthBadge = (strength: string) => {
        switch (strength) {
            case "Strong":
                return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            case "Moderate":
                return "bg-amber-500/10 text-amber-400 border-amber-500/20";
            default:
                return "bg-red-50 text-red-400 border-red-500/20";
        }
    };

    return (
        <div className="bg-white border border-surface-300 shadow-sm rounded-2xl p-6 h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-400 rounded-xl flex items-center justify-center">
                        <Code2 className="w-5 h-5 text-surface-950" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-surface-950">Skills & Tech Stack</h2>
                        <p className="text-sm text-surface-500">{skills.total_count} skills detected</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {skills.skill_categories?.map((category) => (
                    <div key={category.name}>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-surface-700">{category.name}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getStrengthBadge(category.strength)}`}>
                                {category.strength}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {category.skills.map((skill) => (
                                <span
                                    key={skill}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 text-surface-700 rounded-lg text-sm font-medium"
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}

                {skills.soft_skills?.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-surface-700 mb-2">Soft Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {skills.soft_skills.map((skill) => (
                                <span
                                    key={skill}
                                    className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-lg text-sm font-medium"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   Experience Card
   ═══════════════════════════════════════════════════ */
function ExperienceCard({ experience }: { experience: ExperienceSummary }) {
    const getQualityColor = (quality: number) => {
        if (quality >= 70) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
        if (quality >= 50) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
        return "text-red-400 bg-red-50 border-red-500/20";
    };

    return (
        <div className="bg-white border border-surface-300 shadow-sm rounded-2xl p-6 h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-400 rounded-xl flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-surface-950" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-surface-950">Work Experience</h2>
                        <p className="text-sm text-surface-500">
                            {experience.total_years > 0
                                ? `${experience.total_years} years total`
                                : "Experience detected"}
                        </p>
                    </div>
                </div>
                <div className={`px-3 py-1.5 rounded-lg font-semibold text-sm border ${getQualityColor(experience.overall_quality)}`}>
                    Quality: {experience.overall_quality}%
                </div>
            </div>

            {experience.positions?.length > 0 ? (
                <div className="space-y-4">
                    {experience.positions.map((position, index) => (
                        <div
                            key={index}
                            className="p-4 bg-white/[0.03] border border-surface-200 rounded-xl"
                        >
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div>
                                    <h3 className="font-semibold text-surface-950">
                                        {position.role || "Role not detected"}
                                    </h3>
                                    <p className="text-sm text-surface-600">
                                        {position.company || "Company not detected"}
                                    </p>
                                </div>
                                {position.duration && (
                                    <span className="text-xs text-surface-600 bg-white/5 border border-white/10 px-2 py-1 rounded-full whitespace-nowrap">
                                        {position.duration}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs">
                                <div className="flex items-center gap-1.5 text-surface-600">
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    <span>Bullet Quality: {position.bullet_quality}%</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-surface-600">
                                    <Zap className="w-3.5 h-3.5" />
                                    <span>Action Verbs: {position.action_verbs_count}</span>
                                </div>
                                {position.has_metrics && (
                                    <div className="flex items-center gap-1.5 text-emerald-400">
                                        <Hash className="w-3.5 h-3.5" />
                                        <span>Has Metrics</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-surface-500">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 text-surface-600" />
                    <p>No work experience entries detected</p>
                    <p className="text-sm">Make sure your experience section is clearly labeled</p>
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   Projects Card
   ═══════════════════════════════════════════════════ */
function ProjectsCard({ projects }: { projects: Project[] }) {
    const getScoreColor = (score: number) => {
        if (score >= 70) return "text-emerald-400 bg-emerald-500/10";
        if (score >= 50) return "text-amber-400 bg-amber-500/10";
        return "text-red-400 bg-red-50";
    };

    return (
        <div className="bg-white border border-surface-300 shadow-sm rounded-2xl p-6 h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-400 rounded-xl flex items-center justify-center">
                        <FolderKanban className="w-5 h-5 text-surface-950" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-surface-950">Projects</h2>
                        <p className="text-sm text-surface-500">{projects.length} projects detected</p>
                    </div>
                </div>
            </div>

            {projects.length > 0 ? (
                <div className="space-y-4">
                    {projects.map((project, index) => (
                        <div
                            key={index}
                            className="p-4 bg-white/[0.03] border border-surface-200 rounded-xl"
                        >
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <h3 className="font-semibold text-surface-950 line-clamp-2">
                                    {project.title}
                                </h3>
                                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${getScoreColor(project.score)}`}>
                                    <Star className="w-3.5 h-3.5" />
                                    {project.score}
                                </div>
                            </div>

                            {project.technologies?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {project.technologies.slice(0, 5).map((tech) => (
                                        <span
                                            key={tech}
                                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-500/80 rounded text-xs border border-primary-500/15"
                                        >
                                            <Code className="w-3 h-3" />
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {project.description && (
                                <p className="text-sm text-surface-600 line-clamp-2">
                                    {project.description}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-surface-500">
                    <FolderKanban className="w-12 h-12 mx-auto mb-3 text-surface-600" />
                    <p>No projects detected</p>
                    <p className="text-sm">Add a Projects section to showcase your work</p>
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   Issues Card
   ═══════════════════════════════════════════════════ */
function IssuesCard({ issues }: { issues: ATSIssue[] }) {
    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case "High":
                return {
                    icon: AlertTriangle,
                    bg: "bg-red-50",
                    border: "border-red-500/20",
                    iconColor: "text-red-400",
                    badge: "bg-red-500/15 text-red-400",
                };
            case "Medium":
                return {
                    icon: AlertCircle,
                    bg: "bg-amber-500/10",
                    border: "border-amber-500/20",
                    iconColor: "text-amber-400",
                    badge: "bg-amber-500/15 text-amber-400",
                };
            default:
                return {
                    icon: Info,
                    bg: "bg-blue-500/10",
                    border: "border-blue-500/20",
                    iconColor: "text-blue-400",
                    badge: "bg-blue-500/15 text-blue-400",
                };
        }
    };

    const highIssues = issues.filter((i) => i.severity === "High");
    const mediumIssues = issues.filter((i) => i.severity === "Medium");
    const lowIssues = issues.filter((i) => i.severity === "Low");
    const sortedIssues = [...highIssues, ...mediumIssues, ...lowIssues];

    return (
        <div className="bg-white border border-surface-300 shadow-sm rounded-2xl p-6 h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-400 rounded-xl flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-surface-950" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-surface-950">ATS Issues Detected</h2>
                        <p className="text-sm text-surface-500">{issues.length} issues found</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {highIssues.length > 0 && (
                        <span className="text-xs px-2 py-1 bg-red-500/15 text-red-400 rounded-full font-medium">
                            {highIssues.length} High
                        </span>
                    )}
                    {mediumIssues.length > 0 && (
                        <span className="text-xs px-2 py-1 bg-amber-500/15 text-amber-400 rounded-full font-medium">
                            {mediumIssues.length} Medium
                        </span>
                    )}
                </div>
            </div>

            {sortedIssues.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {sortedIssues.map((issue, index) => {
                        const styles = getSeverityStyles(issue.severity);
                        const IconComponent = styles.icon;
                        return (
                            <div
                                key={index}
                                className={`p-4 rounded-xl border ${styles.bg} ${styles.border}`}
                            >
                                <div className="flex items-start gap-3">
                                    <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${styles.iconColor}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="font-semibold text-surface-950 text-sm">
                                                {issue.description}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles.badge}`}>
                                                {issue.severity}
                                            </span>
                                        </div>
                                        <p className="text-sm text-surface-600">{issue.suggestion}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <p className="text-surface-700 font-medium">No major issues detected!</p>
                    <p className="text-sm text-surface-500">Your resume looks ATS-friendly</p>
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   Suggestions Card
   ═══════════════════════════════════════════════════ */
function SuggestionsCard({ suggestions }: { suggestions: Suggestion[] }) {
    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case "High":
                return "border-l-primary-500 bg-primary-500/5";
            case "Medium":
                return "border-l-purple-500 bg-purple-500/5";
            default:
                return "border-l-slate-500 bg-white/[0.02]";
        }
    };

    return (
        <div className="bg-white border border-surface-300 shadow-sm rounded-2xl p-6 h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-400 rounded-xl flex items-center justify-center">
                        <Lightbulb className="w-5 h-5 text-surface-950" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-surface-950">AI Improvement Suggestions</h2>
                        <p className="text-sm text-surface-500">{suggestions.length} suggestions</p>
                    </div>
                </div>
            </div>

            {suggestions.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-xl border-l-4 ${getPriorityStyles(suggestion.priority)}`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-primary-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className="font-semibold text-surface-950 text-sm">
                                            {suggestion.title}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-surface-600 font-medium">
                                            {suggestion.category}
                                        </span>
                                    </div>
                                    <p className="text-sm text-surface-600 mb-3">
                                        {suggestion.description}
                                    </p>

                                    {suggestion.examples?.length > 0 && (
                                        <div className="space-y-2">
                                            {suggestion.examples.slice(0, 3).map((example, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-start gap-2 text-sm text-surface-700 bg-white/[0.03] border border-surface-200 rounded-lg px-3 py-2"
                                                >
                                                    <ArrowRight className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                                                    <span>{example}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
                        <Lightbulb className="w-8 h-8 text-emerald-400" />
                    </div>
                    <p className="text-surface-700 font-medium">Your resume is well-optimized!</p>
                    <p className="text-sm text-surface-500">No major improvements needed</p>
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   Keywords Card
   ═══════════════════════════════════════════════════ */
function KeywordsCard({ keywords }: { keywords: KeywordsAnalysis }) {
    return (
        <div className="bg-white border border-surface-300 shadow-sm rounded-2xl p-6 h-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-400 rounded-xl flex items-center justify-center">
                    <Search className="w-5 h-5 text-surface-950" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-surface-950">Keywords Analysis</h2>
                    <p className="text-sm text-surface-500">Important keywords for ATS</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Found Keywords */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-sm font-semibold text-surface-700">
                            Found Keywords ({keywords.found?.length || 0})
                        </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {keywords.found?.length > 0 ? (
                            keywords.found.map((kw) => (
                                <span
                                    key={kw}
                                    className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-lg text-sm font-medium"
                                >
                                    {kw}
                                </span>
                            ))
                        ) : (
                            <span className="text-sm text-surface-500">No matching keywords found</span>
                        )}
                    </div>
                </div>

                {/* Missing Keywords */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <XCircle className="w-4 h-4 text-red-400" />
                        <h3 className="text-sm font-semibold text-surface-700">
                            Missing Keywords ({keywords.missing?.length || 0})
                        </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {keywords.missing?.length > 0 ? (
                            keywords.missing.map((kw) => (
                                <span
                                    key={kw}
                                    className="px-3 py-1.5 bg-red-50 border border-red-500/20 text-red-300 rounded-lg text-sm font-medium"
                                >
                                    {kw}
                                </span>
                            ))
                        ) : (
                            <span className="text-sm text-surface-500">All important keywords present!</span>
                        )}
                    </div>
                </div>

                {/* Recommended Keywords */}
                {keywords.recommended?.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-primary-500" />
                            <h3 className="text-sm font-semibold text-surface-700">
                                Recommended to Add
                            </h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {keywords.recommended.map((kw) => (
                                <span
                                    key={kw}
                                    className="px-3 py-1.5 bg-primary-50 border border-dashed border-primary-500/30 text-primary-500/80 rounded-lg text-sm font-medium"
                                >
                                    + {kw}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   Main Results Page
   ═══════════════════════════════════════════════════ */
export default function ATSResultsPage() {
    const [results, setResults] = useState<AnalysisResult | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const stored = sessionStorage.getItem("ats_analysis_results");
        if (stored) {
            try {
                setResults(JSON.parse(stored));
            } catch {
                router.push("/#ats-analyzer");
            }
        } else {
            router.push("/#ats-analyzer");
        }
        setLoading(false);
    }, [router]);

    const handleDownloadReport = async () => {
        if (!results) return;
        setIsDownloading(true);
        try {
            const response = await fetch("/api/ats-download-report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(results),
            });

            if (!response.ok) throw new Error("Failed to generate report");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `ats-resume-report-${results.candidate.name?.replace(/\s+/g, "-") || "analysis"
                }.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download report. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    const getCategoryBadge = (category: string) => {
        switch (category) {
            case "Excellent":
                return "bg-emerald-500/15 text-emerald-400 border-emerald-500/25";
            case "Good":
                return "bg-blue-500/15 text-blue-400 border-blue-500/25";
            case "Needs Improvement":
                return "bg-amber-500/15 text-amber-400 border-amber-500/25";
            default:
                return "bg-red-500/15 text-red-400 border-red-500/25";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (!results) return null;

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
                >
                    <div className="flex items-center gap-4">
                        <Link
                            href="/#ats-analyzer"
                            className="p-2 hover:bg-white/5 rounded-xl transition-colors border border-surface-200"
                        >
                            <ArrowLeft className="w-5 h-5 text-surface-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-surface-950">
                                Resume Analysis Results
                            </h1>
                            <p className="text-surface-600">
                                {results.candidate.name || "Your Resume"} • Analyzed just now
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleDownloadReport}
                        disabled={isDownloading}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-surface-300 rounded-full text-surface-950 font-medium hover:bg-white/5 transition-all border border-white/10 disabled:opacity-50"
                    >
                        {isDownloading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        {isDownloading ? "Generating..." : "Download Report"}
                    </button>
                </motion.div>

                {/* Main Score Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
                >
                    {/* Score Card */}
                    <div className="bg-white border border-surface-300 shadow-sm rounded-2xl p-8 ">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-semibold text-surface-950 mb-2">
                                    ATS Score
                                </h2>
                                <span
                                    className={`text-xs px-3 py-1 rounded-full border font-medium ${getCategoryBadge(
                                        results.score_category
                                    )}`}
                                >
                                    {results.score_category}
                                </span>
                            </div>
                            <ScoreCircle score={results.ats_score} size={120} />
                        </div>
                        <p className="text-sm text-surface-600">
                            {results.ats_score >= 80
                                ? "Excellent! Your resume is well-optimized for ATS systems."
                                : results.ats_score >= 60
                                    ? "Good start, but there's room for improvement."
                                    : "Your resume needs significant optimization for ATS."}
                        </p>
                    </div>

                    {/* Candidate Profile */}
                    <div className="bg-white border border-surface-300 shadow-sm rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-500 rounded-xl flex items-center justify-center">
                                <User className="w-5 h-5 text-surface-950" />
                            </div>
                            <h2 className="text-lg font-semibold text-surface-950">
                                Candidate Profile
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {results.candidate.name && (
                                <div className="flex items-center gap-3 text-surface-700">
                                    <User className="w-4 h-4 text-surface-500" />
                                    <span className="font-medium">{results.candidate.name}</span>
                                </div>
                            )}
                            {results.candidate.email && (
                                <div className="flex items-center gap-3 text-surface-700">
                                    <Mail className="w-4 h-4 text-surface-500" />
                                    <span>{results.candidate.email}</span>
                                </div>
                            )}
                            {results.candidate.phone && (
                                <div className="flex items-center gap-3 text-surface-700">
                                    <Phone className="w-4 h-4 text-surface-500" />
                                    <span>{results.candidate.phone}</span>
                                </div>
                            )}
                            {results.candidate.location && (
                                <div className="flex items-center gap-3 text-surface-700">
                                    <MapPin className="w-4 h-4 text-surface-500" />
                                    <span>{results.candidate.location}</span>
                                </div>
                            )}
                            {results.candidate.linkedin && (
                                <div className="flex items-center gap-3 text-surface-700">
                                    <Linkedin className="w-4 h-4 text-surface-500" />
                                    <span className="text-sm truncate">{results.candidate.linkedin}</span>
                                </div>
                            )}
                            {results.candidate.github && (
                                <div className="flex items-center gap-3 text-surface-700">
                                    <Github className="w-4 h-4 text-surface-500" />
                                    <span className="text-sm truncate">{results.candidate.github}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Domain Detection */}
                    <div className="bg-white border border-surface-300 shadow-sm rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-400 rounded-xl flex items-center justify-center">
                                <Compass className="w-5 h-5 text-surface-950" />
                            </div>
                            <h2 className="text-lg font-semibold text-surface-950">
                                Detected Domain
                            </h2>
                        </div>
                        <div className="mb-4">
                            <div className="text-2xl font-bold text-surface-950 mb-2">
                                {results.domain.primary}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-violet-400 rounded-full transition-all duration-500"
                                        style={{ width: `${results.domain.confidence * 100}%` }}
                                    />
                                </div>
                                <span className="text-sm text-surface-600">
                                    {Math.round(results.domain.confidence * 100)}%
                                </span>
                            </div>
                        </div>
                        {results.domain.secondary && (
                            <div className="text-sm text-surface-600 mb-3">
                                <span className="font-medium text-surface-700">Secondary:</span>{" "}
                                {results.domain.secondary}
                            </div>
                        )}
                        {results.domain.keywords_matched?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {results.domain.keywords_matched.slice(0, 5).map((kw) => (
                                    <span
                                        key={kw}
                                        className="text-xs px-2 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-full"
                                    >
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Score Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <ScoreBreakdownCard breakdown={results.score_breakdown} />
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <SkillsCard skills={results.skills} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <ExperienceCard experience={results.experience} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <ProjectsCard projects={results.projects} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <KeywordsCard keywords={results.keywords_analysis} />
                    </motion.div>
                </div>

                {/* Issues and Suggestions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <IssuesCard issues={results.issues} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        <SuggestionsCard suggestions={results.suggestions} />
                    </motion.div>
                </div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="mt-12 text-center"
                >
                    <div className="inline-flex flex-col sm:flex-row items-center gap-4">
                        <Link
                            href="/#ats-analyzer"
                            className="glow-btn inline-flex items-center justify-center px-8 py-4 text-base font-bold text-surface-950 rounded-full"
                        >
                            Analyze Another Resume
                        </Link>
                        <button
                            onClick={handleDownloadReport}
                            disabled={isDownloading}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white border border-surface-300 rounded-full text-surface-950 font-semibold hover:bg-white/5 transition-all border border-white/10 disabled:opacity-50"
                        >
                            {isDownloading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                            {isDownloading ? "Generating..." : "Download Full Report"}
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
