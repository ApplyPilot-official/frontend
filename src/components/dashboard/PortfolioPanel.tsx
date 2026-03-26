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

interface PortfolioReq {
    _id: string;
    status: string;
    portfolioLink?: string;
    createdAt: string;
}

interface PortfolioPanelProps {
    hasSubscription: boolean;
}

export default function PortfolioPanel({ hasSubscription }: PortfolioPanelProps) {
    const [request, setRequest] = useState<PortfolioReq | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchRequest = useCallback(async () => {
        try {
            const res = await fetch("/api/portfolio", { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setRequest(data.request || null);
            }
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchRequest(); }, [fetchRequest]);

    const handleSubmit = async () => {
        setSubmitting(true); setMsg("");
        try {
            const res = await fetch("/api/portfolio", { method: "POST", headers: getAuthHeaders() });
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
            <h2 className="text-xl font-bold text-surface-950 mb-6">🌐 Portfolio Maker</h2>
            {!hasSubscription ? (
                <div className="bg-white rounded-2xl p-10 text-center border border-amber-200">
                    <div className="text-4xl mb-3">🔒</div>
                    <h3 className="text-lg font-bold text-surface-950 mb-2">Paid Feature</h3>
                    <p className="text-surface-600 mb-4">Upgrade your plan to request a portfolio website.</p>
                    <Link href="/pricing" className="inline-block px-6 py-3 text-sm font-semibold text-surface-950 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:shadow-lg hover:shadow-primary-500/15 transition-all">
                        View Plans
                    </Link>
                </div>
            ) : request ? (
                <div className="bg-white rounded-2xl p-8 border border-green-200 text-center">
                    <div className="text-4xl mb-3">{request.status === "completed" ? "🎉" : "⏳"}</div>
                    <h3 className="text-lg font-bold text-surface-950 mb-2">
                        {request.status === "completed" ? "Portfolio Ready!" : "Portfolio Request Submitted"}
                    </h3>
                    <p className="text-surface-600 mb-4">
                        {request.status === "completed"
                            ? "Your portfolio website is live!"
                            : request.status === "in_progress"
                                ? "Our team is building your portfolio website."
                                : "Portfolio request submitted — In progress."}
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-100 border border-surface-300 mb-4">
                        <span className={`w-2 h-2 rounded-full ${request.status === "completed" ? "bg-accent-green" : request.status === "in_progress" ? "bg-primary-500" : "bg-yellow-400"}`} />
                        <span className="text-sm text-surface-600 capitalize">{request.status.replace("_", " ")}</span>
                    </div>
                    {request.portfolioLink && (
                        <div className="mt-4">
                            <a href={request.portfolioLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-surface-950 bg-gradient-to-r from-accent-green to-primary-500 rounded-xl hover:shadow-lg transition-all">
                                🔗 Visit Your Portfolio
                            </a>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-2xl p-8 border border-surface-300 text-center">
                    <div className="text-5xl mb-4">🌐</div>
                    <h3 className="text-lg font-bold text-surface-950 mb-2">Custom Portfolio Website</h3>
                    <p className="text-surface-600 mb-6 max-w-md mx-auto">
                        Get a professionally designed portfolio website that showcases your skills, projects, and experience.
                    </p>
                    {msg && (
                        <p className={`text-sm p-3 rounded-xl mb-4 ${msg.includes("success") ? "bg-green-50 text-accent-green" : "bg-red-50 text-accent-red"}`}>
                            {msg}
                        </p>
                    )}
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-8 py-3.5 text-sm font-bold text-surface-950 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:shadow-lg hover:shadow-primary-500/15 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                    >
                        {submitting ? "Submitting..." : "Request Your Custom Portfolio Website"}
                    </button>
                </div>
            )}
        </motion.div>
    );
}
