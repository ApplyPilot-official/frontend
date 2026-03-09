"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { redirect, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import CounselingPanel from "@/components/dashboard/CounselingPanel";
import HelpDeskPanel from "@/components/dashboard/HelpDeskPanel";
import PortfolioPanel from "@/components/dashboard/PortfolioPanel";
import LinkedInPanel from "@/components/dashboard/LinkedInPanel";
import TargetCompaniesPanel from "@/components/dashboard/TargetCompaniesPanel";

const ATSScreenerSection = dynamic(() => import("@/components/ats-screener/ATSScreenerSection"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center p-12">
            <div className="w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
        </div>
    ),
});

type DashSection = "overview" | "jobs" | "applications" | "companies" | "linkedin" | "analytics" | "ats-screener" | "counseling" | "helpdesk" | "portfolio";

interface UserStatus {
    subscriptionPlan: string;
    role: string;
    name: string;
}

function getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
}

function DashboardContent() {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const initialTab = (searchParams.get("tab") as DashSection) || "overview";
    const [activeSection, setActiveSection] = useState<DashSection>(initialTab);
    const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
    const [profileProcessingStatus, setProfileProcessingStatus] = useState<string | null>(null);
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);
    const [helpUnread, setHelpUnread] = useState(0);

    const fetchStatus = useCallback(async () => {
        if (!session?.user?.email) return;
        try {
            const [userRes, profileRes] = await Promise.all([
                fetch(`/api/user/status?email=${encodeURIComponent(session.user.email)}`),
                fetch("/api/profile/status", { headers: getAuthHeaders() }),
            ]);
            if (userRes.ok) {
                const data = await userRes.json();
                setUserStatus(data);
            }
            if (profileRes.ok) {
                const data = await profileRes.json();
                setProfileProcessingStatus(data.processingStatus || null);
            }
        } catch (err) {
            console.error("Failed to fetch status:", err);
        } finally {
            setIsLoadingStatus(false);
        }
    }, [session?.user?.email]);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    // Fetch unread count for help desk badge
    useEffect(() => {
        fetch("/api/helpdesk/unread", { headers: getAuthHeaders() })
            .then(r => r.json())
            .then(d => setHelpUnread(d.unreadCount || 0))
            .catch(() => { });
    }, []);

    if (status === "loading" || isLoadingStatus) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-700">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!session) {
        redirect("/login");
    }

    const hasSubscription = userStatus?.subscriptionPlan && userStatus.subscriptionPlan !== "none";
    const isAdmin = userStatus?.role === "admin";
    const planLabel = userStatus?.subscriptionPlan?.toUpperCase() || "NONE";

    const sidebarItems: { id: DashSection; label: string; icon: string; requiresPlan?: string; noLock?: boolean }[] = [
        { id: "overview", label: "Overview", icon: "📊" },
        { id: "ats-screener", label: "ATS Screener", icon: "🎯" },
        { id: "jobs", label: "Job Listings", icon: "💼" },
        { id: "applications", label: "Applications", icon: "📨" },
        { id: "counseling", label: "Career Counseling", icon: "🎓" },
        { id: "portfolio", label: "Portfolio Maker", icon: "🌐", requiresPlan: "basic" },
        { id: "helpdesk", label: "Help Desk", icon: "🎫", noLock: true },
        { id: "companies", label: "Target Companies", icon: "🏢", requiresPlan: "pro" },
        { id: "linkedin", label: "LinkedIn Makeover", icon: "💎", requiresPlan: "pro" },
        { id: "analytics", label: "Analytics", icon: "📈" },
    ];

    const stats = [
        { label: "Applications Sent", value: "0", icon: "📨", change: "+0 this week" },
        { label: "Interviews", value: "0", icon: "📅", change: "—" },
        { label: "Response Rate", value: "—", icon: "📈", change: "—" },
        { label: "Jobs Tracked", value: "0", icon: "💼", change: "0 new" },
    ];

    const isFeatureLocked = (requiresPlan?: string) => {
        if (!requiresPlan) return false;
        if (!hasSubscription) return true;
        const planOrder = ["basic", "pro", "elite"];
        const userPlanIndex = planOrder.indexOf(userStatus?.subscriptionPlan || "");
        const requiredPlanIndex = planOrder.indexOf(requiresPlan);
        return userPlanIndex < requiredPlanIndex;
    };

    const renderOverview = () => {
        if (profileProcessingStatus === "approved") {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-dark-400 rounded-2xl p-10 text-center border border-neon-emerald/20"
                >
                    <div className="text-5xl mb-4">🚀</div>
                    <h2 className="text-xl font-bold text-white mb-2">
                        Profile Approved — AI Agents Active
                    </h2>
                    <p className="text-slate-400 max-w-md mx-auto mb-4">
                        Your profile has been approved! Our AI agents are actively applying to jobs on your behalf.
                    </p>
                    <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neon-emerald bg-neon-emerald/10 rounded-xl border border-neon-emerald/20">
                        ✅ Approved & Active
                    </span>
                    <div className="mt-4">
                        <Link href="/profile" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
                            View & Edit Your Profile →
                        </Link>
                    </div>
                </motion.div>
            );
        }

        if (profileProcessingStatus === "complete") {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-dark-400 rounded-2xl p-10 text-center border border-neon-emerald/20"
                >
                    <div className="text-5xl mb-4">✅</div>
                    <h2 className="text-xl font-bold text-white mb-2">
                        Profile Complete — Pending Admin Approval
                    </h2>
                    <p className="text-slate-400 max-w-md mx-auto mb-4">
                        Your profile has been submitted and is awaiting admin review.
                        Once approved, our AI agents will begin applying to jobs on your behalf.
                    </p>
                    <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-yellow-400 bg-yellow-400/10 rounded-xl border border-yellow-400/20">
                        ⏳ Pending Admin Approval
                    </span>
                    <div className="mt-4">
                        <Link href="/profile" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
                            View & Edit Your Profile →
                        </Link>
                    </div>
                </motion.div>
            );
        }

        if (profileProcessingStatus === "needs_input") {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-dark-400 rounded-2xl p-10 text-center border border-yellow-400/20"
                >
                    <div className="text-5xl mb-4">📝</div>
                    <h2 className="text-xl font-bold text-white mb-2">
                        Almost Done — Fill in Missing Details
                    </h2>
                    <p className="text-slate-400 max-w-md mx-auto mb-6">
                        We&apos;ve extracted most of your profile from your resume. A few fields still need your input.
                    </p>
                    <Link href="/onboarding" className="inline-block px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-neon-blue to-primary-500 rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all">
                        Complete Your Profile
                    </Link>
                </motion.div>
            );
        }

        if (profileProcessingStatus === "processing") {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-dark-400 rounded-2xl p-10 text-center border border-primary-500/20"
                >
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full border-4 border-t-neon-blue border-r-neon-violet border-b-transparent border-l-transparent animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center text-2xl">🤖</div>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">
                        Processing Your Resume
                    </h2>
                    <p className="text-slate-400 max-w-md mx-auto mb-6">
                        Our AI is analyzing your resume. This usually takes 15–30 seconds.
                    </p>
                    <Link href="/onboarding" className="inline-block text-sm text-primary-400 hover:text-primary-300 transition-colors">
                        View Progress →
                    </Link>
                </motion.div>
            );
        }

        // Default: no profile or failed
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-dark-400 rounded-2xl p-10 text-center border border-dark-50/20"
            >
                <div className="text-5xl mb-4">🚀</div>
                <h2 className="text-xl font-bold text-white mb-2">
                    Your AI Copilot is Ready
                </h2>
                <p className="text-slate-400 max-w-md mx-auto mb-6">
                    Set up your profile and preferences to start receiving AI-matched
                    job applications. It only takes 5 minutes.
                </p>
                <Link href="/onboarding" className="inline-block px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-neon-blue to-primary-500 rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all">
                    Complete Your Profile
                </Link>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-dark-700 pt-20">
            <div className="flex">
                {/* Sidebar */}
                <motion.aside
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="w-64 min-h-[calc(100vh-5rem)] bg-dark-500 border-r border-dark-50/20 p-4 hidden lg:block"
                >
                    {/* Plan badge */}
                    <div className="mb-6 p-3 bg-dark-400 rounded-xl flex items-center gap-2">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${hasSubscription
                            ? "bg-neon-emerald/10 text-neon-emerald"
                            : "bg-yellow-500/10 text-yellow-400"
                            }`}>
                            {planLabel} Plan
                        </span>
                        <span className="text-xs text-slate-500">·</span>
                        <span className="text-xs text-slate-400 truncate">{session.user?.name?.split(" ")[0]}</span>
                    </div>

                    {/* Nav */}
                    <nav className="space-y-1">
                        {sidebarItems.map((item) => {
                            const locked = !item.noLock && isFeatureLocked(item.requiresPlan);
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => !locked && setActiveSection(item.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${activeSection === item.id
                                        ? "bg-primary-500/10 text-primary-400 font-medium"
                                        : locked
                                            ? "text-slate-600 cursor-not-allowed"
                                            : "text-slate-400 hover:text-white hover:bg-dark-400"
                                        }`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span className="flex-1 text-left">{item.label}</span>
                                    {item.id === "helpdesk" && helpUnread > 0 && (
                                        <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                            {helpUnread}
                                        </span>
                                    )}
                                    {locked && (
                                        <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                                            🔒 {item.requiresPlan === "pro" ? "Pro" : "Paid"}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Admin link */}
                    {isAdmin && (
                        <div className="mt-6 pt-4 border-t border-dark-50/20">
                            <Link
                                href="/admin"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-neon-violet hover:bg-neon-violet/10 transition-all"
                            >
                                <span className="text-lg">⚙️</span>
                                <span>Admin Portal</span>
                            </Link>
                        </div>
                    )}
                </motion.aside>

                {/* Main Content */}
                <div className="flex-1 relative">
                    {/* Paywall Overlay */}
                    {!hasSubscription && (
                        <div className="absolute inset-0 z-40 backdrop-blur-md bg-dark-700/60 flex items-center justify-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center p-8 max-w-md"
                            >
                                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 to-neon-violet flex items-center justify-center text-4xl shadow-xl shadow-primary-500/20">
                                    🔒
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-3">
                                    Unlock Your Dashboard
                                </h2>
                                <p className="text-slate-400 mb-6 leading-relaxed">
                                    Purchase a plan to access your AI-powered job application dashboard, job listings, and automated applications.
                                </p>
                                <Link
                                    href="/pricing"
                                    className="inline-flex items-center px-8 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-neon-blue to-primary-500 rounded-xl hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all"
                                >
                                    View Plans & Subscribe
                                </Link>
                                <p className="mt-4 text-xs text-slate-500">
                                    Starting at $35/month · 30-day money-back guarantee
                                </p>
                            </motion.div>
                        </div>
                    )}

                    <div className="p-6 lg:p-8">
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <h1 className="text-2xl font-bold text-white">
                                Welcome back, {session.user?.name?.split(" ")[0]}! 👋
                            </h1>
                            <p className="text-sm text-slate-400 mt-1">
                                Here&apos;s your application activity overview
                            </p>
                        </motion.div>

                        {/* Stats Grid */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {stats.map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-dark-400 rounded-2xl p-5 border border-dark-50/20 hover:border-primary-500/30 transition-all"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-2xl">{stat.icon}</span>
                                        <span className="text-xs text-slate-500">{stat.change}</span>
                                    </div>
                                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                                    <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Content Areas */}
                        {activeSection === "overview" && renderOverview()}

                        {activeSection === "jobs" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-white">Job Listings</h2>
                                    <div className="flex gap-2">
                                        <select className="px-3 py-2 bg-dark-400 border border-dark-50/30 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50">
                                            <option>All Visa Types</option>
                                            <option>H1B</option>
                                            <option>STEM OPT</option>
                                            <option>Green Card</option>
                                        </select>
                                        <select className="px-3 py-2 bg-dark-400 border border-dark-50/30 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50">
                                            <option>All Job Types</option>
                                            <option>Full-time</option>
                                            <option>Contract</option>
                                            <option>Part-time</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="bg-dark-400 rounded-2xl p-10 text-center border border-dark-50/20">
                                    <div className="text-4xl mb-3">🔍</div>
                                    <p className="text-slate-400">
                                        Job listings will appear here once the automation service is configured.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {activeSection === "applications" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-dark-400 rounded-2xl p-10 text-center border border-dark-50/20"
                            >
                                <div className="text-4xl mb-3">📋</div>
                                <p className="text-slate-400">
                                    Your submitted applications will be tracked here.
                                </p>
                            </motion.div>
                        )}

                        {activeSection === "companies" && <TargetCompaniesPanel />}

                        {activeSection === "analytics" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-dark-400 rounded-2xl p-10 text-center border border-dark-50/20"
                            >
                                <div className="text-4xl mb-3">📈</div>
                                <p className="text-slate-400">
                                    Analytics and response tracking will appear as applications are submitted.
                                </p>
                            </motion.div>
                        )}

                        {activeSection === "ats-screener" && (
                            <ATSScreenerSection />
                        )}

                        {activeSection === "counseling" && <CounselingPanel />}

                        {activeSection === "helpdesk" && (
                            <HelpDeskPanel onUnreadChange={(count) => setHelpUnread(count)} />
                        )}

                        {activeSection === "portfolio" && (
                            <PortfolioPanel hasSubscription={!!hasSubscription} />
                        )}

                        {activeSection === "linkedin" && (
                            <LinkedInPanel hasSubscription={!!hasSubscription} subscriptionPlan={userStatus?.subscriptionPlan || "none"} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-dark-700">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
