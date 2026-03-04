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

/* ─── Animated Fire Border ─── */
function FireBorder({ active, color }: { active: boolean; color: string }) {
    return (
        <AnimatePresence>
            {active && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute -inset-[2px] rounded-2xl z-0"
                    style={{
                        background: `conic-gradient(from var(--fire-angle, 0deg), ${color}, transparent 40%, ${color} 50%, transparent 90%, ${color})`,
                        animation: "fireRotate 3s linear infinite",
                    }}
                />
            )}
        </AnimatePresence>
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
        badgeColor: "from-emerald-500 to-teal-400",
        urgencyTag: "Limited spots at this price",
        features: [
            "Up to 20 auto-applies/day",
            "1 resume profile",
            "Basic AI job matching",
            "AI Resume Builder",
            "AI Cover Letter Generator",
            "Basic Application Tracker",
            "ATS Score Generator",
            "Saved jobs / review before apply",
            "Email support",
        ],
        popular: false,
        fireColor: "rgba(16,185,129,0.7)",
        accentGrad: "from-emerald-400 to-teal-300",
        icon: "🌱",
    },
    {
        name: "Pro",
        price: 79,
        tagline: "The plan serious job seekers choose",
        position: "Best value for active seekers",
        badge: "⭐ MOST POPULAR",
        badgeColor: "from-neon-blue to-neon-violet",
        urgencyTag: "Price increasing soon 🔥",
        features: [
            "Up to 75 auto-applies/day",
            "3 resume profiles",
            "Smart AI matching with filters",
            "ATS Resume Optimizer",
            "AI bullet-point & summary rewrite",
            "AI Cover Letters",
            "Full application tracker + pipeline",
            "Browser extension / one-click apply",
            "LinkedIn Profile Optimizer",
            "ATS Score Generator",
            "Priority email & chat support",
        ],
        popular: true,
        fireColor: "rgba(0,212,255,0.7)",
        accentGrad: "from-cyan-400 to-violet-400",
        icon: "🚀",
    },
    {
        name: "Elite",
        price: 149,
        tagline: "Maximum reach. Premium AI. Zero compromise.",
        position: "Power users & premium results",
        badge: "👑 PREMIUM",
        badgeColor: "from-amber-500 to-orange-400",
        urgencyTag: "Only 50 seats/month",
        features: [
            "Up to 150 auto-applies/day",
            "5 resume profiles",
            "Advanced AI job targeting",
            "AI Resume Builder + ATS Optimizer",
            "AI Cover Letters",
            "AI Mock Interview",
            "Hiring Manager/Contact Finder",
            "Advanced analytics dashboard",
            "Priority support + fast turnaround",
            "Optional human resume review add-on",
            "ATS Score Generator",
        ],
        popular: false,
        fireColor: "rgba(245,158,11,0.7)",
        accentGrad: "from-amber-400 to-orange-300",
        icon: "👑",
    },
];

