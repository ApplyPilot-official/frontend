"use client";

import { motion } from "framer-motion";

interface ErrorScreenProps {
    error: string;
    onRetry: () => void;
    onReupload: () => void;
}

export default function ErrorScreen({ error, onRetry, onReupload }: ErrorScreenProps) {
    return (
        <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="py-12 text-center"
        >
            <div className="text-5xl mb-4">😔</div>
            <h2 className="text-xl font-bold text-surface-950 mb-3">
                We had trouble reading your resume
            </h2>
            <p className="text-sm text-surface-600 mb-6 max-w-md mx-auto">
                {error || "Something went wrong during processing. Please try again."}
            </p>
            <div className="flex gap-3 justify-center">
                <button
                    onClick={onReupload}
                    className="px-6 py-3 text-sm font-medium text-surface-600 bg-surface-100 rounded-xl hover:bg-surface-100 transition-all"
                >
                    Upload Different Resume
                </button>
                <button
                    onClick={onRetry}
                    className="px-6 py-3 text-sm font-bold text-surface-950 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                >
                    Retry ↻
                </button>
            </div>
        </motion.div>
    );
}
