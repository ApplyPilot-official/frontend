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
            <h2 className="text-xl font-bold text-white mb-6">🌐 Portfolio Maker</h2>
            {!hasSubscription ? (
                <div className="bg-dark-400 rounded-2xl p-10 text-center border border-yellow-500/20">
                    <div className="text-4xl mb-3">🔒</div>
                    <h3 className="text-lg font-bold text-white mb-2">Paid Feature</h3>
                    <p className="text-slate-400 mb-4">Upgrade your plan to request a portfolio website.</p>
                    <Link href="/pricing" className="inline-block px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-neon-blue to-primary-500 rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all">
                        View Plans
                    </Link>
                </div>
            ) : request ? (
                <div className="bg-dark-400 rounded-2xl p-8 border border-neon-emerald/20 text-center">
                    <div className="text-4xl mb-3">{request.status === "completed" ? "🎉" : "⏳"}</div>
                    <h3 className="text-lg font-bold text-white mb-2">
                        {request.status === "completed" ? "Portfolio Ready!" : "Portfolio Request Submitted"}
                    </h3>
                    <p className="text-slate-400 mb-4">
                        {request.status === "completed"
                            ? "Your portfolio website is live!"
                            : request.status === "in_progress"
                                ? "Our team is building your portfolio website."
                                : "Portfolio request submitted — In progress."}
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-300 border border-dark-50/20 mb-4">
                        <span className={`w-2 h-2 rounded-full ${request.status === "completed" ? "bg-neon-emerald" : request.status === "in_progress" ? "bg-neon-blue" : "bg-yellow-400"}`} />
                        <span className="text-sm text-slate-300 capitalize">{request.status.replace("_", " ")}</span>
                    </div>
                    {request.portfolioLink && (
                        <div className="mt-4">
                            <a href={request.portfolioLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-neon-emerald to-neon-blue rounded-xl hover:shadow-lg transition-all">
                                🔗 Visit Your Portfolio
                            </a>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-dark-400 rounded-2xl p-8 border border-dark-50/20 text-center">
                    <div className="text-5xl mb-4">🌐</div>
                    <h3 className="text-lg font-bold text-white mb-2">Custom Portfolio Website</h3>
                    <p className="text-slate-400 mb-6 max-w-md mx-auto">
                        Get a professionally designed portfolio website that showcases your skills, projects, and experience.
                    </p>
                    {msg && (
                        <p className={`text-sm p-3 rounded-xl mb-4 ${msg.includes("success") ? "bg-neon-emerald/10 text-neon-emerald" : "bg-red-500/10 text-red-400"}`}>
                            {msg}
                        </p>
                    )}
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-8 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-neon-blue to-primary-500 rounded-xl hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                    >
                        {submitting ? "Submitting..." : "Request Your Custom Portfolio Website"}
                    </button>
                </div>
            )}
        </motion.div>
    );
}