export default function PricingSection() {
    const [tab, setTab] = useState<"students" | "business">("students");
    const [showModal, setShowModal] = useState(false);
    const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<number>(1); // Pro selected by default

    // Auto-select business tab when navigating via #business hash
    useEffect(() => {
        if (window.location.hash === "#business") {
            setTab("business");
        }
    }, []);

    return (
        <section id="pricing" className="py-24 sm:py-32 relative overflow-hidden">
            {/* Background Blurs */}
            <div className="absolute bottom-20 left-0 w-96 h-96 bg-neon-violet rounded-full filter blur-[150px] opacity-[0.06]" />
            <div className="absolute top-20 right-0 w-80 h-80 bg-neon-blue rounded-full filter blur-[150px] opacity-[0.04]" />

            {/* CSS for fire rotation */}
            <style jsx>{`
                @property --fire-angle {
                    syntax: '<angle>';
                    inherits: false;
                    initial-value: 0deg;
                }
                @keyframes fireRotate {
                    to { --fire-angle: 360deg; }
                }
                @keyframes pulseGlow {
                    0%, 100% { box-shadow: 0 0 20px rgba(0,212,255,0.15), 0 0 40px rgba(168,85,247,0.1); }
                    50% { box-shadow: 0 0 40px rgba(0,212,255,0.3), 0 0 80px rgba(168,85,247,0.2); }
                }
                @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                .shimmer-badge {
                    background-size: 200% auto;
                    animation: shimmer 3s linear infinite;
                }
                .pulse-glow {
                    animation: pulseGlow 2s ease-in-out infinite;
                }
                @keyframes float-tag {
                    0%, 100% { transform: translateY(0) rotate(-1deg); }
                    50% { transform: translateY(-3px) rotate(1deg); }
                }
                .float-tag {
                    animation: float-tag 2.5s ease-in-out infinite;
                }
            `}</style>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <AnimatedSection className="text-center mb-12">
                    <span className="inline-block px-4 py-1.5 rounded-full glass text-neon-blue text-sm font-medium mb-4">
                        Pricing
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                        Simple, Affordable{" "}
                        <span className="gradient-text">Pricing</span>
                    </h2>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Invest in your career. Every plan pays for itself with your first job offer.
                    </p>

                    {/* Trust line */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-500"
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
                    <div className="glass rounded-full p-1 flex">
                        <button
                            onClick={() => setTab("students")}
                            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${tab === "students"
                                ? "glow-btn text-white"
                                : "text-slate-400 hover:text-white"
                                }`}
                        >
                            For Students
                        </button>
                        <button
                            id="business"
                            onClick={() => setTab("business")}
                            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${tab === "business"
                                ? "glow-btn text-white"
                                : "text-slate-400 hover:text-white"
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
                                    {/* Fire border effect */}
                                    <FireBorder active={isActive} color={plan.fireColor} />

                                    {/* Falling emojis on select */}
                                    <FallingEmojis active={isSelected} planIndex={i} />

                                    {/* Badge */}
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                                        <motion.div
                                            animate={isActive ? { scale: [1, 1.1, 1], y: [0, -2, 0] } : {}}
                                            transition={{ duration: 0.6, repeat: isActive ? Infinity : 0, repeatDelay: 1.5 }}
                                            className={`shimmer-badge px-5 py-1.5 rounded-full text-xs font-bold text-white whitespace-nowrap
                                                bg-gradient-to-r ${plan.badgeColor} shadow-lg`}
                                        >
                                            {plan.badge}
                                        </motion.div>
                                    </div>

                                    {/* Urgency tag */}
                                    <div className="absolute -right-2 top-16 z-20">
                                        <motion.div
                                            className={`float-tag px-3 py-1 rounded-l-full text-[10px] font-bold text-white
                                                bg-gradient-to-r ${plan.name === "Starter" ? "from-emerald-600 to-teal-500" :
                                                    plan.name === "Pro" ? "from-red-500 to-orange-500" :
                                                        "from-amber-600 to-yellow-500"
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
                                            ? "bg-[#0d1528]/95 backdrop-blur-xl shadow-2xl"
                                            : "glass-card"
                                            }`}
                                        style={isActive ? {
                                            boxShadow: `0 0 40px ${plan.fireColor.replace("0.7", "0.15")}, 0 20px 60px rgba(0,0,0,0.5)`,
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
                                                <p className="text-xs text-slate-500">{plan.position}</p>
                                                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-400 mb-5">{plan.tagline}</p>

                                        {/* Price */}
                                        <div className="flex items-baseline gap-2 mb-2">
                                            <motion.span
                                                className={`text-5xl font-extrabold bg-gradient-to-r ${plan.accentGrad} bg-clip-text text-transparent`}
                                                animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                                                transition={{ duration: 0.4 }}
                                            >
                                                ${plan.price}
                                            </motion.span>
                                            <span className="text-slate-500 text-sm">/month</span>
                                            {plan.originalPrice && (
                                                <span className="text-slate-600 text-sm line-through ml-1">
                                                    ${plan.originalPrice}
                                                </span>
                                            )}
                                        </div>

                                        {/* Per-day cost */}
                                        <p className="text-[11px] text-slate-500 mb-6">
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
                                                    <svg className={`w-4 h-4 shrink-0 mt-0.5 ${isActive ? "text-emerald-400" : "text-neon-blue"} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span className={`text-xs ${isActive ? "text-slate-200" : "text-slate-300"} transition-colors`}>{feature}</span>
                                                </motion.li>
                                            ))}
                                        </ul>

                                        {/* CTA Button */}
                                        <motion.button
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            className={`w-full py-3.5 px-6 text-sm font-bold rounded-xl transition-all duration-300 relative overflow-hidden ${isActive
                                                ? `bg-gradient-to-r ${plan.accentGrad} text-black shadow-lg`
                                                : "glass text-white hover:bg-white/10"
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

                                        {/* Sub-CTA text */}
                                        <p className="text-center text-[10px] text-slate-500 mt-2.5">
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
                        <div className="glass-card rounded-2xl p-8 sm:p-12 text-center pricing-glow glow-border">
                            <h3 className="text-2xl font-bold text-white mb-3">
                                Scale Your Hiring Pipeline with AI
                            </h3>
                            <p className="text-slate-400 mb-8">
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
                                        <svg className="w-4 h-4 text-neon-emerald shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-sm text-slate-300">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setShowModal(true)}
                                className="glow-btn px-10 py-4 text-base font-bold text-white rounded-full"
                            >
                                Contact Us
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Contact Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative glass-strong rounded-2xl p-8 max-w-md w-full"
                    >
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            ✕
                        </button>
                        <h3 className="text-xl font-bold text-white mb-2">Request a Demo</h3>
                        <p className="text-sm text-slate-400 mb-6">
                            Fill in your details and we&apos;ll reach out within 24 hours.
                        </p>
                        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Demo request submitted!"); setShowModal(false); }}>
                            <input
                                type="text"
                                placeholder="Full Name"
                                required
                                className="w-full px-4 py-3 rounded-xl glass bg-transparent text-white text-sm placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-neon-blue/50"
                            />
                            <input
                                type="email"
                                placeholder="Work Email"
                                required
                                className="w-full px-4 py-3 rounded-xl glass bg-transparent text-white text-sm placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-neon-blue/50"
                            />
                            <input
                                type="tel"
                                placeholder="Phone Number"
                                required
                                className="w-full px-4 py-3 rounded-xl glass bg-transparent text-white text-sm placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-neon-blue/50"
                            />
                            <button
                                type="submit"
                                className="glow-btn w-full py-3 text-sm font-bold text-white rounded-xl"
                            >
                                Request a Demo
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </section>
    );
}
