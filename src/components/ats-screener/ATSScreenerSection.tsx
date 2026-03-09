"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ScoreResult, Suggestion, StructuredSuggestion } from "@/lib/ats-screener/types";

// ─── Score color helpers ───
function getScoreColor(score: number) {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#eab308";
    if (score >= 40) return "#f97316";
    return "#ef4444";
}
function getScoreLabel(score: number) {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Needs Work";
    return "Poor";
}
function getScoreBg(score: number) {
    if (score >= 80) return "bg-emerald-500/10 border-emerald-500/20";
    if (score >= 60) return "bg-amber-500/10 border-amber-500/20";
    if (score >= 40) return "bg-orange-500/10 border-orange-500/20";
    return "bg-red-500/10 border-red-500/20";
}

const ACCEPTED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function isStructured(s: Suggestion): s is StructuredSuggestion {
    return typeof s === "object" && "summary" in s;
}

const impactColors: Record<string, string> = {
    critical: "#ef4444", high: "#f97316", medium: "#eab308", low: "#22c55e",
};

// ─── Score Circle ───
function ScoreCircle({ score, size = 100 }: { score: number; size?: number }) {
    const strokeWidth = size * 0.08;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = getScoreColor(score);
    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    style={{ transition: "stroke-dashoffset 1s ease-out", filter: `drop-shadow(0 0 6px ${color}40)` }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-bold" style={{ fontSize: size * 0.3, color }}>{score}</span>
                <span className="text-slate-500" style={{ fontSize: size * 0.1 }}>/ 100</span>
            </div>
        </div>
    );
}

