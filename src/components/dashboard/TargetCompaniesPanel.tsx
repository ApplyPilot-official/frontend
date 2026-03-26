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

interface TargetItem {
    _id: string;
    type: "company" | "role";
    name: string;
    status: string;
    createdAt: string;
}

export default function TargetCompaniesPanel() {
    const [targets, setTargets] = useState<TargetItem[]>([]);
    const [companyInput, setCompanyInput] = useState("");
    const [roleInput, setRoleInput] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchTargets = useCallback(async () => {
        try {
            const res = await fetch("/api/target-applications", { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setTargets(data.targets || []);
            }
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchTargets(); }, [fetchTargets]);

    const submitTarget = async (type: "company" | "role", name: string) => {
        if (!name.trim() || submitting) return;
        setSubmitting(true); setMsg("");
        try {
            const res = await fetch("/api/target-applications", {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({ type, name }),
            });
            const data = await res.json();
            if (res.ok) {
                setMsg(data.message);
                setTargets(prev => [data.target, ...prev]);
                if (type === "company") setCompanyInput("");
                else setRoleInput("");
            } else {
                setMsg(data.error || "Failed");
            }
        } catch { setMsg("Network error"); }
        finally { setSubmitting(false); setTimeout(() => setMsg(""), 4000); }
    };

    const removeTarget = async (id: string) => {
        try {
            await fetch("/api/target-applications", {
                method: "DELETE",
                headers: getAuthHeaders(),
                body: JSON.stringify({ targetId: id }),
            });
            setTargets(prev => prev.filter(t => t._id !== id));
        } catch { /* ignore */ }
    };

    const companies = targets.filter(t => t.type === "company");
    const roles = targets.filter(t => t.type === "role");

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
            approved: "bg-green-50 text-accent-green border-green-200",
            applied: "bg-primary-50 text-primary-500 border-primary-200",
            not_available: "bg-red-50 text-accent-red border-red-500/20",
        };
        return (
            <span className={`px-2 py-0.5 text-[10px] font-medium border rounded-full capitalize ${styles[status] || styles.pending}`}>
                {status.replace("_", " ")}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-xl font-bold text-surface-950">🏢 Target Companies & Roles</h2>

            {msg && (
                <p className={`text-sm p-3 rounded-xl ${msg.includes("auto-approved") || msg.includes("approved") || msg.includes("added") ? "bg-green-50 text-accent-green" : msg.includes("error") || msg.includes("already") ? "bg-red-50 text-accent-red" : "bg-primary-50 text-primary-500"}`}>
                    {msg}
                </p>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Target Companies */}
                <div className="bg-white rounded-2xl border border-surface-300 p-5">
                    <h3 className="text-sm font-bold text-surface-950 mb-3">🏢 Target Companies</h3>
                    <p className="text-xs text-surface-500 mb-4">Add companies you&apos;d like us to specifically apply to. Admin will update status once applied.</p>
                    <div className="flex gap-2 mb-4">
                        <input
                            value={companyInput}
                            onChange={e => setCompanyInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && submitTarget("company", companyInput)}
                            placeholder="e.g. Google, Microsoft..."
                            className="flex-1 px-4 py-2.5 bg-surface-100 border border-surface-300 rounded-xl text-surface-950 text-sm placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-300"
                        />
                        <button
                            onClick={() => submitTarget("company", companyInput)}
                            disabled={submitting || !companyInput.trim()}
                            className="px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl text-surface-950 text-sm font-medium disabled:opacity-50 hover:shadow-lg transition-all"
                        >
                            Add
                        </button>
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {companies.length === 0 && <p className="text-xs text-surface-500 text-center py-4">No companies added yet</p>}
                        {companies.map(c => (
                            <div key={c._id} className="flex items-center justify-between px-3 py-2.5 bg-surface-100 rounded-xl border border-surface-200">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-surface-950">{c.name}</span>
                                    {statusBadge(c.status)}
                                </div>
                                <button onClick={() => removeTarget(c._id)} className="text-surface-500 hover:text-accent-red text-xs transition-colors">✕</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Target Roles */}
                <div className="bg-white rounded-2xl border border-surface-300 p-5">
                    <h3 className="text-sm font-bold text-surface-950 mb-3">💼 Target Roles</h3>
                    <p className="text-xs text-surface-500 mb-4">Add roles you&apos;re interested in. These are auto-approved and our AI will prioritize matching jobs.</p>
                    <div className="flex gap-2 mb-4">
                        <input
                            value={roleInput}
                            onChange={e => setRoleInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && submitTarget("role", roleInput)}
                            placeholder="e.g. Software Engineer, Data Analyst..."
                            className="flex-1 px-4 py-2.5 bg-surface-100 border border-surface-300 rounded-xl text-surface-950 text-sm placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-300"
                        />
                        <button
                            onClick={() => submitTarget("role", roleInput)}
                            disabled={submitting || !roleInput.trim()}
                            className="px-4 py-2.5 bg-gradient-to-r from-accent-green to-primary-500 rounded-xl text-surface-950 text-sm font-medium disabled:opacity-50 hover:shadow-lg transition-all"
                        >
                            Add
                        </button>
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {roles.length === 0 && <p className="text-xs text-surface-500 text-center py-4">No roles added yet</p>}
                        {roles.map(r => (
                            <div key={r._id} className="flex items-center justify-between px-3 py-2.5 bg-surface-100 rounded-xl border border-surface-200">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-surface-950">{r.name}</span>
                                    {statusBadge(r.status)}
                                </div>
                                <button onClick={() => removeTarget(r._id)} className="text-surface-500 hover:text-accent-red text-xs transition-colors">✕</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
