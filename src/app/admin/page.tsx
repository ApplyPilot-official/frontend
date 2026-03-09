"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface UserRecord {
    _id: string;
    email: string;
    name: string;
    role: string;
    subscriptionPlan: string;
    provider: string;
    isEmailVerified: boolean;
    createdAt: string;
}

interface CouponRecord {
    _id: string;
    code: string;
    discountAmountCents: number;
    type: string;
    maxUses: number;
    usedCount: number;
    usedBy: string[];
    referralConversions: { userEmail: string; plan: string; convertedAt: string }[];
    isActive: boolean;
    expiresAt?: string;
    generationType: string;
    createdAt: string;
}

interface StatsData {
    totalRevenue: number;
    totalPayments: number;
    planCounts: Record<string, number>;
}

type AdminTab = "users" | "coupons" | "stats" | "counseling" | "helpdesk" | "portfolio" | "linkedin" | "profiles" | "targets";

interface CounselingRecord { _id: string; userEmail: string; preferredTime1: string; preferredTime2: string; preferredTime3: string; timezone: string; status: string; createdAt: string; }
interface HelpConvo { _id: string; userEmail: string; lastMessage: string; lastMessageAt: string; lastSenderType: string; totalMessages: number; unreadCount: number; }
interface HelpMsg { _id: string; senderType: string; messageText: string; attachmentUrl?: string; createdAt: string; }
interface PortfolioRecord { _id: string; userEmail: string; status: string; portfolioLink?: string; createdAt: string; }
interface LinkedInRecord { _id: string; userEmail: string; linkedinUrl: string; notes?: string; status: string; deliverableUrl?: string; createdAt: string; }
interface ProfileRecord { _id: string; userEmail: string; userName: string; resumeFileName?: string; processingStatus: string; createdAt: string; updatedAt: string; }
interface TargetRecord { _id: string; userEmail: string; type: string; name: string; status: string; createdAt: string; }

