"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PLANS, PLAN_ORDER } from "@/lib/plans";
import type { PlanType } from "@/lib/plans";

interface SubInfo {
    plan: string;
    planName: string;
    price: number;
    startDate: string | null;
    endDate: string | null;
    daysLeft: number;
}

interface PaymentRecord {
    plan: string;
    amountCents: number;
    currency: string;
    couponCode?: string;
    couponDiscountCents?: number;
    status: string;
    createdAt: string;
}

export default function SubscriptionPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [subInfo, setSubInfo] = useState<SubInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [cancelError, setCancelError] = useState("");
    const [cancelled, setCancelled] = useState(false);
    const [history, setHistory] = useState<PaymentRecord[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);

    const fetchSub = useCallback(async () => {
        if (!session?.user?.email) return;
        try {
            const res = await fetch(`/api/user/status?email=${encodeURIComponent(session.user.email)}`);
            if (!res.ok) return;
            const data = await res.json();
            const plan = data.subscriptionPlan || "none";
            const planConfig = PLANS[plan as PlanType];

            let daysLeft = 0;
            if (data.subscriptionEndDate) {
                const end = new Date(data.subscriptionEndDate);
                const now = new Date();
                daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
            }

            setSubInfo({
                plan,
                planName: planConfig?.name || "No Plan",
                price: planConfig?.price || 0,
                startDate: data.subscriptionStartDate || null,
                endDate: data.subscriptionEndDate || null,
                daysLeft,
            });
        } catch (err) {
            console.error("Failed to fetch subscription:", err);
        } finally {
            setIsLoading(false);
        }
    }, [session?.user?.email]);

    const fetchHistory = useCallback(async () => {
        try {
            const res = await fetch("/api/subscription/history");
            if (res.ok) {
                const data = await res.json();
                setHistory(data.payments || []);
            }
        } catch (err) {
            console.error("Failed to fetch history:", err);
        } finally {
            setHistoryLoading(false);
        }
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }
        fetchSub();
        fetchHistory();
    }, [status, fetchSub, fetchHistory, router]);

    const handleCancel = async () => {
        setIsCancelling(true);
        setCancelError("");
        try {
            const res = await fetch("/api/subscription/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            if (!res.ok) {
                setCancelError(data.error || "Failed to cancel");
                return;
            }
            setCancelled(true);
            setShowCancelModal(false);
            // Refresh data
            setSubInfo(prev => prev ? { ...prev, plan: "none", planName: "No Plan", price: 0, startDate: null, endDate: null, daysLeft: 0 } : null);
        } catch {
            setCancelError("Something went wrong. Please try again.");
        } finally {
            setIsCancelling(false);
        }
    };

    const hasActivePlan = subInfo && subInfo.plan !== "none";
    const currentPlanIndex = hasActivePlan ? PLAN_ORDER.indexOf(subInfo!.plan as PlanType) : -1;
    const canUpgrade = currentPlanIndex < PLAN_ORDER.length - 1;

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (isLoading || status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-100">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-100 pt-28 pb-20">
            <div className="max-w-2xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary-500/10 text-primary-400 text-sm font-medium mb-4 border border-primary-500/20">
                        💎 Subscription
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-bold text-surface-950">
                        Manage Your Plan
                    </h1>
                </motion.div>

                {/* Cancelled success */}
                {cancelled && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-green-50 border border-accent-green/30 rounded-xl text-accent-green text-sm text-center"
                    >
                        ✓ Your subscription has been cancelled successfully.
                    </motion.div>
                )}

                {hasActivePlan ? (
                    /* ───── Active Plan Card ───── */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl border border-surface-300 overflow-hidden"
                    >
                        {/* Plan Header */}
                        <div className="p-6 bg-gradient-to-r from-primary-500/10 to-violet-500/10 border-b border-surface-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-surface-600 uppercase tracking-wider mb-1">Current Plan</p>
                                    <h2 className="text-2xl font-bold text-surface-950">{subInfo!.planName}</h2>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-surface-950">${subInfo!.price}</p>
                                    <p className="text-xs text-surface-600">/month</p>
                                </div>
                            </div>
                        </div>

                        {/* Plan Details */}
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-surface-100 rounded-xl p-4">
                                    <p className="text-xs text-surface-600 mb-1">Started</p>
                                    <p className="text-sm font-medium text-surface-950">{formatDate(subInfo!.startDate)}</p>
                                </div>
                                <div className="bg-surface-100 rounded-xl p-4">
                                    <p className="text-xs text-surface-600 mb-1">Renews On</p>
                                    <p className="text-sm font-medium text-surface-950">{formatDate(subInfo!.endDate)}</p>
                                </div>
                            </div>

                            {/* Days Left Bar */}
                            <div className="bg-surface-100 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs text-surface-600">Time Remaining</p>
                                    <p className="text-sm font-semibold text-surface-950">{subInfo!.daysLeft} days left</p>
                                </div>
                                <div className="w-full h-2 bg-surface-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (subInfo!.daysLeft / 30) * 100)}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={`h-full rounded-full ${subInfo!.daysLeft > 10
                                            ? "bg-gradient-to-r from-accent-green to-teal-400"
                                            : subInfo!.daysLeft > 3
                                                ? "bg-gradient-to-r from-yellow-400 to-orange-400"
                                                : "bg-gradient-to-r from-red-500 to-red-400"
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Features */}
                            <div className="bg-surface-100 rounded-xl p-4">
                                <p className="text-xs text-surface-600 mb-3">Included Features</p>
                                <ul className="space-y-2">
                                    {PLANS[subInfo!.plan as PlanType]?.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-surface-700">
                                            <svg className="w-4 h-4 text-accent-green shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                {canUpgrade && (
                                    <Link
                                        href="/pricing"
                                        className="flex-1 py-3 text-center text-sm font-semibold text-surface-950 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5 transition-all"
                                    >
                                        ⬆️ Upgrade Plan
                                    </Link>
                                )}
                                <button
                                    onClick={() => setShowCancelModal(true)}
                                    className="flex-1 py-3 text-center text-sm font-medium text-red-400 bg-red-50 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all"
                                >
                                    Cancel Subscription
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    /* ───── No Plan ───── */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl p-8 border border-surface-300 text-center"
                    >
                        <span className="text-5xl mb-4 block">📭</span>
                        <h2 className="text-xl font-bold text-surface-950 mb-2">No Active Plan</h2>
                        <p className="text-sm text-surface-600 mb-6">
                            You don&apos;t have an active subscription. Choose a plan to start automating your job applications.
                        </p>
                        <Link
                            href="/pricing"
                            className="inline-block px-8 py-3 text-sm font-semibold text-surface-950 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5 transition-all"
                        >
                            🚀 View Plans
                        </Link>
                    </motion.div>
                )}

                {/* ───── Subscription History ───── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-8 bg-white rounded-2xl border border-surface-300 overflow-hidden"
                >
                    <div className="p-5 border-b border-surface-300">
                        <h3 className="text-base font-semibold text-surface-950 flex items-center gap-2">
                            📋 Subscription History
                        </h3>
                    </div>
                    <div className="p-5">
                        {historyLoading ? (
                            <div className="flex justify-center py-6">
                                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : history.length === 0 ? (
                            <p className="text-sm text-surface-500 text-center py-6">No subscription history yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {history.map((p, i) => {
                                    const planConfig = PLANS[p.plan as PlanType];
                                    const date = new Date(p.createdAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    });
                                    const amount = `$${(p.amountCents / 100).toLocaleString()}`;
                                    return (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between p-3 bg-surface-100 rounded-xl"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${p.status === "paid"
                                                    ? "bg-accent-green/15 text-accent-green"
                                                    : "bg-red-500/15 text-red-400"
                                                    }`}>
                                                    {p.status === "paid" ? "✓" : "✕"}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-surface-950">
                                                        {planConfig?.name || p.plan} Plan
                                                    </p>
                                                    <p className="text-xs text-surface-500">
                                                        {date}
                                                        {p.couponCode && (
                                                            <span className="ml-2 text-accent-green">🏷 {p.couponCode}</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-surface-950">{amount}</p>
                                                <p className={`text-xs ${p.status === "paid" ? "text-accent-green" : "text-red-400"
                                                    }`}>
                                                    {p.status === "paid" ? "Paid" : "Failed"}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* ───── Cancel Confirmation Modal ───── */}
                <AnimatePresence>
                    {showCancelModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                            onClick={() => !isCancelling && setShowCancelModal(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white rounded-2xl p-6 max-w-md w-full border border-surface-300 shadow-2xl"
                            >
                                <div className="text-center mb-6">
                                    <span className="text-4xl mb-3 block">⚠️</span>
                                    <h3 className="text-xl font-bold text-surface-950 mb-2">Cancel Subscription?</h3>
                                    <p className="text-sm text-surface-600">
                                        Are you sure you want to cancel your <strong className="text-surface-950">{subInfo?.planName}</strong> plan? You&apos;ll lose access to all premium features immediately.
                                    </p>
                                </div>

                                {cancelError && (
                                    <p className="text-sm text-red-400 text-center mb-4">{cancelError}</p>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowCancelModal(false)}
                                        disabled={isCancelling}
                                        className="flex-1 py-3 text-sm font-medium text-surface-950 bg-surface-200 rounded-xl hover:bg-surface-300 transition-all disabled:opacity-50"
                                    >
                                        Keep Plan
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={isCancelling}
                                        className="flex-1 py-3 text-sm font-semibold text-surface-950 bg-red-500 rounded-xl hover:bg-red-600 transition-all disabled:opacity-60"
                                    >
                                        {isCancelling ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Cancelling...
                                            </span>
                                        ) : (
                                            "Yes, Cancel"
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
