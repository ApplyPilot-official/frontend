"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DASHBOARD_FEATURES, PLAN_TIERS, getDefaultFeatureAccess, type FeatureAccessMap } from "@/lib/dashboardFeatures";

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

type AdminTab = "users" | "coupons" | "stats" | "counseling" | "helpdesk" | "portfolio" | "linkedin" | "profiles" | "targets" | "features" | "business" | "mock-interviews" | "abandoned";

interface AbandonedPaymentRecord { _id: string; userEmail: string; plan: string; amountCents: number; currency: string; couponCode?: string; couponDiscountCents?: number; createdAt: string; }

interface BusinessInterestRecord { _id: string; contactName: string; companyName: string; email: string; phone?: string; companySize: string; message?: string; status: string; adminNotes?: string; createdAt: string; }

interface MockInterviewRecord { _id: string; userEmail: string; preferredSlot1: string; preferredSlot2: string; preferredSlot3: string; timezone: string; interviewType: string; notes?: string; status: string; confirmedSlot?: string; createdAt: string; }

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
    const [featureAccessMap, setFeatureAccessMap] = useState<FeatureAccessMap>(getDefaultFeatureAccess());
    const [featureAccessSaving, setFeatureAccessSaving] = useState(false);
    const [businessInterests, setBusinessInterests] = useState<BusinessInterestRecord[]>([]);
    const [mockInterviewReqs, setMockInterviewReqs] = useState<MockInterviewRecord[]>([]);
    const [abandonedPayments, setAbandonedPayments] = useState<AbandonedPaymentRecord[]>([]);

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
            // Fetch feature access config
            const faRes = await fetch("/api/admin/feature-access");
            if (faRes.ok) {
                const faData = await faRes.json();
                if (faData.features) setFeatureAccessMap(faData.features);
            }
            // Fetch business interests
            const bizRes = await fetch("/api/business-interest");
            if (bizRes.ok) setBusinessInterests((await bizRes.json()).interests || []);
            // Fetch mock interview requests
            const mockRes = await fetch("/api/mock-interview?admin=true");
            if (mockRes.ok) setMockInterviewReqs((await mockRes.json()).requests || []);
            // Fetch abandoned payments
            const abandonedRes = await fetch("/api/admin/abandoned-payments");
            if (abandonedRes.ok) setAbandonedPayments((await abandonedRes.json()).payments || []);
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
            <div className="min-h-screen flex items-center justify-center bg-surface-100">
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
        { id: "features", label: "Feature Access", icon: "🔐" },
        { id: "counseling", label: "Counseling", icon: "🎓" },
        { id: "helpdesk", label: "Help Desk", icon: "🎫" },
        { id: "portfolio", label: "Portfolio", icon: "🌐" },
        { id: "linkedin", label: "LinkedIn", icon: "💎" },
        { id: "profiles", label: "Profiles", icon: "📄" },
        { id: "targets", label: "Targets", icon: "🎯" },
        { id: "business", label: "Business", icon: "🏢" },
        { id: "mock-interviews", label: "Mock Interviews", icon: "🎙️" },
        { id: "abandoned", label: "Abandoned Payments", icon: "💸" },
    ];

    const toggleFeatureAccess = (featureId: string, plan: string) => {
        setFeatureAccessMap(prev => ({
            ...prev,
            [featureId]: {
                ...prev[featureId],
                [plan]: !prev[featureId]?.[plan as keyof typeof prev[typeof featureId]],
            },
        }));
    };

    const saveFeatureAccess = async () => {
        setFeatureAccessSaving(true);
        try {
            const res = await fetch("/api/admin/feature-access", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ features: featureAccessMap }),
            });
            if (res.ok) {
                setActionMsg("Feature access saved!");
            } else {
                const data = await res.json();
                setActionMsg(`Error: ${data.error}`);
            }
            setTimeout(() => setActionMsg(""), 3000);
        } catch {
            setActionMsg("Error saving feature access");
        } finally {
            setFeatureAccessSaving(false);
        }
    };

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

    const updateBusinessInterest = async (id: string, status?: string, adminNotes?: string) => {
        try {
            const body: Record<string, string> = { id };
            if (status) body.status = status;
            if (adminNotes !== undefined) body.adminNotes = adminNotes;
            await fetch("/api/business-interest", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            setBusinessInterests(prev => prev.map(b => b._id === id ? { ...b, ...(status ? { status } : {}), ...(adminNotes !== undefined ? { adminNotes } : {}) } : b));
            setActionMsg("Business interest updated");
            setTimeout(() => setActionMsg(""), 3000);
        } catch { setActionMsg("Error updating business interest"); }
    };

    const updateMockInterview = async (id: string, status?: string, confirmedSlot?: string) => {
        try {
            const body: Record<string, string> = { id };
            if (status) body.status = status;
            if (confirmedSlot !== undefined) body.confirmedSlot = confirmedSlot;
            await fetch("/api/mock-interview", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            setMockInterviewReqs(prev => prev.map(r => r._id === id ? { ...r, ...(status ? { status } : {}), ...(confirmedSlot !== undefined ? { confirmedSlot } : {}) } : r));
            setActionMsg("Mock interview updated");
            setTimeout(() => setActionMsg(""), 3000);
        } catch { setActionMsg("Error updating mock interview"); }
    };

    return (
        <div className="min-h-screen bg-surface-100 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-2xl font-bold text-surface-950 mb-1">Admin Portal</h1>
                    <p className="text-sm text-surface-600 mb-6">Manage users, coupons, and view revenue</p>
                </motion.div>

                {/* Action message */}
                <AnimatePresence>
                    {actionMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`mb-4 p-3 rounded-xl text-sm ${actionMsg.startsWith("Error")
                                ? "bg-red-50 border border-red-500/20 text-red-400"
                                : "bg-green-50 border border-green-200 text-accent-green"
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
                                : "text-surface-600 hover:text-surface-950 hover:bg-white"
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
                                <div className="bg-white rounded-2xl border border-surface-300 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-surface-300">
                                                    <th className="text-left p-4 text-surface-600 font-medium">User</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Provider</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Plan</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Role</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Joined</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map((u) => (
                                                    <tr key={u._id} className="border-b border-surface-200 hover:bg-surface-100/50">
                                                        <td className="p-4">
                                                            <div>
                                                                <p className="text-surface-950 font-medium">{u.name}</p>
                                                                <p className="text-xs text-surface-500">{u.email}</p>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`text-xs px-2 py-1 rounded-full ${u.provider === "google"
                                                                ? "bg-blue-500/10 text-blue-400"
                                                                : "bg-surface-400/10 text-surface-600"
                                                                }`}>
                                                                {u.provider}
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            <select
                                                                value={u.subscriptionPlan}
                                                                onChange={(e) => handleChangeSubscription(u._id, e.target.value)}
                                                                className="px-2 py-1 bg-surface-100 border border-surface-300 rounded-lg text-xs text-grey focus:outline-none focus:ring-2 focus:ring-primary-300"
                                                            >
                                                                <option value="none">None</option>
                                                                <option value="basic">Basic</option>
                                                                <option value="pro">Pro</option>
                                                                <option value="elite">Elite</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`text-xs px-2 py-1 rounded-full ${u.role === "admin"
                                                                ? "bg-violet-50 text-violet-600"
                                                                : "bg-surface-400/10 text-surface-600"
                                                                }`}>
                                                                {u.role}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-xs text-surface-500">
                                                            {new Date(u.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`text-xs ${u.isEmailVerified ? "text-accent-green" : "text-yellow-400"}`}>
                                                                {u.isEmailVerified ? "✓ Verified" : "⏳ Pending"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {users.length === 0 && (
                                                    <tr>
                                                        <td colSpan={6} className="p-8 text-center text-surface-500">
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
                                <div className="bg-white rounded-2xl p-6 border border-surface-300">
                                    <h3 className="text-lg font-bold text-surface-950 mb-4">Create Coupon / Referral Code</h3>
                                    <form onSubmit={handleCreateCoupon} className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-surface-600 mb-1">Code</label>
                                            <input
                                                type="text"
                                                value={newCoupon.code}
                                                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                                required
                                                placeholder="e.g. JOHN-REF or WELCOME"
                                                className="w-full px-3 py-2.5 bg-surface-100 border border-surface-300 rounded-xl text-surface-950 placeholder-surface-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 uppercase"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-surface-600 mb-1">Discount (max $5.00)</label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-surface-950 text-sm">$</span>
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
                                                    className="flex-1 px-3 py-2.5 bg-surface-100 border border-surface-300 rounded-xl text-surface-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-surface-600 mb-1">Type</label>
                                            <select
                                                value={newCoupon.type}
                                                onChange={(e) =>
                                                    setNewCoupon({ ...newCoupon, type: e.target.value as "single-use" | "referral" })
                                                }
                                                className="w-full px-3 py-2.5 bg-surface-100 border border-surface-300 rounded-xl text-surface-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                                            >
                                                <option value="referral">♻️ Referral (reusable by different users)</option>
                                                <option value="single-use">🔒 Single-use</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-surface-600 mb-1">Generated From</label>
                                            <select
                                                value={newCoupon.generationType}
                                                onChange={(e) =>
                                                    setNewCoupon({ ...newCoupon, generationType: e.target.value as "email" | "username" | "custom" })
                                                }
                                                className="w-full px-3 py-2.5 bg-surface-100 border border-surface-300 rounded-xl text-surface-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                                            >
                                                <option value="email">📧 From email name</option>
                                                <option value="username">👤 From username</option>
                                                <option value="custom">✏️ Custom</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-surface-600 mb-1">Expires (optional)</label>
                                            <input
                                                type="date"
                                                value={newCoupon.expiresAt}
                                                onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                                                className="w-full px-3 py-2.5 bg-surface-100 border border-surface-300 rounded-xl text-surface-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                type="submit"
                                                className="w-full py-2.5 text-sm font-bold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                                            >
                                                Create Coupon
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Coupons List */}
                                <div className="bg-white rounded-2xl border border-surface-300 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-surface-300">
                                                    <th className="text-left p-4 text-surface-600 font-medium">Code</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Type</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Discount</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Used</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Referrals</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {coupons.map((c) => (
                                                    <tr key={c._id} className="border-b border-surface-200 hover:bg-surface-100/50">
                                                        <td className="p-4">
                                                            <code className="text-primary-400 font-mono text-sm bg-primary-500/10 px-2 py-0.5 rounded">
                                                                {c.code}
                                                            </code>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`text-xs px-2 py-1 rounded-full ${c.type === "referral"
                                                                ? "bg-violet-50 text-violet-600"
                                                                : "bg-surface-400/10 text-surface-600"
                                                                }`}>
                                                                {c.type === "referral" ? "♻️ Referral" : "🔒 Single-use"}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-surface-950">
                                                            ${(c.discountAmountCents / 100).toFixed(2)}
                                                        </td>
                                                        <td className="p-4 text-surface-950">
                                                            {c.usedCount}{c.type === "single-use" ? `/${c.maxUses}` : ""}
                                                        </td>
                                                        <td className="p-4">
                                                            {c.referralConversions && c.referralConversions.length > 0 ? (
                                                                <div className="space-y-1">
                                                                    {c.referralConversions.slice(0, 3).map((r, i) => (
                                                                        <p key={i} className="text-xs text-surface-600">
                                                                            {r.userEmail} → <span className="text-accent-green">{r.plan}</span>
                                                                        </p>
                                                                    ))}
                                                                    {c.referralConversions.length > 3 && (
                                                                        <p className="text-xs text-surface-500">
                                                                            +{c.referralConversions.length - 3} more
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-surface-500">—</span>
                                                            )}
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`text-xs ${c.isActive ? "text-accent-green" : "text-red-400"}`}>
                                                                {c.isActive ? "Active" : "Inactive"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {coupons.length === 0 && (
                                                    <tr>
                                                        <td colSpan={6} className="p-8 text-center text-surface-500">
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
                                    <div className="bg-white rounded-2xl p-6 border border-surface-300">
                                        <p className="text-sm text-surface-600 mb-1">Total Revenue</p>
                                        <p className="text-3xl font-bold text-surface-950">
                                            ${(stats.totalRevenue / 100).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-2xl p-6 border border-surface-300">
                                        <p className="text-sm text-surface-600 mb-1">Total Payments</p>
                                        <p className="text-3xl font-bold text-surface-950">{stats.totalPayments}</p>
                                    </div>
                                    <div className="bg-white rounded-2xl p-6 border border-surface-300">
                                        <p className="text-sm text-surface-600 mb-1">Plan Breakdown</p>
                                        <div className="space-y-1 mt-2">
                                            {Object.entries(stats.planCounts).map(([plan, count]) => (
                                                <div key={plan} className="flex justify-between text-sm">
                                                    <span className="text-surface-700 capitalize">{plan}</span>
                                                    <span className="text-surface-950 font-medium">{count}</span>
                                                </div>
                                            ))}
                                            {Object.keys(stats.planCounts).length === 0 && (
                                                <p className="text-xs text-surface-500">No payments yet</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Counseling Tab */}
                        {activeTab === "counseling" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="bg-white rounded-2xl border border-surface-300 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-surface-300">
                                                    <th className="text-left p-4 text-surface-600 font-medium">User</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Time Slot 1</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Time Slot 2</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Time Slot 3</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Timezone</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Status</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {counselingReqs.map(r => (
                                                    <tr key={r._id} className="border-b border-surface-200 hover:bg-surface-100/50">
                                                        <td className="p-4 text-surface-950">{r.userEmail}</td>
                                                        <td className="p-4 text-surface-700 text-xs">{r.preferredTime1}</td>
                                                        <td className="p-4 text-surface-700 text-xs">{r.preferredTime2}</td>
                                                        <td className="p-4 text-surface-700 text-xs">{r.preferredTime3}</td>
                                                        <td className="p-4 text-surface-600 text-xs">{r.timezone}</td>
                                                        <td className="p-4">
                                                            <select value={r.status} onChange={e => updateCounselingStatus(r._id, e.target.value)} className="px-2 py-1 bg-surface-100 border border-surface-300 rounded-lg text-xs text-surface-950 focus:outline-none focus:ring-2 focus:ring-primary-300">
                                                                <option value="pending">Pending</option>
                                                                <option value="scheduled">Scheduled</option>
                                                                <option value="completed">Completed</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-4 text-xs text-surface-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                                {counselingReqs.length === 0 && (
                                                    <tr><td colSpan={7} className="p-8 text-center text-surface-500">No counseling requests yet</td></tr>
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
                                    <div className="bg-white rounded-2xl border border-surface-300 overflow-hidden">
                                        <div className="p-4 border-b border-surface-300">
                                            <h3 className="text-sm font-bold text-surface-950">Conversations</h3>
                                        </div>
                                        <div className="max-h-[600px] overflow-y-auto">
                                            {helpConvos.map(c => (
                                                <button key={c._id} onClick={() => openConvo(c._id)} className={`w-full text-left p-4 border-b border-surface-200 transition-all ${activeConvo === c._id ? "bg-primary-500/10" : "hover:bg-surface-100/50"}`}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm text-surface-950 font-medium truncate">{c.userEmail}</span>
                                                        {c.unreadCount > 0 && (
                                                            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 ml-2">{c.unreadCount}</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-surface-500 truncate">{c.lastMessage}</p>
                                                    <p className="text-[10px] text-surface-600 mt-1">{new Date(c.lastMessageAt).toLocaleString()}</p>
                                                </button>
                                            ))}
                                            {helpConvos.length === 0 && <p className="p-4 text-sm text-surface-500">No conversations</p>}
                                        </div>
                                    </div>

                                    {/* Conversation Messages */}
                                    <div className="lg:col-span-2 bg-white rounded-2xl border border-surface-300 flex flex-col" style={{ height: "600px" }}>
                                        {activeConvo ? (
                                            <>
                                                <div className="p-4 border-b border-surface-300">
                                                    <h3 className="text-sm font-bold text-surface-950">Chat with {helpConvos.find(c => c._id === activeConvo)?.userEmail}</h3>
                                                </div>
                                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                                    {convoMsgs.map(msg => (
                                                        <div key={msg._id} className={`flex ${msg.senderType === "admin" ? "justify-end" : "justify-start"}`}>
                                                            <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm ${msg.senderType === "admin" ? "bg-primary-500/20 text-primary-600 rounded-br-md" : "bg-surface-100 text-surface-700 rounded-bl-md"}`}>
                                                                <p className="whitespace-pre-wrap">{msg.messageText}</p>
                                                                {msg.attachmentUrl && <a href={msg.attachmentUrl} target="_blank" rel="noreferrer" className="text-xs text-primary-500 underline mt-1 block">📎 Attachment</a>}
                                                                <p className="text-[10px] text-surface-500 mt-1.5">{new Date(msg.createdAt).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="p-3 border-t border-surface-300">
                                                    <div className="flex gap-2">
                                                        <input value={adminReply} onChange={e => setAdminReply(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendAdminReply())} placeholder="Type reply..." className="flex-1 px-4 py-3 bg-surface-100 border border-surface-300 rounded-xl text-surface-950 text-sm placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-300" />
                                                        <button onClick={sendAdminReply} disabled={!adminReply.trim()} className="px-5 py-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl text-white text-sm font-medium disabled:opacity-50 hover:shadow-lg transition-all">Reply</button>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex-1 flex items-center justify-center">
                                                <p className="text-surface-500">Select a conversation</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Portfolio Tab */}
                        {activeTab === "portfolio" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="bg-white rounded-2xl border border-surface-300 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-surface-300">
                                                    <th className="text-left p-4 text-surface-600 font-medium">User</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Status</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Portfolio Link</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Requested</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {portfolioReqs.map(r => (
                                                    <tr key={r._id} className="border-b border-surface-200 hover:bg-surface-100/50">
                                                        <td className="p-4 text-surface-950">{r.userEmail}</td>
                                                        <td className="p-4">
                                                            <select value={r.status} onChange={e => updatePortfolioStatus(r._id, e.target.value)} className="px-2 py-1 bg-surface-100 border border-surface-300 rounded-lg text-xs text-surface-950 focus:outline-none focus:ring-2 focus:ring-primary-300">
                                                                <option value="pending">Pending</option>
                                                                <option value="in_progress">In Progress</option>
                                                                <option value="completed">Completed</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-2">
                                                                <input type="url" defaultValue={r.portfolioLink || ""} placeholder="https://..." onBlur={e => { if (e.target.value !== (r.portfolioLink || "")) updatePortfolioStatus(r._id, r.status, e.target.value); }} className="flex-1 px-2 py-1 bg-surface-100 border border-surface-300 rounded-lg text-xs text-surface-950 focus:outline-none focus:ring-2 focus:ring-primary-300" />
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-xs text-surface-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                                {portfolioReqs.length === 0 && (
                                                    <tr><td colSpan={4} className="p-8 text-center text-surface-500">No portfolio requests yet</td></tr>
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
                                <div className="bg-white rounded-2xl border border-surface-300 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-surface-300">
                                                    <th className="text-left p-4 text-surface-600 font-medium">User</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">LinkedIn URL</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Notes</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Status</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Deliverable</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {linkedinReqs.map(r => (
                                                    <tr key={r._id} className="border-b border-surface-200 hover:bg-surface-100/50">
                                                        <td className="p-4 text-surface-950 text-xs">{r.userEmail}</td>
                                                        <td className="p-4"><a href={r.linkedinUrl} target="_blank" rel="noreferrer" className="text-xs text-primary-500 underline truncate block max-w-[200px]">{r.linkedinUrl}</a></td>
                                                        <td className="p-4 text-surface-600 text-xs max-w-[200px] truncate">{r.notes || "—"}</td>
                                                        <td className="p-4">
                                                            <select value={r.status} onChange={e => updateLinkedInStatus(r._id, e.target.value)} className="px-2 py-1 bg-surface-100 border border-surface-300 rounded-lg text-xs text-surface-950 focus:outline-none focus:ring-2 focus:ring-primary-300">
                                                                <option value="pending">Pending</option>
                                                                <option value="in_progress">In Progress</option>
                                                                <option value="completed">Completed</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-4">
                                                            <input type="url" defaultValue={r.deliverableUrl || ""} placeholder="https://..." onBlur={e => { if (e.target.value !== (r.deliverableUrl || "")) updateLinkedInStatus(r._id, r.status, e.target.value); }} className="w-full px-2 py-1 bg-surface-100 border border-surface-300 rounded-lg text-xs text-surface-950 focus:outline-none focus:ring-2 focus:ring-primary-300" />
                                                        </td>
                                                        <td className="p-4 text-xs text-surface-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                                {linkedinReqs.length === 0 && (
                                                    <tr><td colSpan={6} className="p-8 text-center text-surface-500">No LinkedIn makeover requests yet</td></tr>
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
                                <div className="bg-white rounded-2xl border border-surface-300 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-surface-300">
                                                    <th className="text-left p-4 text-surface-600 font-medium">User</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Email</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Resume</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Status</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Last Updated</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {profileRecords.map(p => (
                                                    <tr key={p._id} className="border-b border-surface-200 hover:bg-surface-100/50">
                                                        <td className="p-4 text-surface-950 text-sm">{p.userName}</td>
                                                        <td className="p-4 text-surface-700 text-xs">{p.userEmail}</td>
                                                        <td className="p-4 text-surface-600 text-xs">{p.resumeFileName || "—"}</td>
                                                        <td className="p-4">
                                                            <select value={p.processingStatus} onChange={e => updateProfileStatus(p._id, e.target.value)} className={`px-2 py-1 border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-300 ${p.processingStatus === "approved" ? "bg-green-50 border-accent-green/30 text-accent-green" :
                                                                p.processingStatus === "complete" ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" :
                                                                    p.processingStatus === "failed" ? "bg-red-50 border-red-500/30 text-red-400" :
                                                                        p.processingStatus === "needs_input" ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" :
                                                                            "bg-surface-100 border-surface-300 text-surface-950"
                                                                }`}>
                                                                <option value="uploaded">Uploaded</option>
                                                                <option value="processing">Processing</option>
                                                                <option value="needs_input">Needs Input</option>
                                                                <option value="complete">Complete (Pending Approval)</option>
                                                                <option value="approved">Approved ✓</option>
                                                                <option value="failed">Failed ✗</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-4 text-xs text-surface-500">{new Date(p.updatedAt).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                                {profileRecords.length === 0 && (
                                                    <tr><td colSpan={5} className="p-8 text-center text-surface-500">No profiles yet</td></tr>
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
                                <div className="bg-white rounded-2xl border border-surface-300 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-surface-300">
                                                    <th className="text-left p-4 text-surface-600 font-medium">User</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Type</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Name</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Status</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {targetApps.map(t => (
                                                    <tr key={t._id} className="border-b border-surface-200 hover:bg-surface-100/50">
                                                        <td className="p-4 text-surface-950 text-xs">{t.userEmail}</td>
                                                        <td className="p-4">
                                                            <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${t.type === "company" ? "bg-primary-50 text-primary-500 border border-primary-200" : "bg-primary-500/10 text-primary-300 border border-primary-500/20"}`}>
                                                                {t.type === "company" ? "🏢 Company" : "💼 Role"}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-surface-950 font-medium">{t.name}</td>
                                                        <td className="p-4">
                                                            <select value={t.status} onChange={e => updateTargetStatus(t._id, e.target.value)} className={`px-2 py-1 border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-300 ${t.status === "applied" ? "bg-primary-50 border-primary-500/30 text-primary-500" :
                                                                t.status === "approved" ? "bg-green-50 border-accent-green/30 text-accent-green" :
                                                                    t.status === "not_available" ? "bg-red-50 border-red-500/30 text-red-400" :
                                                                        "bg-surface-100 border-surface-300 text-surface-950"
                                                                }`}>
                                                                <option value="pending">Pending</option>
                                                                <option value="approved">Approved</option>
                                                                <option value="applied">Applied ✓</option>
                                                                <option value="not_available">Not Available</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-4 text-xs text-surface-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                                {targetApps.length === 0 && (
                                                    <tr><td colSpan={5} className="p-8 text-center text-surface-500">No target applications yet</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Feature Access Tab */}
                        {activeTab === "features" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="bg-white rounded-2xl border border-surface-300 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-surface-950">Feature Access Management</h3>
                                            <p className="text-sm text-surface-600 mt-1">Control which features are visible per subscription plan. Changes apply instantly to all users.</p>
                                        </div>
                                        <button
                                            onClick={saveFeatureAccess}
                                            disabled={featureAccessSaving}
                                            className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-50"
                                        >
                                            {featureAccessSaving ? "Saving..." : "💾 Save Changes"}
                                        </button>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-surface-300">
                                                    <th className="text-left p-4 text-surface-600 font-semibold w-1/3">Feature</th>
                                                    {PLAN_TIERS.map(plan => (
                                                        <th key={plan} className="text-center p-4 text-surface-600 font-semibold capitalize">{plan === "none" ? "Free" : plan}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {DASHBOARD_FEATURES.map(feature => (
                                                    <tr key={feature.id} className="border-b border-surface-200 hover:bg-surface-100/50">
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xl">{feature.icon}</span>
                                                                <div>
                                                                    <p className="font-medium text-surface-900">{feature.label}</p>
                                                                    {feature.alwaysVisible && (
                                                                        <span className="text-[10px] text-primary-500 bg-primary-50 px-2 py-0.5 rounded-full">Always visible</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        {PLAN_TIERS.map(plan => {
                                                            const enabled = featureAccessMap[feature.id]?.[plan] ?? true;
                                                            const isAlwaysOn = feature.alwaysVisible;
                                                            return (
                                                                <td key={plan} className="p-4 text-center">
                                                                    <button
                                                                        onClick={() => !isAlwaysOn && toggleFeatureAccess(feature.id, plan)}
                                                                        disabled={isAlwaysOn}
                                                                        className={`w-12 h-7 rounded-full relative transition-all ${isAlwaysOn
                                                                            ? "bg-green-200 cursor-not-allowed"
                                                                            : enabled
                                                                                ? "bg-accent-green hover:bg-green-600"
                                                                                : "bg-surface-300 hover:bg-surface-400"
                                                                            }`}
                                                                    >
                                                                        <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${enabled || isAlwaysOn ? "left-6" : "left-1"}`} />
                                                                    </button>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="mt-4 p-3 bg-primary-50 rounded-xl border border-primary-100">
                                        <p className="text-xs text-primary-700">
                                            💡 <strong>Auto-discovery:</strong> When you add a new feature to the sidebar, it will automatically appear here with default access settings.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Business Interests Tab */}
                        {activeTab === "business" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="bg-white rounded-2xl border border-surface-300 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-surface-300">
                                                    <th className="text-left p-4 text-surface-600 font-medium">Contact</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Company</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Email</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Size</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Message</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Status</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Notes</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {businessInterests.map(b => (
                                                    <tr key={b._id} className="border-b border-surface-200 hover:bg-surface-100/50">
                                                        <td className="p-4">
                                                            <p className="text-surface-950 font-medium">{b.contactName}</p>
                                                            {b.phone && <p className="text-xs text-surface-500">{b.phone}</p>}
                                                        </td>
                                                        <td className="p-4 text-surface-950 font-medium">{b.companyName}</td>
                                                        <td className="p-4"><a href={`mailto:${b.email}`} className="text-primary-500 hover:underline text-xs">{b.email}</a></td>
                                                        <td className="p-4 text-surface-600 text-xs">{b.companySize}</td>
                                                        <td className="p-4 text-surface-600 text-xs max-w-[200px] truncate">{b.message || "—"}</td>
                                                        <td className="p-4">
                                                            <select value={b.status} onChange={e => updateBusinessInterest(b._id, e.target.value)} className="px-2 py-1 bg-surface-100 border border-surface-300 rounded-lg text-xs text-surface-950 focus:outline-none focus:ring-2 focus:ring-primary-300">
                                                                <option value="new">🔵 New</option>
                                                                <option value="contacted">📞 Contacted</option>
                                                                <option value="in_discussion">💬 In Discussion</option>
                                                                <option value="closed_won">✅ Closed Won</option>
                                                                <option value="closed_lost">❌ Closed Lost</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-4">
                                                            <input type="text" defaultValue={b.adminNotes || ""} placeholder="Add notes..." onBlur={e => { if (e.target.value !== (b.adminNotes || "")) updateBusinessInterest(b._id, undefined, e.target.value); }} className="w-full px-2 py-1 bg-surface-100 border border-surface-300 rounded-lg text-xs text-surface-950 focus:outline-none focus:ring-2 focus:ring-primary-300" />
                                                        </td>
                                                        <td className="p-4 text-xs text-surface-500">{new Date(b.createdAt).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                                {businessInterests.length === 0 && (
                                                    <tr><td colSpan={8} className="p-8 text-center text-surface-500">No business inquiries yet</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Mock Interviews Tab */}
                        {activeTab === "mock-interviews" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="bg-white rounded-2xl border border-surface-300 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-surface-300">
                                                    <th className="text-left p-4 text-surface-600 font-medium">User</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Type</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Slot 1</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Slot 2</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Slot 3</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Timezone</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Confirm Slot</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Status</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {mockInterviewReqs.map(r => (
                                                    <tr key={r._id} className="border-b border-surface-200 hover:bg-surface-100/50">
                                                        <td className="p-4"><a href={`mailto:${r.userEmail}`} className="text-primary-500 hover:underline text-xs">{r.userEmail}</a></td>
                                                        <td className="p-4 text-surface-700 text-xs capitalize">{r.interviewType.replace("-", " ")}</td>
                                                        <td className="p-4 text-surface-700 text-xs">{r.preferredSlot1 ? new Date(r.preferredSlot1).toLocaleString() : "—"}</td>
                                                        <td className="p-4 text-surface-700 text-xs">{r.preferredSlot2 ? new Date(r.preferredSlot2).toLocaleString() : "—"}</td>
                                                        <td className="p-4 text-surface-700 text-xs">{r.preferredSlot3 ? new Date(r.preferredSlot3).toLocaleString() : "—"}</td>
                                                        <td className="p-4 text-surface-600 text-xs">{r.timezone}</td>
                                                        <td className="p-4">
                                                            <select
                                                                value={r.confirmedSlot || ""}
                                                                onChange={e => updateMockInterview(r._id, e.target.value ? "confirmed" : undefined, e.target.value)}
                                                                className="px-2 py-1 bg-surface-100 border border-surface-300 rounded-lg text-xs text-surface-950 focus:outline-none focus:ring-2 focus:ring-primary-300"
                                                            >
                                                                <option value="">Select slot</option>
                                                                <option value={r.preferredSlot1}>Slot 1</option>
                                                                <option value={r.preferredSlot2}>Slot 2</option>
                                                                <option value={r.preferredSlot3}>Slot 3</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-4">
                                                            <select value={r.status} onChange={e => updateMockInterview(r._id, e.target.value)} className="px-2 py-1 bg-surface-100 border border-surface-300 rounded-lg text-xs text-surface-950 focus:outline-none focus:ring-2 focus:ring-primary-300">
                                                                <option value="pending">⏳ Pending</option>
                                                                <option value="confirmed">✅ Confirmed</option>
                                                                <option value="completed">🎉 Completed</option>
                                                                <option value="cancelled">❌ Cancelled</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-4 text-xs text-surface-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                                {mockInterviewReqs.length === 0 && (
                                                    <tr><td colSpan={9} className="p-8 text-center text-surface-500">No mock interview requests yet</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Abandoned Payments Tab */}
                        {activeTab === "abandoned" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="bg-white rounded-2xl border border-surface-300 overflow-hidden">
                                    <div className="p-4 border-b border-surface-300 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-surface-950">Abandoned Payments</h3>
                                            <p className="text-xs text-surface-500 mt-0.5">Users who started checkout but didn&apos;t complete — potential conversions</p>
                                        </div>
                                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-600">
                                            {abandonedPayments.length} abandoned
                                        </span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-surface-300">
                                                    <th className="text-left p-4 text-surface-600 font-medium">Email</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Plan</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Amount</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Coupon</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Attempted</th>
                                                    <th className="text-left p-4 text-surface-600 font-medium">Time Since</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {abandonedPayments.map(p => {
                                                    const timeSince = Date.now() - new Date(p.createdAt).getTime();
                                                    const hours = Math.floor(timeSince / (1000 * 60 * 60));
                                                    const minutes = Math.floor((timeSince % (1000 * 60 * 60)) / (1000 * 60));
                                                    const timeLabel = hours > 24 ? `${Math.floor(hours / 24)}d ago` : hours > 0 ? `${hours}h ${minutes}m ago` : `${minutes}m ago`;
                                                    return (
                                                        <tr key={p._id} className="border-b border-surface-200 hover:bg-surface-100/50">
                                                            <td className="p-4">
                                                                <span className="text-surface-950 font-medium">{p.userEmail}</span>
                                                            </td>
                                                            <td className="p-4">
                                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.plan === 'elite' ? 'bg-violet-50 text-violet-600' :
                                                                        p.plan === 'pro' ? 'bg-blue-50 text-blue-600' :
                                                                            'bg-surface-100 text-surface-700'
                                                                    }`}>
                                                                    {p.plan.charAt(0).toUpperCase() + p.plan.slice(1)}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 text-surface-950">
                                                                ${(p.amountCents / 100).toFixed(2)} {p.currency}
                                                            </td>
                                                            <td className="p-4">
                                                                {p.couponCode ? (
                                                                    <code className="text-primary-400 font-mono text-xs bg-primary-500/10 px-2 py-0.5 rounded">
                                                                        {p.couponCode} (-${((p.couponDiscountCents || 0) / 100).toFixed(2)})
                                                                    </code>
                                                                ) : (
                                                                    <span className="text-xs text-surface-500">—</span>
                                                                )}
                                                            </td>
                                                            <td className="p-4 text-xs text-surface-500">
                                                                {new Date(p.createdAt).toLocaleString()}
                                                            </td>
                                                            <td className="p-4">
                                                                <span className={`text-xs font-medium ${hours < 1 ? 'text-red-500' :
                                                                        hours < 24 ? 'text-amber-600' :
                                                                            'text-surface-500'
                                                                    }`}>
                                                                    {timeLabel}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {abandonedPayments.length === 0 && (
                                                    <tr>
                                                        <td colSpan={6} className="p-8 text-center text-surface-500">
                                                            No abandoned payments found — great news! 🎉
                                                        </td>
                                                    </tr>
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
