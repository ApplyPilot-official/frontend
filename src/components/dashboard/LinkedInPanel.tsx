"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

function getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
}

interface LinkedInReq {
    _id: string;
    status: string;
    linkedinUrl: string;
    notes?: string;
    deliverableUrl?: string;
    createdAt: string;
}

interface LinkedInPanelProps {
    hasSubscription: boolean;
    subscriptionPlan: string;
}

export default function LinkedInPanel({ hasSubscription, subscriptionPlan }: LinkedInPanelProps) {
    const [request, setRequest] = useState<LinkedInReq | null>(null);
    const [linkedinUrl, setLinkedinUrl] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(true);

    const isPro = hasSubscription && ["pro", "elite"].includes(subscriptionPlan);

    const fetchRequest = useCallback(async () => {
        try {
            const res = await fetch("/api/linkedin-makeover", { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setRequest(data.request || null);
            }
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchRequest(); }, [fetchRequest]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true); setMsg("");
        try {
            const res = await fetch("/api/linkedin-makeover", {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({ linkedinUrl, notes }),
            });
            const data = await res.json();
            if (res.ok) { setMsg(data.message); setRequest(data.request); }
            else setMsg(data.error || "Failed");
        } catch { setMsg("Network error"); }
        finally { setSubmitting(false); }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-xl font-bold text-white mb-6">💎 LinkedIn Makeover</h2>

            {!isPro ? (
                <div className="bg-dark-400 rounded-2xl p-10 text-center border border-yellow-500/20">
                    <div className="text-4xl mb-3">🔒</div>
                    <h3 className="text-lg font-bold text-white mb-2">Pro Feature</h3>
                    <p className="text-slate-400 mb-4">
                        Upgrade to Pro or Elite plan to get a professional LinkedIn profile makeover.
                    </p>
                    <Link href="/pricing" className="inline-block px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-neon-blue to-primary-500 rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all">
                        View Plans
                    </Link>
                </div>
            ) : request ? (
                <div className="bg-dark-400 rounded-2xl p-8 border border-neon-emerald/20 text-center">
                    <div className="text-4xl mb-3">
                        {request.status === "completed" ? "🎉" : request.status === "in_progress" ? "🔧" : "⏳"}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                        {request.status === "completed"
                            ? "Makeover Complete!"
                            : request.status === "in_progress"
                                ? "Makeover In Progress"
                                : "Request Submitted"}
                    </h3>
                    <p className="text-slate-400 mb-4">
                        {request.status === "completed"
                            ? "Your LinkedIn profile makeover is ready!"
                            : request.status === "in_progress"
                                ? "Our team is working on your LinkedIn profile makeover."
                                : "Your request has been received. Our team will review your profile and start the makeover."}
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-300 border border-dark-50/20 mb-4">
                        <span className={`w-2 h-2 rounded-full ${request.status === "completed" ? "bg-neon-emerald" : request.status === "in_progress" ? "bg-neon-blue" : "bg-yellow-400"}`} />
                        <span className="text-sm text-slate-300 capitalize">{request.status.replace("_", " ")}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        Profile: <a href={request.linkedinUrl} target="_blank" rel="noreferrer" className="text-neon-blue underline">{request.linkedinUrl}</a>
                    </p>
                    {request.deliverableUrl && (
                        <div className="mt-4">
                            <a href={request.deliverableUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-neon-emerald to-neon-blue rounded-xl hover:shadow-lg transition-all">
                                📋 View Makeover Deliverable
                            </a>
                        </div>
                    )}
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="bg-dark-400 rounded-2xl p-6 border border-dark-50/20 space-y-5">
                    <div className="text-center mb-2">
                        <div className="text-5xl mb-3">💎</div>
                        <p className="text-sm text-slate-400">
                            Get a professional LinkedIn profile makeover. Our experts will optimize your headline, summary, experience, and more.
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1.5">LinkedIn Profile URL *</label>
                        <input
                            type="url"
                            required
                            placeholder="https://linkedin.com/in/your-profile"
                            value={linkedinUrl}
                            onChange={e => setLinkedinUrl(e.target.value)}
                            className="w-full px-4 py-3 bg-dark-600 border border-dark-50/30 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Additional Notes (optional)</label>
                        <textarea
                            placeholder="Any specific areas you'd like us to focus on..."
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 bg-dark-600 border border-dark-50/30 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
                        />
                    </div>
                    {msg && (
                        <p className={`text-sm p-3 rounded-xl ${msg.includes("success") ? "bg-neon-emerald/10 text-neon-emerald" : "bg-red-500/10 text-red-400"}`}>
                            {msg}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 text-sm font-bold text-white bg-gradient-to-r from-neon-blue to-primary-500 rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-50"
                    >
                        {submitting ? "Submitting..." : "Request LinkedIn Makeover"}
                    </button>
                </form>
            )}
        </motion.div>
    );
}
