"use client";

import { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    Upload,
    FileText,
    X,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Sparkles,
    Shield,
    Zap,
} from "lucide-react";

export default function ResumeATSSection() {
    const [file, setFile] = useState<File | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const router = useRouter();

    const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
        setValidationError(null);
        setApiError(null);

        if (rejectedFiles.length > 0) {
            const rejection = rejectedFiles[0];
            if (rejection.errors[0]?.code === "file-too-large") {
                setValidationError("File size exceeds 5MB limit");
            } else if (rejection.errors[0]?.code === "file-invalid-type") {
                setValidationError("Invalid file type. Please upload PDF or DOCX");
            } else {
                setValidationError("Invalid file");
            }
            return;
        }

        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                [".docx"],
        },
        maxSize: 5 * 1024 * 1024,
        multiple: false,
    });

    const handleRemoveFile = () => {
        setFile(null);
        setValidationError(null);
        setApiError(null);
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setIsAnalyzing(true);
        setApiError(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/ats-analyze", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to analyze resume");
            }

            const data = await response.json();
            sessionStorage.setItem("ats_analysis_results", JSON.stringify(data));
            router.push("/ats-results");
        } catch (err) {
            setApiError(
                err instanceof Error ? err.message : "An error occurred during analysis"
            );
        } finally {
            setIsAnalyzing(false);
        }
    };

    const displayError = apiError || validationError;

    return (
        <section id="ats-analyzer" className="relative py-24 overflow-hidden bg-surface-100">
            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 border border-green-200 text-accent-green text-sm font-medium mb-6">
                        <Sparkles className="w-4 h-4" />
                        Free ATS Resume Analyzer
                    </div>

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-surface-950 mb-4 tracking-tight">
                        Is Your Resume{" "}
                        <span className="gradient-text">ATS-Ready?</span>
                    </h2>
                    <p className="text-lg text-surface-600 max-w-2xl mx-auto leading-relaxed">
                        Upload your resume and get an instant AI-powered ATS compatibility
                        score with actionable suggestions to improve your chances.
                    </p>
                </motion.div>

                {/* Feature pills */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex flex-wrap justify-center gap-3 mb-10"
                >
                    {[
                        { icon: Shield, text: "No login required" },
                        { icon: Zap, text: "Results in seconds" },
                        { icon: Sparkles, text: "AI-powered analysis" },
                    ].map((item, i) => (
                        <div key={i} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-surface-300 rounded-full text-sm text-surface-600 shadow-sm">
                            <item.icon className="w-4 h-4 text-primary-500" />
                            {item.text}
                        </div>
                    ))}
                </motion.div>

                {/* Upload Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white rounded-2xl p-8 border border-surface-300 shadow-sm"
                >
                    {/* Error Display */}
                    <AnimatePresence>
                        {displayError && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6"
                            >
                                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-accent-red">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-sm font-medium">{displayError}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Dropzone */}
                    <div
                        {...getRootProps()}
                        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
              ${isDragActive
                                ? "border-primary-400 bg-primary-50"
                                : file
                                    ? "border-accent-green/60 bg-green-50"
                                    : "border-surface-400 hover:border-primary-300 hover:bg-surface-100"
                            }`}
                    >
                        <input {...getInputProps()} />

                        <AnimatePresence mode="wait">
                            {file ? (
                                <motion.div
                                    key="file"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-center mb-4">
                                        <CheckCircle2 className="w-8 h-8 text-accent-green" />
                                    </div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <FileText className="w-5 h-5 text-surface-500" />
                                        <span className="font-medium text-surface-900">{file.name}</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
                                            className="p-1 hover:bg-surface-200 rounded-full transition-colors"
                                        >
                                            <X className="w-4 h-4 text-surface-500" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-surface-500">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors border ${isDragActive
                                        ? "bg-primary-50 border-primary-200"
                                        : "bg-surface-100 border-surface-300"
                                        }`}>
                                        <Upload className={`w-8 h-8 transition-colors ${isDragActive ? "text-primary-500" : "text-surface-500"}`} />
                                    </div>
                                    <p className="text-lg font-semibold text-surface-900 mb-2">
                                        {isDragActive ? "Drop your resume here" : "Drag & drop your resume"}
                                    </p>
                                    <p className="text-surface-500 mb-4">or click to browse</p>
                                    <div className="flex items-center gap-2 text-sm text-surface-500">
                                        <span className="px-3 py-1 bg-surface-100 border border-surface-300 rounded-full">PDF</span>
                                        <span className="px-3 py-1 bg-surface-100 border border-surface-300 rounded-full">DOCX</span>
                                        <span className="text-surface-400">•</span>
                                        <span>Max 5MB</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Analyze Button */}
                    <AnimatePresence>
                        {file && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="mt-6 text-center"
                            >
                                <button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing}
                                    className="glow-btn inline-flex items-center justify-center px-10 py-4 text-base font-bold text-surface-950 rounded-full disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Analyzing Your Resume...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5 mr-2" />
                                            Analyze Resume
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Bottom trust note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-center text-sm text-surface-500 mt-6"
                >
                    🔒 Your resume is analyzed securely and never stored on our servers.
                </motion.p>
            </div>
        </section>
    );
}
