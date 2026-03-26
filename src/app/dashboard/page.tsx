"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { redirect, useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import CounselingPanel from "@/components/dashboard/CounselingPanel";
import HelpDeskPanel from "@/components/dashboard/HelpDeskPanel";
import PortfolioPanel from "@/components/dashboard/PortfolioPanel";
import LinkedInPanel from "@/components/dashboard/LinkedInPanel";
import TargetCompaniesPanel from "@/components/dashboard/TargetCompaniesPanel";
import JobListingsPanel from "@/components/dashboard/JobListingsPanel";
import MockInterviewPanel from "@/components/dashboard/MockInterviewPanel";
import { DASHBOARD_FEATURES, getDefaultFeatureAccess, type FeatureAccessMap } from "@/lib/dashboardFeatures";

const ATSScreenerSection = dynamic(() => import("@/components/ats-screener/ATSScreenerSection"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center p-12">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    ),
});

type DashSection = "overview" | "jobs" | "applications" | "companies" | "linkedin" | "analytics" | "ats-screener" | "counseling" | "helpdesk" | "portfolio" | "mock-interview" | "ai-cover-letters" | "resume-builder";

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
    const router = useRouter();
    const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
    const [profileProcessingStatus, setProfileProcessingStatus] = useState<string | null>(null);
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);
    const [helpUnread, setHelpUnread] = useState(0);
    const [featureAccess, setFeatureAccess] = useState<FeatureAccessMap>(getDefaultFeatureAccess());
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

    useEffect(() => {
        fetch("/api/helpdesk/unread", { headers: getAuthHeaders() })
            .then(r => r.json())
            .then(d => setHelpUnread(d.unreadCount || 0))
            .catch(() => { });
        // Fetch feature access config
        fetch("/api/admin/feature-access")
            .then(r => r.json())
            .then(d => { if (d.features) setFeatureAccess(d.features); })
            .catch(() => { });
    }, []);

    if (status === "loading" || isLoadingStatus) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-100">
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
    const userPlan = (userStatus?.subscriptionPlan || "none") as "none" | "basic" | "pro" | "elite";

    const sidebarItems = DASHBOARD_FEATURES.map(f => ({
        id: f.id as DashSection,
        label: f.label,
        icon: f.icon,
        alwaysVisible: f.alwaysVisible,
    }));

    const stats = [
        { label: "Applications Sent", value: "0", icon: "📨", change: "+0 this week" },
        { label: "Interviews", value: "0", icon: "📅", change: "—" },
        { label: "Response Rate", value: "—", icon: "📈", change: "—" },
        { label: "Jobs Tracked", value: "0", icon: "💼", change: "0 new" },
    ];

    // DB-driven feature access: check if the user's plan has access to this feature
    const isFeatureLocked = (featureId: string, alwaysVisible?: boolean) => {
        if (alwaysVisible) return false;
        const access = featureAccess[featureId];
        if (!access) return false; // unknown feature = unlocked
        return !access[userPlan];
    };

    const handleMobileNav = (sectionId: DashSection, locked: boolean) => {
        if (locked) {
            router.push("/pricing");
            setMobileMenuOpen(false);
            return;
        }
        setActiveSection(sectionId);
        setMobileMenuOpen(false);
    };

    const renderSidebarNav = (onNav?: (id: DashSection, locked: boolean) => void) => (
        <>
            {/* Plan badge */}
            <div className="mb-6 p-3 bg-surface-100 rounded-xl flex items-center gap-2 border border-surface-300">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${hasSubscription
                    ? "bg-green-50 text-accent-green"
                    : "bg-amber-50 text-amber-600"
                    }`}>
                    {planLabel} Plan
                </span>
                <span className="text-xs text-surface-400">·</span>
                <span className="text-xs text-surface-600 truncate">{session.user?.name?.split(" ")[0]}</span>
            </div>

            {/* Nav */}
            <nav className="space-y-1">
                {sidebarItems.map((item) => {
                    const locked = isFeatureLocked(item.id, item.alwaysVisible);
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNav ? onNav(item.id, locked) : (locked ? router.push("/pricing") : setActiveSection(item.id))}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${activeSection === item.id
                                ? "bg-primary-50 text-primary-600 font-medium"
                                : locked
                                    ? "text-surface-400 hover:text-amber-600 hover:bg-amber-50 cursor-pointer"
                                    : "text-surface-600 hover:text-surface-900 hover:bg-surface-200"
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.id === "helpdesk" && helpUnread > 0 && (
                                <span className="w-5 h-5 rounded-full bg-accent-red text-white text-[10px] font-bold flex items-center justify-center">
                                    {helpUnread}
                                </span>
                            )}
                            {locked && (
                                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                    🔒 Upgrade
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Admin link */}
            {isAdmin && (
                <div className="mt-6 pt-4 border-t border-surface-300">
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-violet-600 hover:bg-violet-50 transition-all"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <span className="text-lg">⚙️</span>
                        <span>Admin Portal</span>
                    </Link>
                </div>
            )}
        </>
    );

    const renderOverview = () => {
        // Free/none plan users: show upgrade prompt
        if (!hasSubscription) {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl p-10 text-center border border-primary-200 shadow-sm"
                >
                    <div className="text-5xl mb-4">💎</div>
                    <h2 className="text-xl font-bold text-surface-950 mb-2">Upgrade Your Subscription</h2>
                    <p className="text-surface-600 max-w-md mx-auto mb-6">Subscribe to a plan to unlock AI-powered auto-apply, profile building, and job matching features.</p>
                    <Link
                        href="/pricing"
                        className="inline-block px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-accent-green rounded-xl hover:shadow-lg hover:shadow-primary-500/20 hover:-translate-y-0.5 transition-all"
                    >
                        View Plans & Subscribe
                    </Link>
                    <p className="mt-4 text-xs text-surface-500">Starting at $35/month · 30-day money-back guarantee</p>
                </motion.div>
            );
        }

        if (profileProcessingStatus === "approved") {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl p-10 text-center border border-green-200 shadow-sm"
                >
                    <div className="text-5xl mb-4">🚀</div>
                    <h2 className="text-xl font-bold text-surface-950 mb-2">Profile Approved — AI Agents Active</h2>
                    <p className="text-surface-600 max-w-md mx-auto mb-4">Your profile has been approved! Our AI agents are actively applying to jobs on your behalf.</p>
                    <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-accent-green bg-green-50 rounded-xl border border-green-200">
                        ✅ Approved & Active
                    </span>
                    <div className="mt-4">
                        <Link href="/profile" className="text-sm text-primary-500 hover:text-primary-600 transition-colors">View & Edit Your Profile →</Link>
                    </div>
                </motion.div>
            );
        }

        if (profileProcessingStatus === "complete") {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl p-10 text-center border border-green-200 shadow-sm"
                >
                    <div className="text-5xl mb-4">✅</div>
                    <h2 className="text-xl font-bold text-surface-950 mb-2">Profile Complete — Pending Admin Approval</h2>
                    <p className="text-surface-600 max-w-md mx-auto mb-4">Your profile has been submitted and is awaiting admin review. Once approved, our AI agents will begin applying to jobs on your behalf.</p>
                    <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-600 bg-amber-50 rounded-xl border border-amber-200">
                        ⏳ Pending Admin Approval
                    </span>
                    <div className="mt-4">
                        <Link href="/profile" className="text-sm text-primary-500 hover:text-primary-600 transition-colors">View & Edit Your Profile →</Link>
                    </div>
                </motion.div>
            );
        }

        if (profileProcessingStatus === "needs_input") {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl p-10 text-center border border-amber-200 shadow-sm"
                >
                    <div className="text-5xl mb-4">📝</div>
                    <h2 className="text-xl font-bold text-surface-950 mb-2">Almost Done — Fill in Missing Details</h2>
                    <p className="text-surface-600 max-w-md mx-auto mb-6">We&apos;ve extracted most of your profile from your resume. A few fields still need your input.</p>
                    <Link href="/onboarding" className="inline-block px-6 py-3 text-sm font-semibold text-white bg-primary-500 rounded-xl hover:bg-primary-600 hover:shadow-lg transition-all">
                        Complete Your Profile
                    </Link>
                </motion.div>
            );
        }

        if (profileProcessingStatus === "processing") {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl p-10 text-center border border-primary-200 shadow-sm"
                >
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 border-r-accent-green border-b-transparent border-l-transparent animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center text-2xl">🤖</div>
                    </div>
                    <h2 className="text-xl font-bold text-surface-950 mb-2">Processing Your Resume</h2>
                    <p className="text-surface-600 max-w-md mx-auto mb-6">Our AI is analyzing your resume. This usually takes 15–30 seconds.</p>
                    <Link href="/onboarding" className="inline-block text-sm text-primary-500 hover:text-primary-600 transition-colors">View Progress →</Link>
                </motion.div>
            );
        }

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl p-10 text-center border border-surface-300 shadow-sm"
            >
                <div className="text-5xl mb-4">🚀</div>
                <h2 className="text-xl font-bold text-surface-950 mb-2">Your AI Copilot is Ready</h2>
                <p className="text-surface-600 max-w-md mx-auto mb-6">Set up your profile and preferences to start receiving AI-matched job applications. It only takes 5 minutes.</p>
                <Link href="/onboarding" className="inline-block px-6 py-3 text-sm font-semibold text-white bg-primary-500 rounded-xl hover:bg-primary-600 hover:shadow-lg transition-all">
                    Complete Your Profile
                </Link>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-surface-100 pt-20 overflow-x-hidden">
            {/* Mobile Menu Toggle */}
            <div className="lg:hidden sticky top-20 z-30 bg-white/95 backdrop-blur-md border-b border-surface-300 px-4 py-3 flex items-center justify-between">
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-surface-100 rounded-xl text-sm text-surface-700 hover:text-surface-950 transition-all border border-surface-300"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <span>Menu</span>
                </button>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${hasSubscription
                    ? "bg-green-50 text-accent-green"
                    : "bg-amber-50 text-amber-600"
                    }`}>
                    {sidebarItems.find(i => i.id === activeSection)?.icon} {sidebarItems.find(i => i.id === activeSection)?.label}
                </span>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-surface-300 p-4 overflow-y-auto lg:hidden shadow-xl"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-bold text-surface-950">Dashboard Menu</span>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 rounded-xl text-surface-400 hover:text-surface-950 hover:bg-surface-200 transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            {renderSidebarNav(handleMobileNav)}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <div className="flex">
                {/* Desktop Sidebar */}
                <motion.aside
                    initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                    className="w-64 min-h-[calc(100vh-5rem)] bg-white border-r border-surface-300 p-4 hidden lg:block"
                >
                    {renderSidebarNav()}
                </motion.aside>

                {/* Main Content */}
                <div className="flex-1 min-w-0 relative overflow-hidden">
                    {/* Paywall Overlay — only for locked sections */}
                    {!hasSubscription && isFeatureLocked(activeSection) && (
                        <div className="absolute inset-0 z-40 backdrop-blur-md bg-white/60 flex items-center justify-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                className="text-center p-8 max-w-md"
                            >
                                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-green flex items-center justify-center text-4xl shadow-xl shadow-primary-500/20">
                                    🔒
                                </div>
                                <h2 className="text-2xl font-bold text-surface-950 mb-3">Unlock This Feature</h2>
                                <p className="text-surface-600 mb-6 leading-relaxed">Upgrade your plan to access this feature and unlock AI-powered job application tools.</p>
                                <Link
                                    href="/pricing"
                                    className="inline-flex items-center px-8 py-3.5 text-sm font-bold text-white bg-primary-500 rounded-xl hover:bg-primary-600 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                                >
                                    View Plans & Upgrade
                                </Link>
                                <p className="mt-4 text-xs text-surface-500">Starting at $35/month · 30-day money-back guarantee</p>
                            </motion.div>
                        </div>
                    )}

                    <div className="p-4 lg:p-8">
                        {/* Header */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 lg:mb-8">
                            <h1 className="text-lg lg:text-2xl font-bold text-surface-950">
                                Welcome back, {session.user?.name?.split(" ")[0]}! 👋
                            </h1>
                            <p className="text-xs lg:text-sm text-surface-500 mt-1">Here&apos;s your application activity overview</p>
                        </motion.div>

                        {/* Stats — compact 2x2 on mobile */}
                        <div className="grid grid-cols-2 gap-2 mb-4 lg:hidden">
                            {stats.map((stat, i) => (
                                <motion.div key={stat.label}
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                    className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-surface-300">
                                    <span className="text-base">{stat.icon}</span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-surface-900 leading-tight">{stat.value}</p>
                                        <p className="text-[10px] text-surface-500 leading-tight truncate">{stat.label}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        {/* Desktop: full stat cards */}
                        <div className="hidden lg:grid lg:grid-cols-4 gap-4 mb-8">
                            {stats.map((stat, i) => (
                                <motion.div key={stat.label}
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                    className="bg-white rounded-2xl p-5 border border-surface-300 hover:border-primary-300 transition-all shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-2xl">{stat.icon}</span>
                                        <span className="text-xs text-surface-500">{stat.change}</span>
                                    </div>
                                    <p className="text-3xl font-bold text-surface-950">{stat.value}</p>
                                    <p className="text-sm text-surface-500 mt-1">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Content Areas */}
                        {activeSection === "overview" && renderOverview()}

                        {activeSection === "jobs" && <JobListingsPanel />}

                        {activeSection === "applications" && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl p-10 text-center border border-surface-300 shadow-sm">
                                <div className="text-4xl mb-3">📋</div>
                                <p className="text-surface-600">Your submitted applications will be tracked here.</p>
                            </motion.div>
                        )}

                        {activeSection === "companies" && <TargetCompaniesPanel />}

                        {activeSection === "analytics" && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl p-10 text-center border border-surface-300 shadow-sm">
                                <div className="text-4xl mb-3">📈</div>
                                <p className="text-surface-600">Analytics and response tracking will appear as applications are submitted.</p>
                            </motion.div>
                        )}

                        {activeSection === "ats-screener" && <ATSScreenerSection />}
                        {activeSection === "counseling" && <CounselingPanel />}
                        {activeSection === "helpdesk" && <HelpDeskPanel onUnreadChange={(count) => setHelpUnread(count)} />}
                        {activeSection === "portfolio" && <PortfolioPanel hasSubscription={!!hasSubscription} />}
                        {activeSection === "linkedin" && <LinkedInPanel hasSubscription={!!hasSubscription} subscriptionPlan={userStatus?.subscriptionPlan || "none"} />}
                        {activeSection === "mock-interview" && <MockInterviewPanel />}

                        {activeSection === "ai-cover-letters" && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl p-10 text-center border border-surface-300 shadow-sm">
                                <div className="text-5xl mb-4">✉️</div>
                                <h2 className="text-xl font-bold text-surface-950 mb-3">AI Cover Letters</h2>
                                <span className="inline-block px-4 py-1.5 rounded-full bg-violet-500/10 text-violet-500 text-sm font-medium border border-violet-500/20 mb-4">🚀 Coming Soon</span>
                                <p className="text-surface-600 max-w-md mx-auto">Generate personalized, job-specific cover letters in seconds using AI. Tailored to each job description and your resume.</p>
                            </motion.div>
                        )}

                        {activeSection === "resume-builder" && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl p-10 text-center border border-surface-300 shadow-sm">
                                <div className="text-5xl mb-4">📝</div>
                                <h2 className="text-xl font-bold text-surface-950 mb-3">Resume Builder</h2>
                                <span className="inline-block px-4 py-1.5 rounded-full bg-violet-500/10 text-violet-500 text-sm font-medium border border-violet-500/20 mb-4">🚀 Coming Soon</span>
                                <p className="text-surface-600 max-w-md mx-auto">Build ATS-optimized resumes with our AI-powered resume builder. Choose from professional templates and get real-time suggestions.</p>
                            </motion.div>
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
            <div className="min-h-screen flex items-center justify-center bg-surface-100">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
