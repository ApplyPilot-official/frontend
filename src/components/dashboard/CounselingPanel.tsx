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

interface CounselingReq {
    _id: string;
    status: string;
    preferredTime1: string;
    preferredTime2: string;
    preferredTime3: string;
    timezone: string;
    createdAt: string;
}

export default function CounselingPanel() {
    const [request, setRequest] = useState<CounselingReq | null>(null);
    const [form, setForm] = useState({
        preferredTime1: "",
        preferredTime2: "",
        preferredTime3: "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchRequest = useCallback(async () => {
        try {
            const res = await fetch("/api/counseling", { headers: getAuthHeaders() });
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
            const res = await fetch("/api/counseling", {
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
            <h2 className="text-xl font-bold text-white mb-6">🎓 Career Counseling</h2>
            {request ? (
                <div className="bg-dark-400 rounded-2xl p-8 border border-neon-emerald/20 text-center">
                    <div className="text-4xl mb-3">✅</div>
                    <h3 className="text-lg font-bold text-white mb-2">Request Submitted</h3>
                    <p className="text-slate-400 mb-4">
                        We are processing your request. Our team will reach out via email or the help desk.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-300 border border-dark-50/20">
                        <span className={`w-2 h-2 rounded-full ${request.status === "scheduled" ? "bg-neon-blue" : request.status === "completed" ? "bg-neon-emerald" : "bg-yellow-400"}`} />
                        <span className="text-sm text-slate-300 capitalize">{request.status}</span>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="bg-dark-400 rounded-2xl p-6 border border-dark-50/20 space-y-5">
                    <p className="text-sm text-slate-400">
                        Request a one-on-one career counseling session. Provide 3 preferred time slots.
                    </p>
                    {["preferredTime1", "preferredTime2", "preferredTime3"].map((key, i) => (
                        <div key={key}>
                            <label className="block text-xs text-slate-400 mb-1.5">
                                Preferred Time Slot {i + 1} *
                            </label>
                            <input
                                type="datetime-local"
                                required
                                value={(form as Record<string, string>)[key]}
                                onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                                className="w-full px-4 py-3 bg-dark-600 border border-dark-50/30 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 [color-scheme:dark]"
                            />
                        </div>
                    ))}
                    <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Time Zone *</label>
                        <select
                            required
                            value={form.timezone}
                            onChange={e => setForm(prev => ({ ...prev, timezone: e.target.value }))}
                            className="w-full px-4 py-3 bg-dark-600 border border-dark-50/30 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                        >
                            {["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Anchorage", "Pacific/Honolulu", "Asia/Kolkata", "Europe/London", "UTC"].map(tz =>
                                <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
                            )}
                        </select>
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
                        {submitting ? "Submitting..." : "Request Career Counseling"}
                    </button>
                </form>
            )}
        </motion.div>
    );
}
