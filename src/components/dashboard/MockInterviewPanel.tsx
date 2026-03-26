"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

function getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
}

interface MockInterviewReq {
    _id: string;
    status: string;
    preferredSlot1: string;
    preferredSlot2: string;
    preferredSlot3: string;
    timezone: string;
    interviewType: string;
    notes?: string;
    confirmedSlot?: string;
    createdAt: string;
}

export default function MockInterviewPanel() {
    const [request, setRequest] = useState<MockInterviewReq | null>(null);
    const [form, setForm] = useState({
        preferredSlot1: "",
        preferredSlot2: "",
        preferredSlot3: "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        interviewType: "behavioral",
        notes: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchRequest = useCallback(async () => {
        try {
            const res = await fetch("/api/mock-interview", { headers: getAuthHeaders() });
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
            const res = await fetch("/api/mock-interview", {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(form),
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
            <h2 className="text-xl font-bold text-surface-950 mb-6">🎤 AI Mock Interview</h2>
            {request ? (
                <div className="bg-white rounded-2xl p-8 border border-green-200 text-center">
                    <div className="text-4xl mb-3">✅</div>
                    <h3 className="text-lg font-bold text-surface-950 mb-2">Request Submitted</h3>
                    <p className="text-surface-600 mb-4">
                        {request.status === "confirmed" ? (
                            <>Your mock interview has been confirmed for <strong className="text-surface-950">{new Date(request.confirmedSlot || "").toLocaleString()}</strong>.</>
                        ) : (
                            "We are reviewing your time slots. We'll confirm and reach out soon via email or the help desk."
                        )}
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-100 border border-surface-300 mb-4">
                        <span className={`w-2 h-2 rounded-full ${request.status === "confirmed" ? "bg-primary-500" : request.status === "completed" ? "bg-accent-green" : "bg-yellow-400"}`} />
                        <span className="text-sm text-surface-600 capitalize">{request.status}</span>
                    </div>
                    <div className="text-xs text-surface-500 space-y-1 mt-4">
                        <p>Type: <span className="text-surface-700 capitalize">{request.interviewType}</span></p>
                        <p>Submitted: {new Date(request.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-surface-300 space-y-5">
                    <p className="text-sm text-surface-600">
                        Schedule a mock interview session with our AI-powered interviewer. Choose your interview type and provide 3 preferred time slots.
                    </p>

                    {/* Interview Type */}
                    <div>
                        <label className="block text-xs text-surface-600 mb-1.5">Interview Type *</label>
                        <select
                            required
                            value={form.interviewType}
                            onChange={e => setForm(prev => ({ ...prev, interviewType: e.target.value }))}
                            className="w-full px-4 py-3 bg-surface-100 border border-surface-300 rounded-xl text-surface-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                        >
                            <option value="behavioral">🗣️ Behavioral Interview</option>
                            <option value="technical">💻 Technical Interview</option>
                            <option value="system-design">🏗️ System Design Interview</option>
                            <option value="case-study">📊 Case Study Interview</option>
                            <option value="general">🎯 General / Mixed</option>
                        </select>
                    </div>

                    {/* Time Slots */}
                    {["preferredSlot1", "preferredSlot2", "preferredSlot3"].map((key, i) => (
                        <div key={key}>
                            <label className="block text-xs text-surface-600 mb-1.5">
                                Preferred Time Slot {i + 1} *
                            </label>
                            <input
                                type="datetime-local"
                                required
                                value={(form as Record<string, string>)[key]}
                                onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                                className="w-full px-4 py-3 bg-surface-100 border border-surface-300 rounded-xl text-surface-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                            />
                        </div>
                    ))}

                    {/* Timezone */}
                    <div>
                        <label className="block text-xs text-surface-600 mb-1.5">Time Zone *</label>
                        <select
                            required
                            value={form.timezone}
                            onChange={e => setForm(prev => ({ ...prev, timezone: e.target.value }))}
                            className="w-full px-4 py-3 bg-surface-100 border border-surface-300 rounded-xl text-surface-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                        >
                            {["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Anchorage", "Pacific/Honolulu", "Asia/Kolkata", "Europe/London", "UTC"].map(tz =>
                                <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
                            )}
                        </select>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs text-surface-600 mb-1.5">Notes (optional)</label>
                        <textarea
                            value={form.notes}
                            onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Any specific topics you'd like to focus on?"
                            rows={3}
                            className="w-full px-4 py-3 bg-surface-100 border border-surface-300 rounded-xl text-surface-950 text-sm placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
                        />
                    </div>

                    {msg && (
                        <p className={`text-sm p-3 rounded-xl ${msg.includes("success") ? "bg-green-50 text-accent-green" : "bg-red-50 text-accent-red"}`}>
                            {msg}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 text-sm font-bold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:shadow-lg hover:shadow-primary-500/15 transition-all disabled:opacity-50"
                    >
                        {submitting ? "Submitting..." : "🎤 Request Mock Interview"}
                    </button>
                </form>
            )}
        </motion.div>
    );
}
