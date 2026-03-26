"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";

/* ─── DATA ─── */
const punchlines = [
    { emoji: "🚀", text: "Stop Applying for Weeks.", highlight: "Start Interviewing in Days.", source: "" },
    { emoji: "⚡", text: "Your Job Search Team,", highlight: "Applying 24/7 While You Sleep.", source: "" },
    { emoji: "🎯", text: "Find Your Dream Job", highlight: "10x Faster.", source: "" },
    { emoji: "⏳", text: "Save 100s of Hours.", highlight: "Automate Every Application.", source: "" },
    { emoji: "📈", text: "You're 80% More Likely to", highlight: "Get Hired Faster.", source: "" },
    { emoji: "🔥", text: "Land Jobs. Change Careers.", highlight: "Faster Than Ever.", source: "" },
];

const scrollingLines = [
    "AI applies while you sleep 😴",
    "150 applications per day 🚀",
    "ATS-optimized resumes 📄",
    "7 days to first interview ⚡",
    "10x faster job search 🎯",
    "Save 100+ hours ⏳",
    "24/7 autonomous agent 🤖",
    "$1/day investment 💰",
    "80% higher callback rate 📈",
    "AI cover letters ✉️",
    "50+ job boards connected 🌐",
];

/* ─── Hero Stat Banner ─── */
function HeroStatBanner() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div ref={ref} initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ duration: 0.8 }} className="relative mb-20">
            <div className="relative bg-white rounded-3xl p-8 sm:p-12 overflow-hidden border border-surface-300 shadow-md">
                <div className="absolute top-4 left-4 text-xl opacity-60">✨</div>
                <div className="absolute bottom-4 right-4 text-xl opacity-60">✨</div>

                <div className="relative text-center">
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }}
                        className="text-sm sm:text-base text-surface-500 mb-4 tracking-wide">
                        Think about it...
                    </motion.p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 mb-6">
                        <motion.span initial={{ opacity: 0, scale: 0.5 }} animate={isInView ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                            className="text-5xl sm:text-7xl lg:text-8xl font-black gradient-text">
                            $1
                        </motion.span>
                        <motion.span initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.6 }}
                            className="text-lg sm:text-2xl text-surface-500">
                            /day can land you a
                        </motion.span>
                        <motion.span initial={{ opacity: 0, scale: 0.5 }} animate={isInView ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                            className="text-5xl sm:text-7xl lg:text-8xl font-black text-transparent bg-clip-text"
                            style={{ backgroundImage: "linear-gradient(135deg, #34A853, #4CAF50, #81C784)" }}>
                            $200K+
                        </motion.span>
                        <motion.span initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.0 }}
                            className="text-lg sm:text-2xl text-surface-500">
                            salary.
                        </motion.span>
                    </div>

                    <motion.p initial={{ opacity: 0, y: 10 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1.2 }}
                        className="text-sm text-surface-500 max-w-md mx-auto">
                        You spend more on coffee. ☕ Why not invest in the career that changes your life?
                    </motion.p>
                </div>
            </div>
        </motion.div>
    );
}

