"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

interface UploadScreenProps {
    onUploadComplete: () => void;
    getAuthHeaders: () => HeadersInit;
}

export default function UploadScreen({ onUploadComplete, getAuthHeaders }: UploadScreenProps) {
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (file: File) => {
        const allowedTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
        ];
        if (!allowedTypes.includes(file.type)) {
            setError("Please upload a PDF or DOCX file.");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError("File size must be less than 10MB.");
            return;
        }
        setError("");
        setResumeFile(file);
    };

    const handleUpload = async () => {
        if (!resumeFile) return;
        setIsUploading(true);
        setError("");

        try {
            // Convert to base64
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result as string;
                    resolve(result.split(",")[1]);
                };
                reader.onerror = reject;
                reader.readAsDataURL(resumeFile);
            });

            // Upload to DB
            const uploadRes = await fetch("/api/profile/upload-resume", {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    resumeBase64: base64,
                    resumeMimeType: resumeFile.type,
                    resumeFileName: resumeFile.name,
                }),
            });

            if (!uploadRes.ok) {
                const data = await uploadRes.json();
                throw new Error(data.error || "Upload failed");
            }

            onUploadComplete();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <motion.div
            key="upload"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div>
                <h2 className="text-lg font-bold text-surface-950 mb-1">Upload Your Resume</h2>
                <p className="text-sm text-surface-600">
                    We&apos;ll extract your profile details using AI — accuracy guaranteed
                </p>
            </div>

            <div
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${isDragging
                        ? "border-primary-500 bg-primary-500/5 scale-[1.01]"
                        : resumeFile
                            ? "border-accent-green/50 bg-accent-green/5"
                            : "border-surface-300 hover:border-primary-500/50"
                    }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files[0];
                    if (file) handleFileSelect(file);
                }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file);
                    }}
                />
                {resumeFile ? (
                    <>
                        <div className="text-5xl mb-3">✅</div>
                        <p className="text-surface-950 font-semibold text-lg">{resumeFile.name}</p>
                        <p className="text-xs text-surface-500 mt-1">
                            {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <p className="text-xs text-accent-green mt-3 font-medium">Click or drop to change file</p>
                    </>
                ) : (
                    <>
                        <div className="text-5xl mb-4">📄</div>
                        <p className="text-surface-950 font-semibold text-lg">Drop your resume here</p>
                        <p className="text-surface-600 text-sm mt-1">or click to browse files</p>
                        <p className="text-xs text-surface-500 mt-3">Supports PDF, DOCX · Max 10MB</p>
                    </>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-400 bg-red-50 border border-red-500/20 rounded-xl p-3">
                    {error}
                </p>
            )}

            <button
                onClick={handleUpload}
                disabled={!resumeFile || isUploading}
                className="w-full py-3.5 text-sm font-bold text-surface-950 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {isUploading ? (
                    <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Uploading...
                    </span>
                ) : (
                    "Upload & Analyze Resume ✨"
                )}
            </button>
        </motion.div>
    );
}
