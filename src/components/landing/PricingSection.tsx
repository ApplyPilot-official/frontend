"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import AnimatedSection from "@/components/AnimatedSection";

/* ─── Falling Emoji Particle ─── */
interface EmojiParticle {
    id: number;
    emoji: string;
    x: number;
    delay: number;
    duration: number;
    size: number;
    rotation: number;
}

const CELEBRATION_EMOJIS = ["📩", "💌", "🎉", "✨", "🔥", "⭐", "💎", "🚀", "🎯", "💰"];

function FallingEmojis({ active, planIndex }: { active: boolean; planIndex: number }) {
    const [particles, setParticles] = useState<EmojiParticle[]>([]);

    const spawnParticles = useCallback(() => {
        const newParticles: EmojiParticle[] = [];
        for (let i = 0; i < 12; i++) {
            newParticles.push({
                id: Date.now() + i + planIndex * 100,
                emoji: CELEBRATION_EMOJIS[Math.floor(Math.random() * CELEBRATION_EMOJIS.length)],
                x: Math.random() * 100,
                delay: Math.random() * 0.8,
                duration: 1.5 + Math.random() * 1.5,
                size: 14 + Math.random() * 14,
                rotation: Math.random() * 360,
            });
        }
        setParticles(newParticles);
    }, [planIndex]);

    useEffect(() => {
        if (active) {
            spawnParticles();
            const timer = setTimeout(() => setParticles([]), 3500);
            return () => clearTimeout(timer);
        } else {
            setParticles([]);
        }
    }, [active, spawnParticles]);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-20 rounded-2xl">
            <AnimatePresence>
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        initial={{ y: -30, x: `${p.x}%`, opacity: 1, rotate: 0, scale: 0.5 }}
                        animate={{ y: "110%", opacity: 0, rotate: p.rotation, scale: 1.2 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
                        className="absolute"
                        style={{ fontSize: `${p.size}px`, left: `${p.x}%` }}
                    >
                        {p.emoji}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

/* ─── Plan data ─── */
const studentPlans = [
    {
        name: "Starter",
        price: 35,
        originalPrice: 49,
        tagline: "Less than $1/day. You spend more on chai.",
        hook: "You spend $35 on food in a single day — why not invest $1/day in your career?",
        position: "Get started faster",
        badge: "🎁 For First Few Users",
        badgeColor: "from-accent-green to-emerald-500",
        urgencyTag: "Limited spots at this price",
        features: [
            "150–400 auto job applications/month",
            "1 resume profile",
            "Basic AI job matching",
            "AI Resume Builder",
            "AI Cover Letter Generator",
            "Basic Application Tracker",
            "ATS Score Checker",
            "ATS Score Generator",
            "Saved jobs / review before apply",
            "Chat support",
        ],
        popular: false,
        accentColor: "text-accent-green",
        accentGrad: "from-accent-green to-emerald-500",
        icon: "🌱",
    },
    {
        name: "Pro",
        price: 79,
        tagline: "The plan serious job seekers choose",
        position: "Best value for active seekers",
        badge: "⭐ MOST POPULAR",
        badgeColor: "from-primary-500 to-primary-700",
        urgencyTag: "Price increasing soon 🔥",
        features: [
            "300–700 auto job applications/month",
            "Everything in Starter",
            "3 resume profiles",
            "Smart AI matching with filters",
            "ATS Resume Optimizer",
            "Unlimited AI Mock Interviews",
            "AI bullet-point & summary rewrite",
            "Advanced AI Cover Letters",
            "Career Counseling",
            "One-time career guidance session",
            "Full application tracker + pipeline",
            "LinkedIn Profile Optimizer",
            "Premium ATS Score Generator (6 ATS)",
            "Follow-Up Automator",
            "Apply via Email",
            "Priority chat + WhatsApp support",
        ],
        popular: true,
        accentColor: "text-primary-500",
        accentGrad: "from-primary-500 to-primary-700",
        icon: "🚀",
    },
    {
        name: "Elite",
        price: 149,
        tagline: "Maximum reach. Premium AI. Zero compromise.",
        position: "Power users & premium results",
        badge: "👑 PREMIUM",
        badgeColor: "from-accent-yellow to-amber-500",
        urgencyTag: "Only 50 seats/month",
        features: [
            "500+ auto job applications/month (aggressive + human apply)",
            "Everything in Pro",
            "Unlimited resume profiles",
            "Advanced aggressive AI job targeting",
            "Unlimited AI Mock Interviews",
            "1-on-1 Career Coaching",
            "Advanced Analytics Dashboard",
            "Priority support + fastest turnaround",
            "Optional human resume review",
            "Dedicated human support",
            "Salary Insights & Negotiator",
            "Follow-Up Automator",
            "LinkedIn Auto-Apply",
        ],
        popular: false,
        accentColor: "text-accent-yellow",
        accentGrad: "from-accent-yellow to-amber-500",
        icon: "👑",
    },
];

export default function PricingSection() {
    const [tab, setTab] = useState<"students" | "business">("students");
    const [showModal, setShowModal] = useState(false);
    const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<number>(1);

    // Demo request form state
    const [demoForm, setDemoForm] = useState({ contactName: "", email: "", phone: "", companyName: "", companySize: "" });
    const [demoSubmitting, setDemoSubmitting] = useState(false);
    const [demoResult, setDemoResult] = useState<{ success?: boolean; message?: string }>({});

    useEffect(() => {
        if (window.location.hash === "#business") {
            setTab("business");
        }
    }, []);

    const handleDemoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setDemoSubmitting(true);
        setDemoResult({});
        try {
            const res = await fetch("/api/business-interest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...demoForm,
                    message: "Demo request from landing page",
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setDemoResult({ success: true, message: data.message });
                setDemoForm({ contactName: "", email: "", phone: "", companyName: "", companySize: "" });
            } else {
                setDemoResult({ success: false, message: data.error });
            }
        } catch {
            setDemoResult({ success: false, message: "Something went wrong. Please try again." });
        } finally {
            setDemoSubmitting(false);
        }
    };

    return (
        <section id="pricing" className="py-24 sm:py-32 relative overflow-hidden bg-surface-100">
            {/* CSS for animations */}
            <style jsx>{`
                @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                .shimmer-badge {
                    background-size: 200% auto;
                    animation: shimmer 3s linear infinite;
                }
                @keyframes float-tag {
                    0%, 100% { transform: translateY(0) rotate(-1deg); }
                    50% { transform: translateY(-3px) rotate(1deg); }
                }
                .float-tag { animation: float-tag 2.5s ease-in-out infinite; }
            `}</style>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <AnimatedSection className="text-center mb-12">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-sm font-medium mb-4">
                        Pricing
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-950 mb-4">
                        Simple, Affordable{" "}
                        <span className="gradient-text">Pricing</span>
                    </h2>
                    <p className="text-lg text-surface-600 max-w-2xl mx-auto">
                        Invest in your career. Every plan pays for itself with your first job offer.
                    </p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="flex items-center justify-center gap-4 mt-4 text-xs text-surface-500"
                    >
                        <span>🔒 SSL Secure Payment</span>
                        <span>•</span>
                        <span>💳 Cancel Anytime</span>
                        <span>•</span>
                        <span>🎓 40% Student Discount Applied</span>
                    </motion.div>
                </AnimatedSection>

                {/* Tabs */}
                <div className="flex justify-center mb-12">
                    <div className="bg-white rounded-full p-1 flex border border-surface-300 shadow-sm">
                        <button
                            onClick={() => setTab("students")}
                            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${tab === "students"
                                ? "glow-btn text-surface-950"
                                : "text-surface-600 hover:text-surface-900"
                                }`}
                        >
                            For Students
                        </button>
                        <button
                            id="business"
                            onClick={() => setTab("business")}
                            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${tab === "business"
                                ? "glow-btn text-surface-950"
                                : "text-surface-600 hover:text-surface-900"
                                }`}
                        >
                            For Business
                        </button>
                    </div>
                </div>

                {/* Student Plans */}
                {tab === "students" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
                    >
                        {studentPlans.map((plan, i) => {
                            const isHovered = hoveredPlan === i;
                            const isSelected = selectedPlan === i;
                            const isActive = isHovered || isSelected;

                            return (
                                <motion.div
                                    key={plan.name}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.12 }}
                                    whileHover={{ y: -12, scale: 1.03 }}
                                    onHoverStart={() => setHoveredPlan(i)}
                                    onHoverEnd={() => setHoveredPlan(null)}
                                    onClick={() => setSelectedPlan(i)}
                                    className="relative cursor-pointer"
                                >
                                    <FallingEmojis active={isSelected} planIndex={i} />

                                    {/* Badge */}
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                                        <motion.div
                                            animate={isActive ? { scale: [1, 1.1, 1], y: [0, -2, 0] } : {}}
                                            transition={{ duration: 0.6, repeat: isActive ? Infinity : 0, repeatDelay: 1.5 }}
                                            className={`shimmer-badge px-5 py-1.5 rounded-full text-xs font-bold text-surface-950 whitespace-nowrap
                                                bg-gradient-to-r ${plan.badgeColor} shadow-lg`}
                                        >
                                            {plan.badge}
                                        </motion.div>
                                    </div>

                                    {/* Urgency tag */}
                                    <div className="absolute -right-2 top-16 z-20">
                                        <motion.div
                                            className={`float-tag px-3 py-1 rounded-l-full text-[10px] font-bold text-surface-950
                                                bg-gradient-to-r ${plan.name === "Starter" ? "from-accent-green to-emerald-500" :
                                                    plan.name === "Pro" ? "from-accent-red to-orange-500" :
                                                        "from-accent-yellow to-amber-500"
                                                } shadow-lg`}
                                            initial={{ x: 10, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.5 + i * 0.2 }}
                                        >
                                            {plan.urgencyTag}
                                        </motion.div>
                                    </div>

                                    {/* Card */}
                                    <div
                                        className={`relative z-10 rounded-2xl p-6 sm:p-8 h-full flex flex-col transition-all duration-500 ${isActive
                                            ? "bg-white shadow-xl border-2 border-primary-300"
                                            : "bg-white border border-surface-300 shadow-sm"
                                            }`}
                                        style={isActive && plan.popular ? {
                                            boxShadow: "0 8px 30px rgba(66,133,244,0.15), 0 4px 16px rgba(66,133,244,0.08)",
                                        } : {}}
                                    >
                                        {/* Icon + Plan name */}
                                        <div className="flex items-center gap-3 mb-1">
                                            <motion.span
                                                className="text-2xl"
                                                animate={isActive ? { rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] } : {}}
                                                transition={{ duration: 0.5 }}
                                            >
                                                {plan.icon}
                                            </motion.span>
                                            <div>
                                                <p className="text-xs text-surface-500">{plan.position}</p>
                                                <h3 className="text-xl font-bold text-surface-950">{plan.name}</h3>
                                            </div>
                                        </div>
                                        <p className="text-xs text-surface-500 mb-5">{plan.tagline}</p>

                                        {/* Price */}
                                        <div className="flex items-baseline gap-2 mb-2">
                                            <motion.span
                                                className={`text-5xl font-extrabold bg-gradient-to-r ${plan.accentGrad} bg-clip-text text-transparent`}
                                                animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                                                transition={{ duration: 0.4 }}
                                            >
                                                ${plan.price}
                                            </motion.span>
                                            <span className="text-surface-500 text-sm">/month</span>
                                            {plan.originalPrice && (
                                                <span className="text-surface-400 text-sm line-through ml-1">
                                                    ${plan.originalPrice}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-[11px] text-surface-500 mb-6">
                                            That&apos;s just <span className={`font-bold bg-gradient-to-r ${plan.accentGrad} bg-clip-text text-transparent`}>
                                                ${(plan.price / 30).toFixed(2)}/day
                                            </span> — less than a cup of coffee ☕
                                        </p>

                                        {/* Features */}
                                        <ul className="space-y-2.5 mb-8 flex-1">
                                            {plan.features.map((feature, j) => (
                                                <motion.li
                                                    key={j}
                                                    className="flex items-start gap-2.5"
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.1 + j * 0.03 }}
                                                >
                                                    <svg className={`w-4 h-4 shrink-0 mt-0.5 ${isActive ? "text-accent-green" : "text-primary-500"} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span className={`text-xs ${isActive ? "text-surface-800" : "text-surface-600"} transition-colors`}>{feature}</span>
                                                </motion.li>
                                            ))}
                                        </ul>

                                        {/* CTA Button */}
                                        <motion.button
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            className={`w-full py-3.5 px-6 text-sm font-bold rounded-xl transition-all duration-300 relative overflow-hidden ${isActive
                                                ? `bg-gradient-to-r ${plan.accentGrad} text-surface-950 shadow-lg`
                                                : "bg-surface-100 text-surface-800 hover:bg-surface-200 border border-surface-300"
                                                }`}
                                            onClick={(e) => { e.stopPropagation(); window.location.href = "/pricing"; }}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    className="absolute inset-0 bg-white/20"
                                                    initial={{ x: "-100%" }}
                                                    animate={{ x: "200%" }}
                                                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                                                />
                                            )}
                                            <span className="relative z-10">
                                                {plan.name === "Pro" ? "🔥 Get Pro — Most Popular" :
                                                    plan.name === "Elite" ? "👑 Go Elite" :
                                                        "🌱 Get Started"}
                                            </span>
                                        </motion.button>

                                        <p className="text-center text-[10px] text-surface-500 mt-2.5">
                                            Cancel anytime · Secure payment
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}

                {/* Business Tab */}
                {tab === "business" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="max-w-2xl mx-auto"
                    >
                        <div className="bg-white rounded-2xl p-8 sm:p-12 text-center pricing-glow border border-surface-300">
                            <h3 className="text-2xl font-bold text-surface-950 mb-3">
                                Scale Your Hiring Pipeline with AI
                            </h3>
                            <p className="text-surface-600 mb-8">
                                Enterprise-grade automation for recruitment teams. Everything unlimited.
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-8 text-left">
                                {[
                                    "Unlimited auto-applies",
                                    "Unlimited resume profiles",
                                    "Advanced AI job targeting",
                                    "Dedicated account manager",
                                    "Custom API integration",
                                    "Team analytics dashboard",
                                    "Priority 24/7 support",
                                    "Custom onboarding",
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-accent-green shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-sm text-surface-700">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => { setShowModal(true); setDemoResult({}); }}
                                className="glow-btn px-10 py-4 text-base font-bold text-surface-950 rounded-full"
                            >
                                Contact Us
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Contact / Demo Request Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-surface-300"
                    >
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-surface-400 hover:text-surface-950"
                        >
                            ✕
                        </button>

                        {demoResult.success ? (
                            <div className="text-center py-6">
                                <div className="text-5xl mb-4">🎉</div>
                                <h3 className="text-xl font-bold text-surface-950 mb-2">Thank You!</h3>
                                <p className="text-sm text-surface-600">{demoResult.message}</p>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="mt-6 px-6 py-2.5 text-sm font-medium text-surface-700 bg-surface-100 rounded-xl hover:bg-surface-200 transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-xl font-bold text-surface-950 mb-2">Request a Demo</h3>
                                <p className="text-sm text-surface-600 mb-6">
                                    Fill in your details and we&apos;ll reach out within 24 hours.
                                </p>
                                <form className="space-y-4" onSubmit={handleDemoSubmit}>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        required
                                        value={demoForm.contactName}
                                        onChange={(e) => setDemoForm({ ...demoForm, contactName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-surface-300 text-surface-900 text-sm placeholder:text-surface-500 outline-none focus:ring-2 focus:ring-primary-300"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Company Name"
                                        required
                                        value={demoForm.companyName}
                                        onChange={(e) => setDemoForm({ ...demoForm, companyName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-surface-300 text-surface-900 text-sm placeholder:text-surface-500 outline-none focus:ring-2 focus:ring-primary-300"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Work Email"
                                        required
                                        value={demoForm.email}
                                        onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-surface-300 text-surface-900 text-sm placeholder:text-surface-500 outline-none focus:ring-2 focus:ring-primary-300"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Phone Number"
                                        value={demoForm.phone}
                                        onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-surface-300 text-surface-900 text-sm placeholder:text-surface-500 outline-none focus:ring-2 focus:ring-primary-300"
                                    />
                                    <select
                                        required
                                        value={demoForm.companySize}
                                        onChange={(e) => setDemoForm({ ...demoForm, companySize: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-surface-300 text-surface-900 text-sm outline-none focus:ring-2 focus:ring-primary-300"
                                    >
                                        <option value="">Company Size</option>
                                        <option value="1-10">1–10 employees</option>
                                        <option value="11-50">11–50 employees</option>
                                        <option value="51-200">51–200 employees</option>
                                        <option value="201-500">201–500 employees</option>
                                        <option value="500+">500+ employees</option>
                                    </select>
                                    {demoResult.message && !demoResult.success && (
                                        <p className="text-sm text-red-400">{demoResult.message}</p>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={demoSubmitting}
                                        className="glow-btn w-full py-3 text-sm font-bold text-surface-950 rounded-xl disabled:opacity-60"
                                    >
                                        {demoSubmitting ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-surface-950 border-t-transparent rounded-full animate-spin" />
                                                Submitting...
                                            </span>
                                        ) : (
                                            "Request a Demo"
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </section>
    );
}