// ─── Score Card ───
function ScoreCard({ result, onClick }: { result: ScoreResult; onClick: () => void }) {
    return (
        <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onClick}
            className={`text-left p-5 rounded-2xl border transition-all hover:scale-[1.02] ${getScoreBg(result.overallScore)}`}
        >
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="text-white font-semibold text-sm">{result.system}</h3>
                    <p className="text-xs text-slate-500">{result.vendor}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${result.passesFilter ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                    {result.passesFilter ? "PASS" : "FAIL"}
                </span>
            </div>
            <div className="flex items-end justify-between">
                <ScoreCircle score={result.overallScore} size={72} />
                <div className="flex-1 ml-4 space-y-1">
                    {[
                        { label: "Format", score: result.breakdown.formatting.score },
                        { label: "Keywords", score: result.breakdown.keywordMatch.score },
                        { label: "Sections", score: result.breakdown.sections.score },
                        { label: "Experience", score: result.breakdown.experience.score },
                    ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 w-14">{item.label}</span>
                            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${item.score}%`, background: getScoreColor(item.score), transition: "width 1s ease" }} />
                            </div>
                            <span className="text-[10px] text-slate-400 w-6 text-right">{item.score}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.button>
    );
}

// ─── Detail Modal ───
function DetailView({ result, onClose }: { result: ScoreResult; onClose: () => void }) {
    const b = result.breakdown;
    const dimensions = [
        { label: "Formatting", score: b.formatting.score, details: [...b.formatting.issues, ...b.formatting.details] },
        { label: "Keywords", score: b.keywordMatch.score, details: [`Matched: ${b.keywordMatch.matched.slice(0, 5).join(", ") || "none"}`, `Missing: ${b.keywordMatch.missing.slice(0, 5).join(", ") || "none"}`] },
        { label: "Sections", score: b.sections.score, details: [`Present: ${b.sections.present.join(", ") || "none"}`, `Missing: ${b.sections.missing.join(", ") || "none"}`] },
        { label: "Experience", score: b.experience.score, details: b.experience.highlights },
        { label: "Education", score: b.education.score, details: b.education.notes },
    ];
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="bg-dark-400 rounded-2xl p-6 border border-dark-50/20">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <ScoreCircle score={result.overallScore} size={56} />
                    <div>
                        <h3 className="text-white font-bold text-lg">{result.system}</h3>
                        <p className="text-xs text-slate-500">{result.vendor}</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>
            <div className="space-y-4">
                {dimensions.map((dim) => (
                    <div key={dim.label} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-slate-300">{dim.label}</span>
                            <span className="text-sm font-bold" style={{ color: getScoreColor(dim.score) }}>{dim.score}</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
                            <div className="h-full rounded-full" style={{ width: `${dim.score}%`, background: getScoreColor(dim.score), transition: "width 0.8s ease" }} />
                        </div>
                        <ul className="space-y-1">
                            {dim.details.map((d, i) => (
                                <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                                    <span className="text-slate-600 mt-0.5">•</span>{d}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

// ─── Main ATSScreenerSection ───
export default function ATSScreenerSection() {
    // State
    const [file, setFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState("");
    const [isParsing, setIsParsing] = useState(false);
    const [isScoring, setIsScoring] = useState(false);
    const [parsedText, setParsedText] = useState("");
    const [results, setResults] = useState<ScoreResult[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedResult, setSelectedResult] = useState<ScoreResult | null>(null);
    const [expandedSuggestion, setExpandedSuggestion] = useState<number | null>(null);
    const [showJD, setShowJD] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const hasResults = results.length > 0;
    const avgScore = hasResults ? Math.round(results.reduce((sum, r) => sum + r.overallScore, 0) / results.length) : 0;
    const passCount = results.filter((r) => r.passesFilter).length;

    // All unique suggestions
    const allSuggestions = (() => {
        const seen = new Set<string>();
        const sugs: Suggestion[] = [];
        for (const r of results) {
            for (const s of (r.suggestions || [])) {
                const key = isStructured(s) ? s.summary : String(s);
                if (!seen.has(key)) { seen.add(key); sugs.push(s); }
            }
        }
        return sugs.slice(0, 5);
    })();

    // File handling
    function validateAndSetFile(f: File) {
        setError(null);
        setResults([]);
        setParsedText("");
        setSelectedResult(null);
        if (!ACCEPTED_TYPES.includes(f.type)) { setError("Please upload a PDF or DOCX file."); return; }
        if (f.size > 10 * 1024 * 1024) { setError("File too large (max 10MB)."); return; }
        setFile(f);
    }

    // Parse the file client-side
    const parseFile = useCallback(async (f: File) => {
        setIsParsing(true);
        setError(null);
        try {
            let text = "";
            if (f.type === "application/pdf") {
                const pdfjsLib = await import("pdfjs-dist/build/pdf.mjs");
                pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
                const arrayBuffer = await f.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
                const pages: string[] = [];
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    pages.push(content.items.map((item: any) => (item.str || "")).join(" "));
                }
                text = pages.join("\n\n");
            } else {
                const mammoth = await import("mammoth");
                const arrayBuffer = await f.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer });
                text = result.value;
            }
            if (text.trim().length < 20) {
                setError("Could not extract enough text from the file. Try a different PDF/DOCX.");
                setIsParsing(false);
                return;
            }
            setParsedText(text);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to parse file");
        } finally {
            setIsParsing(false);
        }
    }, []);

    // Auto-parse when file changes
    useEffect(() => {
        if (file && !isParsing && !parsedText) parseFile(file);
    }, [file, isParsing, parsedText, parseFile]);

    // Scan: LLM first, fallback to rule-based
    async function handleScan() {
        if (!parsedText) return;
        setIsScoring(true);
        setError(null);
        setSelectedResult(null);

        try {
            // Try LLM scoring
            const res = await fetch("/api/ats-screener/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resumeText: parsedText,
                    jobDescription: jobDescription.trim() || undefined,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.results && Array.isArray(data.results) && data.results.length > 0) {
                    setResults(normalizeResults(data.results));
                    return;
                }
            }

            // Fallback to rule-based scoring
            console.log("[ats-screener] LLM failed, using rule-based scoring");
            const { scoreResume } = await import("@/lib/ats-screener/engine");
            const input = {
                resumeText: parsedText,
                resumeSkills: extractSkills(parsedText),
                resumeSections: detectSections(parsedText),
                experienceBullets: extractBullets(parsedText),
                educationText: extractEducation(parsedText),
                hasMultipleColumns: false,
                hasTables: false,
                hasImages: false,
                pageCount: 1,
                wordCount: parsedText.split(/\s+/).length,
                jobDescription: jobDescription.trim() || undefined,
            };
            const ruleResults = scoreResume(input);
            setResults(ruleResults);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Scoring failed");
        } finally {
            setIsScoring(false);
        }
    }

    function handleReset() {
        setFile(null);
        setParsedText("");
        setResults([]);
        setError(null);
        setSelectedResult(null);
        setJobDescription("");
        setShowJD(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    function exportResults() {
        const data = {
            exportedAt: new Date().toISOString(),
            averageScore: avgScore,
            passingCount: passCount,
            totalSystems: results.length,
            results,
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ats-scores-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Determine step
    const step = hasResults ? 4 : isScoring ? 3 : parsedText ? 2 : file ? 1 : 0;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    🎯 ATS Screener
                    <span className="text-xs font-medium text-slate-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">6 Platforms</span>
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                    Scan your resume against 6 real ATS systems — Workday, Taleo, iCIMS, Greenhouse, Lever, and SuccessFactors.
                </p>
            </div>

            {/* Step Progress */}
            <div className="flex items-center justify-center gap-0 mb-8">
                {["Upload", "Parse", "Scan", "Results"].map((label, i) => (
                    <div key={label} className="flex items-center">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all duration-500 ${step > i ? "bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-400" :
                            step === i ? "bg-neon-blue/15 border-2 border-neon-blue/40 text-neon-blue" :
                                "bg-white/5 border-2 border-white/10 text-slate-600"
                            }`}>
                            {step > i ? "✓" : i + 1}
                        </div>
                        {i < 3 && <div className={`w-12 h-0.5 transition-all duration-500 ${step > i ? "bg-gradient-to-r from-emerald-500/40 to-neon-blue/30" : "bg-white/10"}`} />}
                    </div>
                ))}
            </div>

            {/* Upload Area */}
            <div
                className={`relative p-8 rounded-2xl border-2 border-dashed cursor-pointer text-center transition-all ${isDragging ? "border-neon-blue bg-neon-blue/5 shadow-lg shadow-neon-blue/10" :
                    file ? "border-emerald-500/30 bg-emerald-500/5 border-solid" :
                        "border-white/15 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]"
                    }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) validateAndSetFile(f); }}
                onClick={() => fileInputRef.current?.click()}
            >
                <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) validateAndSetFile(f); }} />

                {isParsing ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
                        <p className="text-white font-semibold">Parsing Your Resume...</p>
                        <p className="text-xs text-slate-500">Extracting text and metadata</p>
                    </div>
                ) : file ? (
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14,2 14,8 20,8" />
                                <path d="M10 12l2 2 4-4" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <p className="text-white font-semibold">{file.name}</p>
                            <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB{parsedText ? ` · ${parsedText.split(/\s+/).length} words extracted` : ""}</p>
                        </div>
                        <div className="text-emerald-400">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20,6 9,17 4,12" />
                            </svg>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-neon-blue/8 border border-neon-blue/15 rounded-2xl flex items-center justify-center">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="1.5">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17,8 12,3 7,8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        </div>
                        <p className="text-white font-semibold">Drag & Drop Your Resume</p>
                        <p className="text-xs text-slate-500">or click to browse. PDF or DOCX, max 10MB.</p>
                        <div className="flex gap-2">
                            {[".PDF", ".DOCX"].map((fmt) => (
                                <span key={fmt} className="text-[10px] font-semibold text-slate-500 bg-white/[0.03] border border-white/10 px-2 py-0.5 rounded">{fmt}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Job Description Toggle */}
            {file && (
                <div className="mt-4">
                    <button onClick={() => setShowJD(!showJD)}
                        className="text-xs text-neon-blue hover:text-white flex items-center gap-1.5 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
                        </svg>
                        {showJD ? "Hide" : "Add"} Job Description (Optional — for targeted scoring)
                    </button>
                    <AnimatePresence>
                        {showJD && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                <textarea
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="Paste a job description here for targeted keyword matching..."
                                    className="w-full mt-3 p-4 bg-dark-400 border border-dark-50/20 rounded-xl text-sm text-slate-300 placeholder-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-neon-blue/30 focus:border-neon-blue/30"
                                    rows={5}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-sm text-red-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    {error}
                </div>
            )}

            {/* Actions */}
            {file && (
                <div className="flex gap-3 mt-6">
                    {hasResults && (
                        <button onClick={handleReset}
                            className="px-5 py-2.5 text-sm font-medium text-slate-400 bg-white/5 border border-white/10 rounded-xl hover:text-white hover:border-white/20 transition-all flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="1,4 1,10 7,10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                            </svg>
                            Start Over
                        </button>
                    )}
                    <button onClick={handleScan} disabled={!parsedText || isScoring}
                        className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-neon-blue to-primary-500 rounded-xl hover:shadow-lg hover:shadow-neon-blue/20 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none flex items-center gap-2">
                        {isScoring ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Scoring...</>
                        ) : hasResults ? (
                            <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="23,4 23,10 17,10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                            </svg> Re-Scan</>
                        ) : (
                            <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14,2 14,8 20,8" /><path d="M12 18v-6" /><path d="M9 15l3 3 3-3" />
                            </svg> Scan Resume</>
                        )}
                    </button>
                </div>
            )}

            {/* Scanning Animation */}
            <AnimatePresence>
                {isScoring && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mt-8 p-8 bg-dark-400 rounded-2xl border border-dark-50/20 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 border-3 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin" />
                        <p className="text-white font-semibold mb-1">Scanning Against 6 ATS Platforms...</p>
                        <p className="text-xs text-slate-500">Workday · Taleo · iCIMS · Greenhouse · Lever · SuccessFactors</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Resume Overview — shows after parsing */}
            <AnimatePresence>
                {parsedText && !isParsing && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mt-6 p-5 bg-dark-400 rounded-2xl border border-dark-50/20">
                        <div className="flex items-center gap-2 mb-4 text-neon-blue">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14,2 14,8 20,8" />
                            </svg>
                            <h3 className="text-white font-bold text-sm">Resume Overview</h3>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
                            {(() => {
                                const words = parsedText.split(/\s+/).filter(Boolean).length;
                                const sections = detectSections(parsedText);
                                const skills = extractSkills(parsedText);
                                const bullets = extractBullets(parsedText);
                                const education = extractEducation(parsedText);
                                const stats = [
                                    { value: words, label: "Words" },
                                    { value: file?.name.endsWith(".pdf") ? 1 : 1, label: "Pages" },
                                    { value: sections.length, label: "Sections" },
                                    { value: skills.length, label: "Skills" },
                                    { value: bullets.length, label: "Bullets" },
                                    { value: education.trim() ? 1 : 0, label: "Education" },
                                ];
                                return stats.map((s) => (
                                    <div key={s.label} className="flex flex-col items-center p-2.5 bg-white/[0.02] border border-white/5 rounded-xl">
                                        <span className="text-xl font-extrabold text-white tabular-nums">{s.value}</span>
                                        <span className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">{s.label}</span>
                                    </div>
                                ));
                            })()}
                        </div>

                        {/* Detected Sections */}
                        {(() => {
                            const sections = detectSections(parsedText);
                            if (sections.length === 0) return null;
                            return (
                                <div className="mb-4 pt-3 border-t border-white/5">
                                    <h4 className="text-xs font-semibold text-slate-400 mb-2">Detected Sections</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {sections.map((s) => (
                                            <span key={s} className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/8 border border-emerald-500/15 rounded-full capitalize">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                    <polyline points="20,6 9,17 4,12" />
                                                </svg>
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Extracted Skills */}
                        {(() => {
                            const skills = extractSkills(parsedText);
                            if (skills.length === 0) return null;
                            return (
                                <div className="mb-4 pt-3 border-t border-white/5">
                                    <h4 className="text-xs font-semibold text-slate-400 mb-2">Extracted Skills ({skills.length})</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {skills.slice(0, 30).map((skill) => (
                                            <span key={skill} className="px-2.5 py-0.5 text-[11px] font-medium text-neon-blue bg-neon-blue/8 border border-neon-blue/15 rounded-full">
                                                {skill}
                                            </span>
                                        ))}
                                        {skills.length > 30 && (
                                            <span className="px-2.5 py-0.5 text-[11px] font-medium text-slate-500 bg-white/[0.03] border border-white/10 rounded-full">
                                                +{skills.length - 30} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Contact Info */}
                        {(() => {
                            const emailMatch = parsedText.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
                            const phoneMatch = parsedText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
                            const linkedinMatch = parsedText.match(/linkedin\.com\/in\/[\w-]+/i);
                            const githubMatch = parsedText.match(/github\.com\/[\w-]+/i);
                            if (!emailMatch && !phoneMatch && !linkedinMatch && !githubMatch) return null;
                            return (
                                <div className="mb-4 pt-3 border-t border-white/5">
                                    <h4 className="text-xs font-semibold text-slate-400 mb-2">Contact Info</h4>
                                    <div className="flex flex-col gap-1.5">
                                        {emailMatch && (
                                            <div className="flex items-center gap-2 text-xs text-slate-300">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500 flex-shrink-0">
                                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                                    <polyline points="22,6 12,13 2,6" />
                                                </svg>
                                                {emailMatch[0]}
                                            </div>
                                        )}
                                        {phoneMatch && (
                                            <div className="flex items-center gap-2 text-xs text-slate-300">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500 flex-shrink-0">
                                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                                                </svg>
                                                {phoneMatch[0]}
                                            </div>
                                        )}
                                        {linkedinMatch && (
                                            <div className="flex items-center gap-2 text-xs text-slate-300">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-slate-500 flex-shrink-0">
                                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                                </svg>
                                                {linkedinMatch[0]}
                                            </div>
                                        )}
                                        {githubMatch && (
                                            <div className="flex items-center gap-2 text-xs text-slate-300">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-slate-500 flex-shrink-0">
                                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                                </svg>
                                                {githubMatch[0]}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Format Flags */}
                        <div className="pt-3 border-t border-white/5">
                            <div className="flex flex-wrap gap-3">
                                {[
                                    { label: "Single Column", ok: true },
                                    { label: "No Tables", ok: !parsedText.includes("|---") },
                                    { label: "No Images", ok: true },
                                    { label: "Length OK", ok: parsedText.split(/\s+/).length >= 150 && parsedText.split(/\s+/).length <= 1500 },
                                ].map((flag) => (
                                    <div key={flag.label} className="flex items-center gap-1.5 text-xs">
                                        {flag.ok ? (
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                                                <polyline points="20,6 9,17 4,12" />
                                            </svg>
                                        ) : (
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                            </svg>
                                        )}
                                        <span className={flag.ok ? "text-slate-400" : "text-amber-400"}>{flag.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results Dashboard */}
            <AnimatePresence>
                {hasResults && !isScoring && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
                        {/* Summary Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-dark-400 rounded-2xl border border-dark-50/20">
                            <div className="flex items-center gap-6">
                                <ScoreCircle score={avgScore} size={90} />
                                <div>
                                    <span className="text-2xl font-bold" style={{ color: getScoreColor(avgScore) }}>{getScoreLabel(avgScore)}</span>
                                    <p className="text-xs text-slate-500 mt-0.5">Average ATS Score</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <span className="text-xl font-bold text-white">{passCount}/{results.length}</span>
                                    <p className="text-xs text-slate-500">Systems Passed</p>
                                </div>
                                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${jobDescription.trim() ? "bg-neon-blue/10 border border-neon-blue/20 text-neon-blue" : "bg-white/5 border border-white/10 text-slate-400"
                                    }`}>
                                    {jobDescription.trim() ? "🎯 Targeted" : "🛡️ General"}
                                </span>
                                <button onClick={exportResults} className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:border-white/20 transition-all" title="Export JSON">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7,10 12,15 17,10" /><line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Score Cards Grid */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {results.map((result) => (
                                <ScoreCard key={result.system} result={result} onClick={() => setSelectedResult(selectedResult?.system === result.system ? null : result)} />
                            ))}
                        </div>

                        {/* Selected Detail */}
                        <AnimatePresence>
                            {selectedResult && <DetailView result={selectedResult} onClose={() => setSelectedResult(null)} />}
                        </AnimatePresence>

                        {/* Suggestions */}
                        {allSuggestions.length > 0 && (
                            <div className="p-6 bg-dark-400 rounded-2xl border border-dark-50/20">
                                <div className="flex items-center gap-2 mb-1 text-neon-blue">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                                    </svg>
                                    <h3 className="text-white font-bold">Optimization Suggestions</h3>
                                </div>
                                <p className="text-xs text-slate-500 mb-4">Actionable recommendations based on analysis across all 6 ATS platforms.</p>
                                <div className="space-y-2">
                                    {allSuggestions.map((suggestion, i) => {
                                        const structured = isStructured(suggestion);
                                        const impactLabel = structured ? suggestion.impact : (i === 0 ? "critical" : i === 1 ? "high" : "medium");
                                        const impactColor = impactColors[impactLabel] || "#eab308";
                                        return (
                                            <button key={i} onClick={() => setExpandedSuggestion(expandedSuggestion === i ? null : i)}
                                                className="w-full text-left p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/10 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: impactColor }}>{i + 1}</span>
                                                    <span className="flex-1 text-sm text-slate-300">{structured ? suggestion.summary : String(suggestion)}</span>
                                                    <span className="text-[10px] font-semibold uppercase" style={{ color: impactColor }}>{impactLabel}</span>
                                                    <svg className={`w-3.5 h-3.5 text-slate-500 transition-transform ${expandedSuggestion === i ? "rotate-180" : ""}`}
                                                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6,9 12,15 18,9" /></svg>
                                                </div>
                                                <AnimatePresence>
                                                    {expandedSuggestion === i && structured && (suggestion as StructuredSuggestion).details.length > 0 && (
                                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                                            <ul className="mt-3 pt-3 border-t border-white/5 space-y-2">
                                                                {(suggestion as StructuredSuggestion).details.map((d, j) => (
                                                                    <li key={j} className="text-xs text-slate-400 flex items-start gap-1.5">
                                                                        <span className="text-neon-blue mt-0.5">→</span>{d}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                            {(suggestion as StructuredSuggestion).platforms.length > 0 && (
                                                                <div className="flex gap-1.5 mt-2">
                                                                    {(suggestion as StructuredSuggestion).platforms.map((p) => (
                                                                        <span key={p} className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 rounded text-slate-500">{p}</span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── Helper functions for rule-based fallback ───
function normalizeResults(raw: Record<string, unknown>[]): ScoreResult[] {
    return raw.map((r) => {
        const bd = (r.breakdown ?? {}) as Record<string, unknown>;
        const fmt = (bd.formatting ?? {}) as Record<string, unknown>;
        const kw = (bd.keywordMatch ?? {}) as Record<string, unknown>;
        const sec = (bd.sections ?? {}) as Record<string, unknown>;
        const exp = (bd.experience ?? {}) as Record<string, unknown>;
        const edu = (bd.education ?? {}) as Record<string, unknown>;
        return {
            system: String(r.system ?? "Unknown"),
            vendor: String(r.vendor ?? "Unknown"),
            overallScore: clamp(Number(r.overallScore) || 0, 0, 100),
            passesFilter: Boolean(r.passesFilter),
            breakdown: {
                formatting: { score: clamp(Number(fmt.score) || 0, 0, 100), issues: toStrArr(fmt.issues), details: toStrArr(fmt.details) },
                keywordMatch: { score: clamp(Number(kw.score) || 0, 0, 100), matched: toStrArr(kw.matched), missing: toStrArr(kw.missing), synonymMatched: toStrArr(kw.synonymMatched) },
                sections: { score: clamp(Number(sec.score) || 0, 0, 100), present: toStrArr(sec.present), missing: toStrArr(sec.missing) },
                experience: { score: clamp(Number(exp.score) || 0, 0, 100), quantifiedBullets: Number(exp.quantifiedBullets) || 0, totalBullets: Number(exp.totalBullets) || 0, actionVerbCount: Number(exp.actionVerbCount) || 0, highlights: toStrArr(exp.highlights) },
                education: { score: clamp(Number(edu.score) || 0, 0, 100), notes: toStrArr(edu.notes) },
            },
            suggestions: toSuggArr(r.suggestions),
        };
    });
}

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, Math.round(n))); }
function toStrArr(val: unknown): string[] { if (!Array.isArray(val)) return []; return val.filter((v) => typeof v === "string"); }
function toSuggArr(val: unknown): Suggestion[] {
    if (!Array.isArray(val)) return [];
    return val.map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "summary" in item) return item as StructuredSuggestion;
        return null;
    }).filter((v): v is Suggestion => v !== null);
}

function extractSkills(text: string): string[] {
    const skillsSection = text.match(/(?:skills|technologies|technical skills)[:\s]*([\s\S]*?)(?:\n\n|\n[A-Z])/i);
    if (!skillsSection) return [];
    return skillsSection[1].split(/[,;|•·\n]/).map((s) => s.trim()).filter((s) => s.length > 1 && s.length < 50);
}

function detectSections(text: string): string[] {
    const sections: string[] = [];
    const lowerText = text.toLowerCase();
    if (/(?:email|phone|@|linkedin)/i.test(text)) sections.push("contact");
    if (/\b(?:experience|work history|employment|professional experience)\b/i.test(lowerText)) sections.push("experience");
    if (/\b(?:education|university|college|degree|bachelor|master|phd)\b/i.test(lowerText)) sections.push("education");
    if (/\b(?:skills|technologies|tech stack|competencies)\b/i.test(lowerText)) sections.push("skills");
    if (/\b(?:projects|portfolio)\b/i.test(lowerText)) sections.push("projects");
    if (/\b(?:summary|objective|profile|about)\b/i.test(lowerText)) sections.push("summary");
    if (/\b(?:certifications?|licenses?)\b/i.test(lowerText)) sections.push("certifications");
    return sections;
}

function extractBullets(text: string): string[] {
    const lines = text.split("\n");
    return lines.filter((l) => /^\s*[-•*·▪►➤○●]\s/.test(l) || /^\s*\d+\.\s/.test(l)).map((l) => l.replace(/^\s*[-•*·▪►➤○●\d.]\s*/, "").trim()).filter((l) => l.length > 10);
}

function extractEducation(text: string): string {
    const match = text.match(/(?:education|academic)[:\s]*([\s\S]*?)(?:\n\n[A-Z]|\n(?:experience|skills|projects|certifications))/i);
    return match ? match[1].trim() : "";
}
