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
    serviceType?: string;
    deliverableUrl?: string;
    createdAt: string;
}

interface LinkedInPanelProps {
    hasSubscription: boolean;
    subscriptionPlan: string;
}

type ServiceTab = "suggestions" | "done_for_you";

export default function LinkedInPanel({ hasSubscription, subscriptionPlan }: LinkedInPanelProps) {
    const [request, setRequest] = useState<LinkedInReq | null>(null);
    const [linkedinUrl, setLinkedinUrl] = useState("");
    const [notes, setNotes] = useState("");
    const [serviceTab, setServiceTab] = useState<ServiceTab>("suggestions");
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginPhone, setLoginPhone] = useState("");
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
            const body: Record<string, string> = {
                linkedinUrl,
                notes,
                serviceType: serviceTab,
            };
            if (serviceTab === "done_for_you") {
                body.linkedInLoginEmail = loginEmail;
                body.linkedInLoginPassword = loginPassword;
                body.linkedInLoginPhone = loginPhone;
            }
            const res = await fetch("/api/linkedin-makeover", {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(body),
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
            <h2 className="text-xl font-bold text-surface-950 mb-6">💎 LinkedIn Makeover</h2>

            {!isPro ? (
                <div className="bg-white rounded-2xl p-10 text-center border border-amber-200">
                    <div className="text-4xl mb-3">🔒</div>
                    <h3 className="text-lg font-bold text-surface-950 mb-2">Pro Feature</h3>
                    <p className="text-surface-600 mb-4">
                        Upgrade to Pro or Elite plan to get a professional LinkedIn profile makeover.
                    </p>
                    <Link href="/pricing" className="inline-block px-6 py-3 text-sm font-semibold text-surface-950 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:shadow-lg hover:shadow-primary-500/15 transition-all">
                        View Plans
                    </Link>
                </div>
            ) : request ? (
                <div className="bg-white rounded-2xl p-8 border border-green-200 text-center">
                    <div className="text-4xl mb-3">
                        {request.status === "completed" ? "🎉" : request.status === "in_progress" ? "🔧" : "⏳"}
                    </div>
                    <h3 className="text-lg font-bold text-surface-950 mb-2">
                        {request.status === "completed"
                            ? "Makeover Complete!"
                            : request.status === "in_progress"
                                ? "Makeover In Progress"
                                : "Request Submitted"}
                    </h3>
                    <p className="text-surface-600 mb-3">
                        {request.status === "completed"
                            ? "Your LinkedIn profile makeover is ready!"
                            : request.status === "in_progress"
                                ? "Our team is working on your LinkedIn profile makeover."
                                : "Your request has been received. Our team will review your profile and start the makeover."}
                    </p>
                    {request.serviceType && (
                        <span className={`inline-block text-xs px-3 py-1 rounded-full mb-3 ${request.serviceType === "done_for_you"
                                ? "bg-violet-50 text-violet-600"
                                : "bg-primary-50 text-primary-600"
                            }`}>
                            {request.serviceType === "done_for_you" ? "✨ Done-For-You" : "📋 Enhancement Suggestions"}
                        </span>
                    )}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-100 border border-surface-300 mb-4">
                        <span className={`w-2 h-2 rounded-full ${request.status === "completed" ? "bg-accent-green" : request.status === "in_progress" ? "bg-primary-500" : "bg-yellow-400"}`} />
                        <span className="text-sm text-surface-600 capitalize">{request.status.replace("_", " ")}</span>
                    </div>
                    <p className="text-xs text-surface-500 mt-2">
                        Profile: <a href={request.linkedinUrl} target="_blank" rel="noreferrer" className="text-primary-500 underline">{request.linkedinUrl}</a>
                    </p>
                    {request.deliverableUrl && (
                        <div className="mt-4">
                            <a href={request.deliverableUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-surface-950 bg-gradient-to-r from-accent-green to-primary-500 rounded-xl hover:shadow-lg transition-all">
                                📋 View Makeover Deliverable
                            </a>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-5">
                    {/* Service Type Tabs */}
                    <div className="flex gap-2 bg-surface-100 p-1 rounded-xl">
                        <button
                            onClick={() => setServiceTab("suggestions")}
                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${serviceTab === "suggestions"
                                    ? "bg-white text-primary-600 shadow-sm"
                                    : "text-surface-600 hover:text-surface-900"
                                }`}
                        >
                            📋 Enhancement Suggestions
                        </button>
                        <button
                            onClick={() => setServiceTab("done_for_you")}
                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${serviceTab === "done_for_you"
                                    ? "bg-white text-violet-600 shadow-sm"
                                    : "text-surface-600 hover:text-surface-900"
                                }`}
                        >
                            ✨ Done-For-You Makeover
                        </button>
                    </div>

                    {/* Tab Description */}
                    <div className={`rounded-xl p-3 border text-xs ${serviceTab === "suggestions"
                            ? "bg-primary-50 border-primary-100 text-primary-700"
                            : "bg-violet-50 border-violet-100 text-violet-700"
                        }`}>
                        {serviceTab === "suggestions" ? (
                            <p>📋 We&apos;ll analyze your profile and send you a detailed document with specific improvements for your headline, summary, experience, and more. <strong>You make the changes yourself.</strong></p>
                        ) : (
                            <p>✨ Our team will <strong>log into your LinkedIn account and make all the changes for you</strong>. You&apos;ll need to share your login credentials securely. All credentials are AES-256 encrypted.</p>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-surface-300 space-y-5">
                        <div className="text-center mb-2">
                            <div className="text-5xl mb-3">{serviceTab === "suggestions" ? "📋" : "✨"}</div>
                            <p className="text-sm text-surface-600">
                                {serviceTab === "suggestions"
                                    ? "Get a professional review document with specific improvements to make."
                                    : "Our experts will directly optimize your headline, summary, experience, and more."}
                            </p>
                        </div>
                        <div>
                            <label className="block text-xs text-surface-600 mb-1.5">LinkedIn Profile URL *</label>
                            <input
                                type="url"
                                required
                                placeholder="https://linkedin.com/in/your-profile"
                                value={linkedinUrl}
                                onChange={e => setLinkedinUrl(e.target.value)}
                                className="w-full px-4 py-3 bg-surface-100 border border-surface-300 rounded-xl text-surface-950 text-sm placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-300"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-surface-600 mb-1.5">Additional Notes (optional)</label>
                            <textarea
                                placeholder="Any specific areas you'd like us to focus on..."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 bg-surface-100 border border-surface-300 rounded-xl text-surface-950 text-sm placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
                            />
                        </div>

                        {/* Done-For-You: Credentials */}
                        {serviceTab === "done_for_you" && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4 border-t border-surface-200 pt-4"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm">🔐</span>
                                    <h4 className="text-sm font-semibold text-surface-900">LinkedIn Login Credentials</h4>
                                </div>
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                                    <p className="text-xs text-amber-700">
                                        🔒 <strong>Encrypted with AES-256.</strong> Never shared with AI models or logged. Only used by our team to make changes to your profile directly.
                                    </p>
                                </div>
                                <div className="grid sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs text-surface-600 mb-1">LinkedIn Email *</label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="you@email.com"
                                            value={loginEmail}
                                            onChange={e => setLoginEmail(e.target.value)}
                                            className="w-full px-4 py-3 bg-surface-100 border border-surface-300 rounded-xl text-surface-950 text-sm placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-surface-600 mb-1">LinkedIn Password *</label>
                                        <input
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            value={loginPassword}
                                            onChange={e => setLoginPassword(e.target.value)}
                                            className="w-full px-4 py-3 bg-surface-100 border border-surface-300 rounded-xl text-surface-950 text-sm placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-surface-600 mb-1">Phone (for 2FA)</label>
                                        <input
                                            type="tel"
                                            placeholder="+1 234 567 8900"
                                            value={loginPhone}
                                            onChange={e => setLoginPhone(e.target.value)}
                                            className="w-full px-4 py-3 bg-surface-100 border border-surface-300 rounded-xl text-surface-950 text-sm placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-300"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {msg && (
                            <p className={`text-sm p-3 rounded-xl ${msg.includes("success") || msg.includes("submitted") ? "bg-green-50 text-accent-green" : "bg-red-50 text-accent-red"}`}>
                                {msg}
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`w-full py-3 text-sm font-bold text-surface-950 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 ${serviceTab === "done_for_you"
                                    ? "bg-gradient-to-r from-violet-500 to-violet-600 hover:shadow-violet-500/15"
                                    : "bg-gradient-to-r from-primary-500 to-primary-600 hover:shadow-primary-500/15"
                                }`}
                        >
                            {submitting
                                ? "Submitting..."
                                : serviceTab === "done_for_you"
                                    ? "Submit Done-For-You Request"
                                    : "Request Enhancement Suggestions"}
                        </button>
                    </form>
                </div>
            )}
        </motion.div>
    );
}
