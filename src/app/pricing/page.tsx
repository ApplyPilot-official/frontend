"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { PLANS, PLAN_ORDER } from "@/lib/plans";
import type { PlanType, PlanConfig } from "@/lib/plans";

declare global {
    interface Window {
        Razorpay: new (options: Record<string, unknown>) => {
            open: () => void;
            on: (event: string, callback: () => void) => void;
        };
    }
}

type PlanStatus = "current" | "downgrade" | "upgrade" | "available";

function PlanCard({
    plan,
    isSelected,
    planStatus,
    onSelect,
}: {
    plan: PlanConfig;
    isSelected: boolean;
    planStatus: PlanStatus;
    onSelect: () => void;
}) {
    const isCurrent = planStatus === "current";
    const isDowngrade = planStatus === "downgrade";
    const canSelect = !isCurrent && !isDowngrade;

    return (
        <motion.div
            whileHover={canSelect ? { y: -4, scale: 1.01 } : {}}
            onClick={() => canSelect && onSelect()}
            className={`relative rounded-2xl p-[2px] transition-all duration-300 ${isCurrent
                ? "bg-gradient-to-br from-neon-emerald via-emerald-400 to-teal-500"
                : !canSelect
                    ? "bg-dark-50/30 opacity-60"
                    : plan.highlighted
                        ? "bg-gradient-to-br from-neon-blue via-primary-400 to-neon-violet"
                        : isSelected
                            ? "bg-gradient-to-br from-primary-500 to-primary-400"
                            : "bg-dark-50/50"
                } ${canSelect ? "cursor-pointer" : "cursor-default"}`}
        >
            {/* Badge */}
            {isCurrent ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-neon-emerald to-teal-400 text-white text-xs font-bold rounded-full shadow-lg z-10">
                    ✓ Current Plan
                </div>
            ) : plan.badge && canSelect ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-neon-blue to-neon-violet text-white text-xs font-bold rounded-full shadow-lg z-10">
                    {plan.badge}
                </div>
            ) : null}

            <div
                className={`rounded-2xl p-6 h-full ${isCurrent
                    ? "bg-dark-300 ring-2 ring-neon-emerald/50"
                    : isSelected && canSelect
                        ? "bg-dark-300 ring-2 ring-primary-500/50"
                        : "bg-dark-400"
                    }`}
            >
                <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                    <span className="text-slate-400 text-sm">/month</span>
                </div>
                <ul className="space-y-2 mb-6">
                    {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                            <svg className="w-4 h-4 text-neon-emerald shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            {f}
                        </li>
                    ))}
                </ul>
                <div
                    className={`w-full py-2.5 text-center rounded-xl text-sm font-semibold transition-all ${isCurrent
                        ? "bg-neon-emerald/10 text-neon-emerald border border-neon-emerald/30"
                        : isDowngrade
                            ? "bg-dark-500 text-slate-600"
                            : isSelected
                                ? "bg-gradient-to-r from-neon-blue to-primary-500 text-white shadow-lg shadow-primary-500/25"
                                : "bg-dark-200 text-slate-300 hover:bg-dark-100"
                        }`}
                >
                    {isCurrent
                        ? "✓ Active"
                        : isDowngrade
                            ? "Included in your plan"
                            : isSelected
                                ? "✓ Selected"
                                : "Upgrade"}
                </div>
            </div>
        </motion.div>
    );
}