/* ─── Punchline Carousel ─── */
function PunchlineCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    useEffect(() => {
        if (!isInView) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % punchlines.length);
        }, 3500);
        return () => clearInterval(timer);
    }, [isInView]);

    return (
        <div ref={ref} className="mb-16">
            <div className="relative h-[180px] sm:h-[160px] flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 60, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -60, filter: "blur(10px)" }}
                        transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
                        className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
                    >
                        <span className="text-3xl sm:text-4xl mb-3">{punchlines[currentIndex].emoji}</span>
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-900 leading-tight mb-1">
                            {punchlines[currentIndex].text}
                        </h3>
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black gradient-text leading-tight">
                            {punchlines[currentIndex].highlight}
                        </h3>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="flex items-center justify-center gap-2 mt-4">
                {punchlines.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`transition-all duration-300 rounded-full ${i === currentIndex
                            ? "w-8 h-2 bg-gradient-to-r from-primary-500 to-accent-green"
                            : "w-2 h-2 bg-surface-300 hover:bg-surface-400"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}

/* ─── Scrolling Stats Ticker ─── */
function ScrollingStatsTicker() {
    return (
        <div className="relative overflow-hidden py-6 mb-16">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />

            <div className="flex animate-scroll-left mb-3">
                {[...scrollingLines, ...scrollingLines].map((line, i) => (
                    <div key={`a-${i}`}
                        className="shrink-0 mx-2 px-5 py-2 rounded-full bg-white border border-surface-300 text-sm font-medium text-surface-600 whitespace-nowrap hover:border-primary-300 hover:text-surface-900 transition-all duration-300 cursor-default shadow-sm">
                        {line}
                    </div>
                ))}
            </div>

            <div className="flex animate-scroll-right">
                {[...scrollingLines.slice().reverse(), ...scrollingLines.slice().reverse()].map((line, i) => (
                    <div key={`b-${i}`}
                        className="shrink-0 mx-2 px-5 py-2 rounded-full bg-white border border-surface-300 text-sm font-medium text-surface-500 whitespace-nowrap hover:border-accent-green/30 hover:text-surface-900 transition-all duration-300 cursor-default shadow-sm">
                        {line}
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─── Impact Grid ─── */
const impactCards = [
    { stat: "24/7", label: "Your AI never sleeps", desc: "Applications sent round the clock, even at 3 AM.", gradient: "from-primary-500 to-primary-600", icon: "🤖" },
    { stat: "150+", label: "Apps per day", desc: "What takes you a week, we do before lunch.", gradient: "from-violet-500 to-purple-600", icon: "🚀" },
    { stat: "80%", label: "Higher callback rate", desc: "ATS-optimized resumes that actually get read.", gradient: "from-accent-green to-emerald-500", icon: "📈" },
    { stat: "7 days", label: "To first interview", desc: "Most users hear back within their first week.", gradient: "from-accent-yellow to-amber-500", icon: "⚡" },
];

function ImpactGrid() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <div ref={ref} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {impactCards.map((card, i) => (
                <motion.div key={i}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                    transition={{ delay: i * 0.12, duration: 0.5 }}
                    whileHover={{ y: -6, scale: 1.03 }}
                    className="relative bg-white rounded-2xl p-5 sm:p-6 overflow-hidden group cursor-default border border-surface-300 hover:border-primary-300 transition-colors shadow-sm">
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`} />
                    <div className="relative">
                        <span className="text-2xl mb-3 block group-hover:scale-110 transition-transform duration-300">{card.icon}</span>
                        <div className={`text-3xl sm:text-4xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r ${card.gradient}`}>
                            {card.stat}
                        </div>
                        <p className="text-sm font-semibold text-surface-900 mb-1">{card.label}</p>
                        <p className="text-xs text-surface-500 leading-relaxed">{card.desc}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

/* ─── Why This Works ─── */
const whyLines = [
    { prefix: "Manual applying:", value: "3 hours/day", result: "= burnout 😩", bad: true },
    { prefix: "With ApplyPilot:", value: "0 minutes/day", result: "= interviews 🎉", bad: false },
];

function WhyItWorks() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <motion.div ref={ref} initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} className="mb-12">
            <div className="max-w-2xl mx-auto">
                {whyLines.map((line, i) => (
                    <motion.div key={i}
                        initial={{ opacity: 0, x: i === 0 ? -40 : 40 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 0.3 + i * 0.4, duration: 0.6 }}
                        className={`flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 py-4 ${i === 0 ? "border-b border-surface-200" : ""}`}>
                        <span className="text-sm text-surface-500 font-mono">{line.prefix}</span>
                        <span className={`text-xl sm:text-2xl font-bold ${line.bad ? "text-accent-red line-through decoration-accent-red/60" : "gradient-text"}`}>
                            {line.value}
                        </span>
                        <span className="text-lg">{line.result}</span>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

/* ─── MAIN EXPORT ─── */
export default function PunchlinesSection() {
    return (
        <section className="py-20 sm:py-28 relative overflow-hidden">
            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium mb-4">
                        💡 Why ApplyPilot?
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-950 mb-4">
                        The Numbers Don&apos;t Lie.{" "}
                        <span className="gradient-text">Neither Do We.</span>
                    </h2>
                </motion.div>

                <HeroStatBanner />
                <PunchlineCarousel />
                <ScrollingStatsTicker />
                <ImpactGrid />
                <WhyItWorks />

                {/* Bottom CTA */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
                    <Link href="/login" className="glow-btn inline-flex items-center justify-center px-10 py-4 text-base font-bold text-surface-950 rounded-full">
                        🚀 Start Your $1/Day Career Investment
                        <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                    <p className="mt-4 text-xs text-surface-500">Cancel anytime · Secure payment</p>
                </motion.div>
            </div>
        </section>
    );
}