export default function AdminPage() {
    const { data: session, status } = useSession();
    const [activeTab, setActiveTab] = useState<AdminTab>("users");
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [coupons, setCoupons] = useState<CouponRecord[]>([]);
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionMsg, setActionMsg] = useState("");

    // Coupon creation form
    const [newCoupon, setNewCoupon] = useState({
        code: "",
        discountAmountCents: 500,
        type: "referral" as "single-use" | "referral",
        generationType: "custom" as "email" | "username" | "custom",
        expiresAt: "",
    });

    // New feature states
    const [counselingReqs, setCounselingReqs] = useState<CounselingRecord[]>([]);
    const [helpConvos, setHelpConvos] = useState<HelpConvo[]>([]);
    const [activeConvo, setActiveConvo] = useState<string | null>(null);
    const [convoMsgs, setConvoMsgs] = useState<HelpMsg[]>([]);
    const [adminReply, setAdminReply] = useState("");
    const [portfolioReqs, setPortfolioReqs] = useState<PortfolioRecord[]>([]);
    const [linkedinReqs, setLinkedinReqs] = useState<LinkedInRecord[]>([]);
    const [profileRecords, setProfileRecords] = useState<ProfileRecord[]>([]);
    const [targetApps, setTargetApps] = useState<TargetRecord[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [usersRes, couponsRes, statsRes] = await Promise.all([
                fetch("/api/admin/users"),
                fetch("/api/coupon/generate"),
                fetch("/api/admin/stats"),
            ]);

            if (usersRes.ok) setUsers((await usersRes.json()).users || []);
            if (couponsRes.ok) setCoupons((await couponsRes.json()).coupons || []);
            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData.stats);
            }
            // Fetch new feature data
            const [counselRes, helpRes, portRes, linkedinRes, profilesRes] = await Promise.all([
                fetch("/api/counseling?admin=true"),
                fetch("/api/helpdesk/admin"),
                fetch("/api/portfolio?admin=true"),
                fetch("/api/linkedin-makeover?admin=true"),
                fetch("/api/admin/profiles"),
            ]);
            if (counselRes.ok) setCounselingReqs((await counselRes.json()).requests || []);
            if (helpRes.ok) setHelpConvos((await helpRes.json()).conversations || []);
            if (portRes.ok) setPortfolioReqs((await portRes.json()).requests || []);
            if (linkedinRes.ok) setLinkedinReqs((await linkedinRes.json()).requests || []);
            if (profilesRes.ok) setProfileRecords((await profilesRes.json()).profiles || []);
            const targetsRes = await fetch("/api/target-applications?admin=true");
            if (targetsRes.ok) setTargetApps((await targetsRes.json()).targets || []);
        } catch (err) {
            console.error("Admin fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Hooks must be called before any conditional returns (React rules of hooks)
    const [roleChecked, setRoleChecked] = useState(false);

    useEffect(() => {
        if (status === "loading" || !session?.user?.email) return;
        fetch(`/api/user/status?email=${encodeURIComponent(session.user.email)}`)
            .then(r => r.json())
            .then(data => {
                if (data.role !== 'admin') {
                    redirect('/dashboard');
                }
                setRoleChecked(true);
            })
            .catch(() => redirect('/dashboard'));
    }, [session?.user?.email, status]);

    if (status === "loading" || !roleChecked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-700">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!session) redirect("/login");

    const handleChangeSubscription = async (userId: string, plan: string) => {
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, action: "changeSubscription", value: plan }),
            });
            if (res.ok) {
                setActionMsg("Subscription updated!");
                fetchData();
                setTimeout(() => setActionMsg(""), 3000);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionMsg("");
        try {
            const res = await fetch("/api/coupon/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCoupon),
            });
            const data = await res.json();
            if (res.ok) {
                setActionMsg(`Coupon ${data.coupon.code} created!`);
                setNewCoupon({ code: "", discountAmountCents: 500, type: "referral", generationType: "custom", expiresAt: "" });
                fetchData();
                setTimeout(() => setActionMsg(""), 3000);
            } else {
                setActionMsg(`Error: ${data.error}`);
            }
        } catch {
            setActionMsg("Failed to create coupon");
        }
    };

    const tabs: { id: AdminTab; label: string; icon: string }[] = [
        { id: "users", label: "Users", icon: "👥" },
        { id: "coupons", label: "Coupons & Referrals", icon: "🎟️" },
        { id: "stats", label: "Revenue", icon: "💰" },
        { id: "counseling", label: "Counseling", icon: "🎓" },
        { id: "helpdesk", label: "Help Desk", icon: "🎫" },
        { id: "portfolio", label: "Portfolio", icon: "🌐" },
        { id: "linkedin", label: "LinkedIn", icon: "💎" },
        { id: "profiles", label: "Profiles", icon: "📄" },
        { id: "targets", label: "Targets", icon: "🎯" },
    ];

    const updateCounselingStatus = async (id: string, status: string) => {
        try {
            await fetch(`/api/counseling/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
            setCounselingReqs(prev => prev.map(r => r._id === id ? { ...r, status } : r));
            setActionMsg("Counseling status updated");
            setTimeout(() => setActionMsg(""), 3000);
        } catch { setActionMsg("Error updating status"); }
    };

    const openConvo = async (userId: string) => {
        setActiveConvo(userId);
        try {
            const res = await fetch("/api/helpdesk/admin", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
            if (res.ok) {
                const data = await res.json();
                setConvoMsgs(data.messages || []);
                // Update unread count in the list
                setHelpConvos(prev => prev.map(c => c._id === userId ? { ...c, unreadCount: 0 } : c));
            }
        } catch { /* ignore */ }
    };

    const sendAdminReply = async () => {
        if (!adminReply.trim() || !activeConvo) return;
        try {
            const res = await fetch("/api/helpdesk/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: activeConvo, messageText: adminReply }) });
            if (res.ok) {
                const { message } = await res.json();
                setConvoMsgs(prev => [...prev, message]);
                setAdminReply("");
            }
        } catch { /* ignore */ }
    };

    const updatePortfolioStatus = async (id: string, status: string, portfolioLink?: string) => {
        try {
            const body: Record<string, string> = { status };
            if (portfolioLink !== undefined) body.portfolioLink = portfolioLink;
            await fetch(`/api/portfolio/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            setPortfolioReqs(prev => prev.map(r => r._id === id ? { ...r, status, ...(portfolioLink !== undefined ? { portfolioLink } : {}) } : r));
            setActionMsg("Portfolio updated");
            setTimeout(() => setActionMsg(""), 3000);
        } catch { setActionMsg("Error updating portfolio"); }
    };

    const updateLinkedInStatus = async (id: string, status: string, deliverableUrl?: string) => {
        try {
            const body: Record<string, string> = { status };
            if (deliverableUrl !== undefined) body.deliverableUrl = deliverableUrl;
            await fetch(`/api/linkedin-makeover/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            setLinkedinReqs(prev => prev.map(r => r._id === id ? { ...r, status, ...(deliverableUrl !== undefined ? { deliverableUrl } : {}) } : r));
            setActionMsg("LinkedIn request updated");
            setTimeout(() => setActionMsg(""), 3000);
        } catch { setActionMsg("Error updating LinkedIn request"); }
    };

    const updateProfileStatus = async (profileId: string, processingStatus: string) => {
        try {
            await fetch("/api/admin/profiles", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profileId, processingStatus }) });
            setProfileRecords(prev => prev.map(p => p._id === profileId ? { ...p, processingStatus } : p));
            setActionMsg("Profile status updated");
            setTimeout(() => setActionMsg(""), 3000);
        } catch { setActionMsg("Error updating profile"); }
    };

    const updateTargetStatus = async (id: string, status: string) => {
        try {
            await fetch(`/api/target-applications/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
            setTargetApps(prev => prev.map(t => t._id === id ? { ...t, status } : t));
            setActionMsg("Target status updated");
            setTimeout(() => setActionMsg(""), 3000);
        } catch { setActionMsg("Error updating target"); }
    };

    return (
        <div className="min-h-screen bg-dark-700 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-2xl font-bold text-white mb-1">Admin Portal</h1>
                    <p className="text-sm text-slate-400 mb-6">Manage users, coupons, and view revenue</p>
                </motion.div>

                {/* Action message */}
                <AnimatePresence>
                    {actionMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`mb-4 p-3 rounded-xl text-sm ${actionMsg.startsWith("Error")
                                ? "bg-red-500/10 border border-red-500/20 text-red-400"
                                : "bg-neon-emerald/10 border border-neon-emerald/20 text-neon-emerald"
                                }`}
                        >
                            {actionMsg}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                                ? "bg-primary-500/10 text-primary-400 border border-primary-500/30"
                                : "text-slate-400 hover:text-white hover:bg-dark-400"
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Users Tab */}
                        {activeTab === "users" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="bg-dark-400 rounded-2xl border border-dark-50/20 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-dark-50/20">
                                                    <th className="text-left p-4 text-slate-400 font-medium">User</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">Provider</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">Plan</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">Role</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">Joined</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map((u) => (
                                                    <tr key={u._id} className="border-b border-dark-50/10 hover:bg-dark-300/50">
                                                        <td className="p-4">
                                                            <div>
                                                                <p className="text-white font-medium">{u.name}</p>
                                                                <p className="text-xs text-slate-500">{u.email}</p>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`text-xs px-2 py-1 rounded-full ${u.provider === "google"
                                                                ? "bg-blue-500/10 text-blue-400"
                                                                : "bg-slate-500/10 text-slate-400"
                                                                }`}>
                                                                {u.provider}
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            <select
                                                                value={u.subscriptionPlan}
                                                                onChange={(e) => handleChangeSubscription(u._id, e.target.value)}
                                                                className="px-2 py-1 bg-dark-600 border border-dark-50/30 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                            >
                                                                <option value="none">None</option>
                                                                <option value="basic">Basic</option>
                                                                <option value="pro">Pro</option>
                                                                <option value="elite">Elite</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`text-xs px-2 py-1 rounded-full ${u.role === "admin"
                                                                ? "bg-neon-violet/10 text-neon-violet"
                                                                : "bg-slate-500/10 text-slate-400"
                                                                }`}>
                                                                {u.role}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-xs text-slate-500">
                                                            {new Date(u.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`text-xs ${u.isEmailVerified ? "text-neon-emerald" : "text-yellow-400"}`}>
                                                                {u.isEmailVerified ? "✓ Verified" : "⏳ Pending"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {users.length === 0 && (
                                                    <tr>
                                                        <td colSpan={6} className="p-8 text-center text-slate-500">
                                                            No users found
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Coupons Tab */}
                        {activeTab === "coupons" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                {/* Create Coupon Form */}
                                <div className="bg-dark-400 rounded-2xl p-6 border border-dark-50/20">
                                    <h3 className="text-lg font-bold text-white mb-4">Create Coupon / Referral Code</h3>
                                    <form onSubmit={handleCreateCoupon} className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Code</label>
                                            <input
                                                type="text"
                                                value={newCoupon.code}
                                                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                                required
                                                placeholder="e.g. JOHN-REF or WELCOME"
                                                className="w-full px-3 py-2.5 bg-dark-600 border border-dark-50/30 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 uppercase"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Discount (max $5.00)</label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white text-sm">$</span>
                                                <input
                                                    type="number"
                                                    min={0.01}
                                                    max={5}
                                                    step={0.01}
                                                    value={newCoupon.discountAmountCents / 100}
                                                    onChange={(e) =>
                                                        setNewCoupon({
                                                            ...newCoupon,
                                                            discountAmountCents: Math.min(Math.round(parseFloat(e.target.value) * 100), 500),
                                                        })
                                                    }
                                                    className="flex-1 px-3 py-2.5 bg-dark-600 border border-dark-50/30 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Type</label>
                                            <select
                                                value={newCoupon.type}
                                                onChange={(e) =>
                                                    setNewCoupon({ ...newCoupon, type: e.target.value as "single-use" | "referral" })
                                                }
                                                className="w-full px-3 py-2.5 bg-dark-600 border border-dark-50/30 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                            >
                                                <option value="referral">♻️ Referral (reusable by different users)</option>
                                                <option value="single-use">🔒 Single-use</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Generated From</label>
                                            <select
                                                value={newCoupon.generationType}
                                                onChange={(e) =>
                                                    setNewCoupon({ ...newCoupon, generationType: e.target.value as "email" | "username" | "custom" })
                                                }
                                                className="w-full px-3 py-2.5 bg-dark-600 border border-dark-50/30 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                            >
                                                <option value="email">📧 From email name</option>
                                                <option value="username">👤 From username</option>
                                                <option value="custom">✏️ Custom</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Expires (optional)</label>
                                            <input
                                                type="date"
                                                value={newCoupon.expiresAt}
                                                onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                                                className="w-full px-3 py-2.5 bg-dark-600 border border-dark-50/30 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                type="submit"
                                                className="w-full py-2.5 text-sm font-bold text-white bg-gradient-to-r from-neon-blue to-primary-500 rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                                            >
                                                Create Coupon
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Coupons List */}
                                <div className="bg-dark-400 rounded-2xl border border-dark-50/20 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-dark-50/20">
                                                    <th className="text-left p-4 text-slate-400 font-medium">Code</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">Type</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">Discount</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">Used</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">Referrals</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {coupons.map((c) => (
                                                    <tr key={c._id} className="border-b border-dark-50/10 hover:bg-dark-300/50">
                                                        <td className="p-4">
                                                            <code className="text-primary-400 font-mono text-sm bg-primary-500/10 px-2 py-0.5 rounded">
                                                                {c.code}
                                                            </code>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`text-xs px-2 py-1 rounded-full ${c.type === "referral"
                                                                ? "bg-neon-violet/10 text-neon-violet"
                                                                : "bg-slate-500/10 text-slate-400"
                                                                }`}>
                                                                {c.type === "referral" ? "♻️ Referral" : "🔒 Single-use"}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-white">
                                                            ${(c.discountAmountCents / 100).toFixed(2)}
                                                        </td>
                                                        <td className="p-4 text-white">
                                                            {c.usedCount}{c.type === "single-use" ? `/${c.maxUses}` : ""}
                                                        </td>
                                                        <td className="p-4">
                                                            {c.referralConversions && c.referralConversions.length > 0 ? (
                                                                <div className="space-y-1">
                                                                    {c.referralConversions.slice(0, 3).map((r, i) => (
                                                                        <p key={i} className="text-xs text-slate-400">
                                                                            {r.userEmail} → <span className="text-neon-emerald">{r.plan}</span>
                                                                        </p>
                                                                    ))}
                                                                    {c.referralConversions.length > 3 && (
                                                                        <p className="text-xs text-slate-500">
                                                                            +{c.referralConversions.length - 3} more
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-slate-500">—</span>
                                                            )}
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`text-xs ${c.isActive ? "text-neon-emerald" : "text-red-400"}`}>
                                                                {c.isActive ? "Active" : "Inactive"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {coupons.length === 0 && (
                                                    <tr>
                                                        <td colSpan={6} className="p-8 text-center text-slate-500">
                                                            No coupons created yet
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Stats Tab */}
                        {activeTab === "stats" && stats && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-dark-400 rounded-2xl p-6 border border-dark-50/20">
                                        <p className="text-sm text-slate-400 mb-1">Total Revenue</p>
                                        <p className="text-3xl font-bold text-white">
                                            ₹{(stats.totalRevenue / 100).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="bg-dark-400 rounded-2xl p-6 border border-dark-50/20">
                                        <p className="text-sm text-slate-400 mb-1">Total Payments</p>
                                        <p className="text-3xl font-bold text-white">{stats.totalPayments}</p>
                                    </div>
                                    <div className="bg-dark-400 rounded-2xl p-6 border border-dark-50/20">
                                        <p className="text-sm text-slate-400 mb-1">Plan Breakdown</p>
                                        <div className="space-y-1 mt-2">
                                            {Object.entries(stats.planCounts).map(([plan, count]) => (
                                                <div key={plan} className="flex justify-between text-sm">
                                                    <span className="text-slate-300 capitalize">{plan}</span>
                                                    <span className="text-white font-medium">{count}</span>
                                                </div>
                                            ))}
                                            {Object.keys(stats.planCounts).length === 0 && (
                                                <p className="text-xs text-slate-500">No payments yet</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Counseling Tab */}
                        {activeTab === "counseling" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="bg-dark-400 rounded-2xl border border-dark-50/20 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-dark-50/20">
                                                    <th className="text-left p-4 text-slate-400 font-medium">User</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">Time Slot 1</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">Time Slot 2</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">Time Slot 3</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">Timezone</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {counselingReqs.map(r => (
                                                    <tr key={r._id} className="border-b border-dark-50/10 hover:bg-dark-300/50">
                                                        <td className="p-4 text-white">{r.userEmail}</td>
                                                        <td className="p-4 text-slate-300 text-xs">{r.preferredTime1}</td>
                                                        <td className="p-4 text-slate-300 text-xs">{r.preferredTime2}</td>
                                                        <td className="p-4 text-slate-300 text-xs">{r.preferredTime3}</td>
                                                        <td className="p-4 text-slate-400 text-xs">{r.timezone}</td>
                                                        <td className="p-4">
                                                            <select value={r.status} onChange={e => updateCounselingStatus(r._id, e.target.value)} className="px-2 py-1 bg-dark-600 border border-dark-50/30 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50">
                                                                <option value="pending">Pending</option>
                                                                <option value="scheduled">Scheduled</option>
                                                                <option value="completed">Completed</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-4 text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                                {counselingReqs.length === 0 && (
                                                    <tr><td colSpan={7} className="p-8 text-center text-slate-500">No counseling requests yet</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Help Desk Tab */}
                        {activeTab === "helpdesk" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    {/* Conversations List */}
                                    <div className="bg-dark-400 rounded-2xl border border-dark-50/20 overflow-hidden">
                                        <div className="p-4 border-b border-dark-50/20">
                                            <h3 className="text-sm font-bold text-white">Conversations</h3>
                                        </div>
                                        <div className="max-h-[600px] overflow-y-auto">
                                            {helpConvos.map(c => (
                                                <button key={c._id} onClick={() => openConvo(c._id)} className={`w-full text-left p-4 border-b border-dark-50/10 transition-all ${activeConvo === c._id ? "bg-primary-500/10" : "hover:bg-dark-300/50"}`}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm text-white font-medium truncate">{c.userEmail}</span>
                                                        {c.unreadCount > 0 && (
                                                            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 ml-2">{c.unreadCount}</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500 truncate">{c.lastMessage}</p>
                                                    <p className="text-[10px] text-slate-600 mt-1">{new Date(c.lastMessageAt).toLocaleString()}</p>
                                                </button>
                                            ))}
                                            {helpConvos.length === 0 && <p className="p-4 text-sm text-slate-500">No conversations</p>}
                                        </div>
                                    </div>

                                    {/* Conversation Messages */}
                                    <div className="lg:col-span-2 bg-dark-400 rounded-2xl border border-dark-50/20 flex flex-col" style={{ height: "600px" }}>
                                        {activeConvo ? (
                                            <>
                                                <div className="p-4 border-b border-dark-50/20">
                                                    <h3 className="text-sm font-bold text-white">Chat with {helpConvos.find(c => c._id === activeConvo)?.userEmail}</h3>
                                                </div>
                                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                                    {convoMsgs.map(msg => (
                                                        <div key={msg._id} className={`flex ${msg.senderType === "admin" ? "justify-end" : "justify-start"}`}>
                                                            <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm ${msg.senderType === "admin" ? "bg-primary-500/20 text-primary-100 rounded-br-md" : "bg-dark-300 text-slate-200 rounded-bl-md"}`}>
                                                                <p className="whitespace-pre-wrap">{msg.messageText}</p>
                                                                {msg.attachmentUrl && <a href={msg.attachmentUrl} target="_blank" rel="noreferrer" className="text-xs text-neon-blue underline mt-1 block">📎 Attachment</a>}
                                                                <p className="text-[10px] text-slate-500 mt-1.5">{new Date(msg.createdAt).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="p-3 border-t border-dark-50/20">
                                                    <div className="flex gap-2">
                                                        <input value={adminReply} onChange={e => setAdminReply(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendAdminReply())} placeholder="Type reply..." className="flex-1 px-4 py-3 bg-dark-600 border border-dark-50/30 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                                                        <button onClick={sendAdminReply} disabled={!adminReply.trim()} className="px-5 py-3 bg-gradient-to-r from-neon-blue to-primary-500 rounded-xl text-white text-sm font-medium disabled:opacity-50 hover:shadow-lg transition-all">Reply</button>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex-1 flex items-center justify-center">
                                                <p className="text-slate-500">Select a conversation</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Portfolio Tab */}
                        {activeTab === "portfolio" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="bg-dark-400 rounded-2xl border border-dark-50/20 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-dark-50/20">
                                                    <th className="text-left p-4 text-slate-400 font-medium">User</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">Portfolio Link</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">Requested</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {portfolioReqs.map(r => (
                                                    <tr key={r._id} className="border-b border-dark-50/10 hover:bg-dark-300/50">
                                                        <td className="p-4 text-white">{r.userEmail}</td>
                                                        <td className="p-4">
                                                            <select value={r.status} onChange={e => updatePortfolioStatus(r._id, e.target.value)} className="px-2 py-1 bg-dark-600 border border-dark-50/30 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50">
                                                                <option value="pending">Pending</option>
                                                                <option value="in_progress">In Progress</option>
                                                                <option value="completed">Completed</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-2">
                                                                <input type="url" defaultValue={r.portfolioLink || ""} placeholder="https://..." onBlur={e => { if (e.target.value !== (r.portfolioLink || "")) updatePortfolioStatus(r._id, r.status, e.target.value); }} className="flex-1 px-2 py-1 bg-dark-600 border border-dark-50/30 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                                {portfolioReqs.length === 0 && (
                                                    <tr><td colSpan={4} className="p-8 text-center text-slate-500">No portfolio requests yet</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* LinkedIn Tab */}
                        {activeTab === "linkedin" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="bg-dark-400 rounded-2xl border border-dark-50/20 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-dark-50/20">
                                                    <th className="text-left p-4 text-slate-400 font-medium">User</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">LinkedIn URL</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">Notes</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">Deliverable</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {linkedinReqs.map(r => (
                                                    <tr key={r._id} className="border-b border-dark-50/10 hover:bg-dark-300/50">
                                                        <td className="p-4 text-white text-xs">{r.userEmail}</td>
                                                        <td className="p-4"><a href={r.linkedinUrl} target="_blank" rel="noreferrer" className="text-xs text-neon-blue underline truncate block max-w-[200px]">{r.linkedinUrl}</a></td>
                                                        <td className="p-4 text-slate-400 text-xs max-w-[200px] truncate">{r.notes || "—"}</td>
                                                        <td className="p-4">
                                                            <select value={r.status} onChange={e => updateLinkedInStatus(r._id, e.target.value)} className="px-2 py-1 bg-dark-600 border border-dark-50/30 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50">
                                                                <option value="pending">Pending</option>
                                                                <option value="in_progress">In Progress</option>
                                                                <option value="completed">Completed</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-4">
                                                            <input type="url" defaultValue={r.deliverableUrl || ""} placeholder="https://..." onBlur={e => { if (e.target.value !== (r.deliverableUrl || "")) updateLinkedInStatus(r._id, r.status, e.target.value); }} className="w-full px-2 py-1 bg-dark-600 border border-dark-50/30 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                                                        </td>
                                                        <td className="p-4 text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                                {linkedinReqs.length === 0 && (
                                                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">No LinkedIn makeover requests yet</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Profiles Tab */}
                        {activeTab === "profiles" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="bg-dark-400 rounded-2xl border border-dark-50/20 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-dark-50/20">
                                                    <th className="text-left p-4 text-slate-400 font-medium">User</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">Email</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">Resume</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">Last Updated</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {profileRecords.map(p => (
                                                    <tr key={p._id} className="border-b border-dark-50/10 hover:bg-dark-300/50">
                                                        <td className="p-4 text-white text-sm">{p.userName}</td>
                                                        <td className="p-4 text-slate-300 text-xs">{p.userEmail}</td>
                                                        <td className="p-4 text-slate-400 text-xs">{p.resumeFileName || "—"}</td>
                                                        <td className="p-4">
                                                            <select value={p.processingStatus} onChange={e => updateProfileStatus(p._id, e.target.value)} className={`px-2 py-1 border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${p.processingStatus === "approved" ? "bg-neon-emerald/10 border-neon-emerald/30 text-neon-emerald" :
                                                                    p.processingStatus === "complete" ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" :
                                                                        p.processingStatus === "failed" ? "bg-red-500/10 border-red-500/30 text-red-400" :
                                                                            p.processingStatus === "needs_input" ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" :
                                                                                "bg-dark-600 border-dark-50/30 text-white"
                                                                }`}>
                                                                <option value="uploaded">Uploaded</option>
                                                                <option value="processing">Processing</option>
                                                                <option value="needs_input">Needs Input</option>
                                                                <option value="complete">Complete (Pending Approval)</option>
                                                                <option value="approved">Approved ✓</option>
                                                                <option value="failed">Failed ✗</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-4 text-xs text-slate-500">{new Date(p.updatedAt).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                                {profileRecords.length === 0 && (
                                                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">No profiles yet</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Target Applications Tab */}
                        {activeTab === "targets" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="bg-dark-400 rounded-2xl border border-dark-50/20 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-dark-50/20">
                                                    <th className="text-left p-4 text-slate-400 font-medium">User</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">Type</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">Name</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                                                    <th className="text-left p-4 text-slate-400 font-medium">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {targetApps.map(t => (
                                                    <tr key={t._id} className="border-b border-dark-50/10 hover:bg-dark-300/50">
                                                        <td className="p-4 text-white text-xs">{t.userEmail}</td>
                                                        <td className="p-4">
                                                            <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${t.type === "company" ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/20" : "bg-primary-500/10 text-primary-300 border border-primary-500/20"}`}>
                                                                {t.type === "company" ? "🏢 Company" : "💼 Role"}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-white font-medium">{t.name}</td>
                                                        <td className="p-4">
                                                            <select value={t.status} onChange={e => updateTargetStatus(t._id, e.target.value)} className={`px-2 py-1 border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${t.status === "applied" ? "bg-neon-blue/10 border-neon-blue/30 text-neon-blue" :
                                                                t.status === "approved" ? "bg-neon-emerald/10 border-neon-emerald/30 text-neon-emerald" :
                                                                    t.status === "not_available" ? "bg-red-500/10 border-red-500/30 text-red-400" :
                                                                        "bg-dark-600 border-dark-50/30 text-white"
                                                                }`}>
                                                                <option value="pending">Pending</option>
                                                                <option value="approved">Approved</option>
                                                                <option value="applied">Applied ✓</option>
                                                                <option value="not_available">Not Available</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-4 text-xs text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                                {targetApps.length === 0 && (
                                                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">No target applications yet</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
