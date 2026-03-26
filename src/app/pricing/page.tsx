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
                ? "bg-gradient-to-br from-accent-green via-emerald-400 to-teal-500"
                : !canSelect
                    ? "bg-surface-200 opacity-60"
                    : plan.highlighted
                        ? "bg-gradient-to-br from-primary-500 via-primary-400 to-violet-500"
                        : isSelected
                            ? "bg-gradient-to-br from-primary-500 to-primary-400"
                            : "bg-surface-300"
                } ${canSelect ? "cursor-pointer" : "cursor-default"}`}
        >
            {/* Badge */}
            {isCurrent ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-accent-green to-teal-400 text-white text-xs font-bold rounded-full shadow-lg z-10">
                    ✓ Current Plan
                </div>
            ) : plan.badge && canSelect ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary-500 to-accent-green text-white text-xs font-bold rounded-full shadow-lg z-10">
                    {plan.badge}
                </div>
            ) : null}

            <div
                className={`rounded-2xl p-6 h-full ${isCurrent
                    ? "bg-surface-100 ring-2 ring-accent-green/50"
                    : isSelected && canSelect
                        ? "bg-surface-100 ring-2 ring-primary-500/50"
                        : "bg-white"
                    }`}
            >
                <h3 className="text-lg font-bold text-surface-950 mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-bold text-surface-950">${plan.price}</span>
                    <span className="text-surface-600 text-sm">/month</span>
                </div>
                <ul className="space-y-2 mb-6">
                    {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-surface-700">
                            <svg className="w-4 h-4 text-accent-green shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            {f}
                        </li>
                    ))}
                </ul>
                <div
                    className={`w-full py-2.5 text-center rounded-xl text-sm font-semibold transition-all ${isCurrent
                        ? "bg-green-50 text-accent-green border border-accent-green/30"
                        : isDowngrade
                            ? "bg-white text-surface-600"
                            : isSelected
                                ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25"
                                : "bg-surface-200 text-surface-700 hover:bg-surface-300"
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

    // Business interest form state
    const [bizForm, setBizForm] = useState({
        contactName: "",
        companyName: "",
        email: "",
        phone: "",
        companySize: "",
        message: "",
    });
    const [bizSubmitting, setBizSubmitting] = useState(false);
    const [bizResult, setBizResult] = useState<{ success?: boolean; message?: string }>({});

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
            <div className="min-h-screen flex items-center justify-center bg-surface-100">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-100 pt-28 pb-20">
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
                    <h1 className="text-4xl sm:text-5xl font-bold text-surface-950 mb-4">
                        {hasActivePlan ? (
                            <>Upgrade Your <span className="gradient-text">Plan</span></>
                        ) : (
                            <>Choose Your <span className="gradient-text">Plan</span></>
                        )}
                    </h1>
                    <p className="text-lg text-surface-600 max-w-2xl mx-auto">
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
                        <div className="bg-white rounded-2xl p-6 border border-surface-300">
                            {/* Coupon Code */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-surface-700 mb-2">
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
                                        className="flex-1 px-4 py-2.5 bg-surface-100 border border-surface-300 rounded-xl text-surface-950 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm uppercase tracking-wider"
                                    />
                                    <button
                                        onClick={validateCoupon}
                                        disabled={isValidating || !couponCode.trim()}
                                        className="px-5 py-2.5 bg-surface-200 text-surface-950 rounded-xl text-sm font-medium hover:bg-surface-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                                            className="mt-2 text-sm text-accent-green flex items-center gap-1"
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
                            <div className="border-t border-surface-300 pt-4 mb-6 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-surface-600">
                                        {hasActivePlan ? `Upgrade to ${plan.name}` : `${plan.name} Plan`}
                                    </span>
                                    <span className="text-surface-950">${plan.price}/mo</span>
                                </div>
                                {discountDisplay && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-accent-green">Coupon Discount</span>
                                        <span className="text-accent-green">-{discountDisplay}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-base font-bold pt-2 border-t border-surface-300">
                                    <span className="text-surface-950">Total</span>
                                    <span className="text-surface-950">
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
                                <p className="text-xs text-surface-500">
                                    Payment processed in USD via Razorpay
                                </p>
                            </div>

                            {/* Pay Button */}
                            <button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className="w-full py-3.5 px-6 text-sm font-bold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                {isProcessing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Processing...
                                    </span>
                                ) : (() => {
                                    const finalPrice = (
                                        plan.price -
                                        (couponStatus.valid && couponStatus.discountCents
                                            ? couponStatus.discountCents / 100
                                            : 0)
                                    ).toFixed(2);
                                    return hasActivePlan
                                        ? `⬆️ Upgrade to ${plan.name} — $${finalPrice}/mo`
                                        : `Subscribe to ${plan.name} — $${finalPrice}/mo`;
                                })()}
                            </button>

                            {paymentError && (
                                <p className="mt-3 text-sm text-red-400 text-center">
                                    {paymentError}
                                </p>
                            )}

                            <p className="text-center text-xs text-surface-500 mt-4">
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
                        <div className="bg-white rounded-2xl p-8 border border-green-200">
                            <span className="text-4xl mb-3 block">👑</span>
                            <h3 className="text-xl font-bold text-surface-950 mb-2">You&apos;re on Elite!</h3>
                            <p className="text-sm text-surface-600">
                                You have access to every feature ApplyPilot offers. Enjoy the full experience!
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Business / Enterprise Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="max-w-2xl mx-auto mt-16"
                >
                    <div className="text-center mb-8">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-violet-500/10 text-violet-500 text-sm font-medium mb-4 border border-violet-500/20">
                            For Businesses
                        </span>
                        <h2 className="text-3xl font-bold text-surface-950 mb-3">
                            Need a <span className="gradient-text">Custom Solution</span>?
                        </h2>
                        <p className="text-surface-600">
                            Looking to automate hiring or bulk-apply for your team? Share your details and we&apos;ll craft a tailored plan for your organization.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-surface-300 shadow-sm">
                        {bizResult.success ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                <div className="text-5xl mb-4">🎉</div>
                                <h3 className="text-xl font-bold text-surface-950 mb-2">Thank You!</h3>
                                <p className="text-surface-600 text-sm">{bizResult.message}</p>
                            </motion.div>
                        ) : (
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    setBizSubmitting(true);
                                    setBizResult({});
                                    try {
                                        const res = await fetch("/api/business-interest", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify(bizForm),
                                        });
                                        const data = await res.json();
                                        if (res.ok) {
                                            setBizResult({ success: true, message: data.message });
                                        } else {
                                            setBizResult({ success: false, message: data.error });
                                        }
                                    } catch {
                                        setBizResult({ success: false, message: "Something went wrong. Please try again." });
                                    } finally {
                                        setBizSubmitting(false);
                                    }
                                }}
                                className="space-y-4"
                            >
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-surface-600 mb-1">Your Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={bizForm.contactName}
                                            onChange={(e) => setBizForm({ ...bizForm, contactName: e.target.value })}
                                            placeholder="John Smith"
                                            className="w-full px-4 py-2.5 bg-surface-100 border border-surface-300 rounded-xl text-surface-950 placeholder-surface-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-surface-600 mb-1">Company Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={bizForm.companyName}
                                            onChange={(e) => setBizForm({ ...bizForm, companyName: e.target.value })}
                                            placeholder="Acme Corp"
                                            className="w-full px-4 py-2.5 bg-surface-100 border border-surface-300 rounded-xl text-surface-950 placeholder-surface-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                                        />
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-surface-600 mb-1">Business Email *</label>
                                        <input
                                            type="email"
                                            required
                                            value={bizForm.email}
                                            onChange={(e) => setBizForm({ ...bizForm, email: e.target.value })}
                                            placeholder="john@acme.com"
                                            className="w-full px-4 py-2.5 bg-surface-100 border border-surface-300 rounded-xl text-surface-950 placeholder-surface-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-surface-600 mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            value={bizForm.phone}
                                            onChange={(e) => setBizForm({ ...bizForm, phone: e.target.value })}
                                            placeholder="+1 (555) 000-0000"
                                            className="w-full px-4 py-2.5 bg-surface-100 border border-surface-300 rounded-xl text-surface-950 placeholder-surface-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-surface-600 mb-1">Company Size *</label>
                                    <select
                                        required
                                        value={bizForm.companySize}
                                        onChange={(e) => setBizForm({ ...bizForm, companySize: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-surface-100 border border-surface-300 rounded-xl text-surface-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                                    >
                                        <option value="">Select company size</option>
                                        <option value="1-10">1–10 employees</option>
                                        <option value="11-50">11–50 employees</option>
                                        <option value="51-200">51–200 employees</option>
                                        <option value="201-500">201–500 employees</option>
                                        <option value="500+">500+ employees</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-surface-600 mb-1">Tell us about your needs</label>
                                    <textarea
                                        value={bizForm.message}
                                        onChange={(e) => setBizForm({ ...bizForm, message: e.target.value })}
                                        placeholder="How can we help your organization?"
                                        rows={3}
                                        className="w-full px-4 py-2.5 bg-surface-100 border border-surface-300 rounded-xl text-surface-950 placeholder-surface-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
                                    />
                                </div>
                                {bizResult.message && !bizResult.success && (
                                    <p className="text-sm text-red-400">{bizResult.message}</p>
                                )}
                                <button
                                    type="submit"
                                    disabled={bizSubmitting}
                                    className="w-full py-3.5 px-6 text-sm font-bold text-white bg-gradient-to-r from-violet-500 to-violet-600 rounded-xl hover:shadow-lg hover:shadow-violet-500/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                >
                                    {bizSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Submitting...
                                        </span>
                                    ) : (
                                        "🏢 Get a Custom Business Plan"
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* ── Manual Payment Fallback ────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="max-w-3xl mx-auto mt-16"
            >
                <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/60 rounded-2xl border border-amber-200/60 p-8 sm:p-10 relative overflow-hidden">
                    {/* Decorative corner */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/40 rounded-bl-[80px]" />

                    <div className="relative">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 border border-amber-200 rounded-full text-xs font-medium text-amber-700 mb-4">
                                💳 Alternative Payment Methods
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-surface-950 mb-2">
                                Facing issues with payment?
                            </h3>
                            <p className="text-sm text-surface-600 max-w-lg mx-auto">
                                If your card or Razorpay payment fails, you can still upgrade using the manual options below.
                            </p>
                        </div>

                        {/* Payment Options Grid */}
                        <div className="grid sm:grid-cols-3 gap-4 mb-8">
                            {/* UPI */}
                            <div className="bg-white rounded-xl border border-surface-300 p-5 text-center hover:border-primary-300 transition-colors">
                                <div className="text-2xl mb-2">🇮🇳</div>
                                <h4 className="text-sm font-bold text-surface-950 mb-1">UPI Payment</h4>
                                <p className="text-xs text-surface-500 mb-3">For India users</p>
                                <div className="bg-surface-100 rounded-lg px-3 py-2 mb-3">
                                    <code className="text-xs text-surface-800 font-medium select-all">ryan2837@paytm</code>
                                </div>
                                <button
                                    onClick={() => { navigator.clipboard.writeText("ryan2837@paytm"); }}
                                    className="text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors flex items-center gap-1 mx-auto"
                                >
                                    📋 Copy UPI ID
                                </button>
                            </div>

                            {/* PayPal */}
                            <div className="bg-white rounded-xl border border-surface-300 p-5 text-center hover:border-primary-300 transition-colors">
                                <div className="text-2xl mb-2">🅿️</div>
                                <h4 className="text-sm font-bold text-surface-950 mb-1">PayPal</h4>
                                <p className="text-xs text-surface-500 mb-3">International</p>
                                <div className="bg-surface-100 rounded-lg px-3 py-2 mb-3">
                                    <code className="text-xs text-surface-800 font-medium select-all">peenu000@gmail.com</code>
                                </div>
                                <button
                                    onClick={() => { navigator.clipboard.writeText("peenu000@gmail.com"); }}
                                    className="text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors flex items-center gap-1 mx-auto"
                                >
                                    📋 Copy Email
                                </button>
                            </div>

                            {/* Remitly */}
                            <div className="bg-white rounded-xl border border-surface-300 p-5 text-center hover:border-primary-300 transition-colors">
                                <div className="text-2xl mb-2">🌍</div>
                                <h4 className="text-sm font-bold text-surface-950 mb-1">Remitly</h4>
                                <p className="text-xs text-surface-500 mb-3">International Transfer</p>
                                <div className="bg-surface-100 rounded-lg px-3 py-2 mb-3">
                                    <p className="text-xs text-surface-600">Contact support for transfer details</p>
                                </div>
                                <a
                                    href="mailto:contact@applypilot.us?subject=Remitly Payment Details"
                                    className="text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors flex items-center gap-1 mx-auto"
                                >
                                    ✉️ Request Details
                                </a>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-white rounded-xl border border-surface-300 p-5 mb-6">
                            <h4 className="text-sm font-bold text-surface-950 mb-3 flex items-center gap-2">
                                📝 After making payment:
                            </h4>
                            <div className="grid sm:grid-cols-3 gap-3">
                                <div className="flex items-start gap-2.5">
                                    <span className="w-6 h-6 rounded-full bg-primary-50 border border-primary-200 flex items-center justify-center text-xs font-bold text-primary-600 flex-shrink-0">1</span>
                                    <p className="text-xs text-surface-600">Take a screenshot or save your transaction proof</p>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <span className="w-6 h-6 rounded-full bg-primary-50 border border-primary-200 flex items-center justify-center text-xs font-bold text-primary-600 flex-shrink-0">2</span>
                                    <p className="text-xs text-surface-600">Go to Helpdesk and submit your payment proof</p>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <span className="w-6 h-6 rounded-full bg-primary-50 border border-primary-200 flex items-center justify-center text-xs font-bold text-primary-600 flex-shrink-0">3</span>
                                    <p className="text-xs text-surface-600">Our team will verify and activate your plan within 4 hours</p>
                                </div>
                            </div>
                        </div>

                        {/* Support CTAs */}
                        <div className="flex flex-wrap items-center justify-center gap-3 mb-5">
                            <a
                                href="/dashboard?tab=helpdesk"
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:shadow-lg hover:shadow-primary-500/20 hover:-translate-y-0.5 transition-all"
                            >
                                🎫 Submit Payment Proof
                            </a>
                            <a
                                href="https://wa.me/91857205555865"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 rounded-xl hover:shadow-lg hover:shadow-green-500/20 hover:-translate-y-0.5 transition-all"
                            >
                                💬 Chat on WhatsApp
                            </a>
                            <a
                                href="mailto:contact@applypilot.us"
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-surface-700 bg-white border border-surface-300 rounded-xl hover:bg-surface-100 transition-all"
                            >
                                ✉️ contact@applypilot.us
                            </a>
                        </div>

                        {/* Trust badge */}
                        <p className="text-center text-xs text-surface-500 flex items-center justify-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                            100% secure. Manual payments are verified before activation.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