export default function PricingPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState<PlanType>("pro");
    const [currentPlan, setCurrentPlan] = useState<string | null>(null);
    const [isLoadingPlan, setIsLoadingPlan] = useState(true);
    const [couponCode, setCouponCode] = useState("");
    const [couponStatus, setCouponStatus] = useState<{
        valid?: boolean;
        message?: string;
        discountCents?: number;
        error?: string;
    }>({});
    const [isValidating, setIsValidating] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState("");

    // Fetch user's current plan
    const fetchUserPlan = useCallback(async () => {
        if (!session?.user?.email) {
            setIsLoadingPlan(false);
            return;
        }
        try {
            const res = await fetch(`/api/user/status?email=${encodeURIComponent(session.user.email)}`);
            if (res.ok) {
                const data = await res.json();
                const plan = data.subscriptionPlan || "none";
                setCurrentPlan(plan);
                // Auto-select the next upgrade plan
                if (plan !== "none") {
                    const currentIndex = PLAN_ORDER.indexOf(plan as PlanType);
                    if (currentIndex < PLAN_ORDER.length - 1) {
                        setSelectedPlan(PLAN_ORDER[currentIndex + 1]);
                    } else {
                        setSelectedPlan(PLAN_ORDER[PLAN_ORDER.length - 1]);
                    }
                }
            }
        } catch (err) {
            console.error("Failed to fetch plan:", err);
        } finally {
            setIsLoadingPlan(false);
        }
    }, [session?.user?.email]);

    useEffect(() => {
        fetchUserPlan();
    }, [fetchUserPlan]);

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    // Determine the status of each plan relative to the user's current plan
    const getPlanStatus = (planId: PlanType): PlanStatus => {
        if (!currentPlan || currentPlan === "none") return "available";
        const currentIndex = PLAN_ORDER.indexOf(currentPlan as PlanType);
        const planIndex = PLAN_ORDER.indexOf(planId);
        if (planIndex === currentIndex) return "current";
        if (planIndex < currentIndex) return "downgrade";
        return "upgrade";
    };

    const validateCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsValidating(true);
        setCouponStatus({});

        try {
            const res = await fetch("/api/coupon/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: couponCode }),
            });
            const data = await res.json();

            if (res.ok) {
                setCouponStatus({
                    valid: true,
                    message: data.message,
                    discountCents: data.discountAmountCents,
                });
            } else {
                setCouponStatus({ error: data.error });
            }
        } catch {
            setCouponStatus({ error: "Failed to validate coupon" });
        } finally {
            setIsValidating(false);
        }
    };

    const handlePayment = async () => {
        if (!session?.user?.email) {
            router.push("/login");
            return;
        }

        // Don't allow purchasing current or lower plan
        const status = getPlanStatus(selectedPlan);
        if (status === "current" || status === "downgrade") return;

        setIsProcessing(true);
        setPaymentError("");

        try {
            // Step 1: Create order on server
            const orderRes = await fetch("/api/payment/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    planId: selectedPlan,
                    couponCode: couponStatus.valid ? couponCode : undefined,
                }),
            });

            const orderData = await orderRes.json();

            if (!orderRes.ok) {
                setPaymentError(orderData.error || "Failed to create order");
                setIsProcessing(false);
                return;
            }

            // Step 2: Open Razorpay checkout
            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "ApplyPilot",
                description: `${orderData.planName} Plan Subscription`,
                order_id: orderData.orderId,
                prefill: {
                    email: session.user.email,
                    name: session.user.name || "",
                },
                theme: {
                    color: "#0891b2",
                    backdrop_color: "rgba(0,0,0,0.7)",
                },
                handler: async function (response: {
                    razorpay_order_id: string;
                    razorpay_payment_id: string;
                    razorpay_signature: string;
                }) {
                    // Step 3: Verify payment on server
                    try {
                        const verifyRes = await fetch("/api/payment/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        const verifyData = await verifyRes.json();

                        if (verifyRes.ok) {
                            router.push("/payment/success");
                        } else {
                            setPaymentError(
                                verifyData.error || "Payment verification failed"
                            );
                        }
                    } catch {
                        setPaymentError("Payment verification failed. Please contact support.");
                    }
                    setIsProcessing(false);
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false);
                    },
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch {
            setPaymentError("Something went wrong. Please try again.");
            setIsProcessing(false);
        }
    };

    const plan = PLANS[selectedPlan];
    const selectedPlanStatus = getPlanStatus(selectedPlan);
    const canPurchase = selectedPlanStatus === "upgrade" || selectedPlanStatus === "available";
    const hasActivePlan = currentPlan && currentPlan !== "none";
    const isMaxPlan = currentPlan === "elite";
    const discountDisplay = couponStatus.valid && couponStatus.discountCents
        ? `$${(couponStatus.discountCents / 100).toFixed(2)}`
        : null;

    if (isLoadingPlan) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-700">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-700 pt-28 pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary-500/10 text-primary-400 text-sm font-medium mb-4 border border-primary-500/20">
                        Pricing
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                        {hasActivePlan ? (
                            <>Upgrade Your <span className="gradient-text">Plan</span></>
                        ) : (
                            <>Choose Your <span className="gradient-text">Plan</span></>
                        )}
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        {hasActivePlan
                            ? `You're on the ${PLANS[currentPlan as PlanType]?.name || currentPlan} plan. ${isMaxPlan ? "You're on the top tier! 🎉" : "Upgrade to unlock more features."}`
                            : "Start automating your job applications today. Cancel anytime."
                        }
                    </p>
                </motion.div>

                {/* Plan Cards */}
                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
                    {PLAN_ORDER.map((planId, i) => {
                        const status = getPlanStatus(planId);
                        return (
                            <motion.div
                                key={planId}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <PlanCard
                                    plan={PLANS[planId]}
                                    isSelected={selectedPlan === planId}
                                    planStatus={status}
                                    onSelect={() => setSelectedPlan(planId)}
                                />
                            </motion.div>
                        );
                    })}
                </div>

                {/* Payment Section — only show if user can purchase (not max plan) */}
                {canPurchase && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="max-w-lg mx-auto"
                    >
                        <div className="bg-dark-400 rounded-2xl p-6 border border-dark-50/30">
                            {/* Coupon Code */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Have a coupon or referral code?
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => {
                                            setCouponCode(e.target.value.toUpperCase());
                                            setCouponStatus({});
                                        }}
                                        placeholder="Enter code"
                                        className="flex-1 px-4 py-2.5 bg-dark-600 border border-dark-50/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm uppercase tracking-wider"
                                    />
                                    <button
                                        onClick={validateCoupon}
                                        disabled={isValidating || !couponCode.trim()}
                                        className="px-5 py-2.5 bg-dark-200 text-white rounded-xl text-sm font-medium hover:bg-dark-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isValidating ? "..." : "Apply"}
                                    </button>
                                </div>
                                <AnimatePresence mode="wait">
                                    {couponStatus.valid && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="mt-2 text-sm text-neon-emerald flex items-center gap-1"
                                        >
                                            ✓ {couponStatus.message}
                                        </motion.p>
                                    )}
                                    {couponStatus.error && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="mt-2 text-sm text-red-400"
                                        >
                                            ✕ {couponStatus.error}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Order Summary */}
                            <div className="border-t border-dark-50/30 pt-4 mb-6 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">
                                        {hasActivePlan ? `Upgrade to ${plan.name}` : `${plan.name} Plan`}
                                    </span>
                                    <span className="text-white">${plan.price}/mo</span>
                                </div>
                                {discountDisplay && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neon-emerald">Coupon Discount</span>
                                        <span className="text-neon-emerald">-{discountDisplay}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-base font-bold pt-2 border-t border-dark-50/20">
                                    <span className="text-white">Total</span>
                                    <span className="text-white">
                                        $
                                        {(
                                            plan.price -
                                            (couponStatus.valid && couponStatus.discountCents
                                                ? couponStatus.discountCents / 100
                                                : 0)
                                        ).toFixed(2)}
                                        /mo
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500">
                                    Payment processed in INR (₹{(plan.priceINR - (couponStatus.valid && couponStatus.discountCents ? couponStatus.discountCents * 1 : 0)).toLocaleString()}) via Razorpay
                                </p>
                            </div>

                            {/* Pay Button */}
                            <button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className="w-full py-3.5 px-6 text-sm font-bold text-white bg-gradient-to-r from-neon-blue to-primary-500 rounded-xl hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                {isProcessing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Processing...
                                    </span>
                                ) : (
                                    hasActivePlan
                                        ? `⬆️ Upgrade to ${plan.name} — $${plan.price}/mo`
                                        : `Subscribe to ${plan.name} — $${plan.price}/mo`
                                )}
                            </button>

                            {paymentError && (
                                <p className="mt-3 text-sm text-red-400 text-center">
                                    {paymentError}
                                </p>
                            )}

                            <p className="text-center text-xs text-slate-500 mt-4">
                                🔒 Secured by Razorpay · Cancel anytime
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Max plan message */}
                {isMaxPlan && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="max-w-lg mx-auto text-center"
                    >
                        <div className="bg-dark-400 rounded-2xl p-8 border border-neon-emerald/20">
                            <span className="text-4xl mb-3 block">👑</span>
                            <h3 className="text-xl font-bold text-white mb-2">You&apos;re on Elite!</h3>
                            <p className="text-sm text-slate-400">
                                You have access to every feature ApplyPilot offers. Enjoy the full experience!
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
