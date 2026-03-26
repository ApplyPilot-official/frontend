"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface CredentialsScreenProps {
    onComplete: () => void;
    getAuthHeaders: () => HeadersInit;
}

export default function CredentialsScreen({ onComplete, getAuthHeaders }: CredentialsScreenProps) {
    const [form, setForm] = useState({
        gmailAppPassword: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError("");
        try {
            const res = await fetch("/api/profile/credentials", {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Failed to save credentials");
                return;
            }
            onComplete();
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const hasAnyValue = form.gmailAppPassword.trim() !== "";

    return (
        <motion.div
            key="credentials"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="text-center">
                <div className="text-4xl mb-3">🔐</div>
                <h3 className="text-lg font-bold text-surface-950 mb-1">Account Credentials</h3>
                <p className="text-sm text-surface-600">
                    We use your Google App Password to auto-apply to jobs on your behalf via company portals.
                </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs text-amber-700">
                    🔒 <strong>Your credentials are encrypted with AES-256</strong> and never shared with any AI model or logged anywhere. They are only used by our secure automation agents.
                </p>
            </div>

            {/* Gmail App Password Section */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">📧</span>
                    <h4 className="text-sm font-semibold text-surface-900">Google / Gmail App Password</h4>
                    <span className="text-[10px] bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">⭐ Required</span>
                </div>
                <p className="text-xs text-surface-500 ml-7">Used to sign into company portals (Workday, Greenhouse, Lever, etc.) on your behalf.</p>
                <div className="max-w-md">
                    <label className="block text-xs text-surface-600 mb-1">Gmail App Password</label>
                    <input
                        type="password"
                        placeholder="Enter your Google App Password"
                        value={form.gmailAppPassword}
                        onChange={e => handleChange("gmailAppPassword", e.target.value)}
                        className="w-full px-4 py-3 bg-surface-100 border border-surface-300 rounded-xl text-surface-950 text-sm placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-300"
                    />
                    <a
                        href="https://myaccount.google.com/apppasswords"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-primary-500 hover:underline mt-1 inline-block"
                    >
                        How to get an App Password →
                    </a>
                </div>
            </div>

            {error && (
                <p className="text-sm p-3 rounded-xl bg-red-50 text-accent-red border border-red-200">{error}</p>
            )}

            <div className="flex gap-3">
                <button
                    onClick={onComplete}
                    className="flex-1 py-3 text-sm font-medium text-surface-600 bg-surface-100 border border-surface-300 rounded-xl hover:bg-surface-200 transition-all"
                >
                    Skip for now
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={submitting || !hasAnyValue}
                    className="flex-1 py-3 text-sm font-bold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:shadow-lg hover:shadow-primary-500/15 transition-all disabled:opacity-50"
                >
                    {submitting ? "Saving securely..." : "Save & Continue"}
                </button>
            </div>
        </motion.div>
    );
}
