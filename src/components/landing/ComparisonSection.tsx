"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import AnimatedSection from "@/components/AnimatedSection";

const comparisonRows = [
    {
        icon: "⏰",
        without: "Hours wasted copy-pasting the same info",
        withText: "AI auto-fills every single form in seconds",
    },
    {
        icon: "📝",
        without: "1 application per hour, manually clicking",
        withText: "Up to 150 auto-applications per day, hands-free",
    },
    {
        icon: "📄",
        without: "Generic resume sent everywhere — ignored",
        withText: "AI builds a customized, ATS-optimized resume per job",
    },
    {
        icon: "✉️",
        without: "No cover letter, or one boring template",
        withText: "AI writes a personalized cover letter for every role",
    },
    {
        icon: "🔍",
        without: "No idea where your applications went",
        withText: "Full real-time tracker + analytics dashboard",
    },
    {
        icon: "🤖",
        without: "Rejected by ATS bots before humans see it",
        withText: "AI ensures you pass every ATS filter automatically",
    },
    {
        icon: "💼",
        without: "LinkedIn profile collecting dust",
        withText: "AI LinkedIn Profile Makeover — attract recruiters 24/7",
    },

    {
        icon: "📊",
        without: "Zero visibility — did anyone even read it?",
        withText: "ATS Score Generator shows your score before you apply",
    },


    {
        icon: "😴",
        without: "You stop, the job search stops",
        withText: "AI works 24/7 — applies while you sleep, eat, or chill",
    },
];

/* ─── Comparison Row ─── */
function ComparisonRow({
    row,
    index,
}: {
    row: (typeof comparisonRows)[0];
    index: number;
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const [revealed, setRevealed] = useState(false);
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        if (isInView) {
            const timer = setTimeout(() => setRevealed(true), index * 120);
            return () => clearTimeout(timer);
        }
    }, [isInView, index]);

    return (
        <motion.div
            ref={ref}
            className={`grid grid-cols-[auto_1fr_1fr] group transition-colors duration-300 hover:bg-white/[0.03] ${index < comparisonRows.length - 1 ? "border-b border-white/5" : ""
                }`}
        >
            {/* Icon column */}
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={revealed ? { opacity: 1, scale: 1 } : {}}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="px-4 py-4 flex items-center justify-center text-xl border-r border-white/5"
            >
                {row.icon}
            </motion.div>

            {/* Without column — crossed out */}
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={revealed ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4 }}
                className="px-5 py-4 border-r border-white/5 flex items-center gap-2"
            >
                <span className="text-red-500/70 shrink-0 text-xs">✕</span>
                <span className="text-sm text-slate-500 line-through decoration-red-500/40 decoration-1 group-hover:text-slate-400 transition-colors">
                    {row.without}
                </span>
            </motion.div>

            {/* With column — animated border on hover */}
            <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={revealed ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="relative px-5 py-4 flex items-center gap-2 cursor-pointer"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* Animated rotating conic gradient border */}
                {hovered && (
                    <>
                        <motion.div
                            className="absolute inset-0 rounded-lg -z-0 overflow-hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.div
                                className="absolute -inset-[1px]"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                style={{
                                    background: "conic-gradient(from 0deg, #10b981, #00d4ff, #a855f7, #f43f5e, #f59e0b, #10b981)",
                                }}
                            />
                            {/* Inner cutout */}
                            <div className="absolute inset-[2px] bg-dark-800/95 rounded-md" />
                        </motion.div>
                        {/* Glow pulse behind */}
                        <motion.div
                            className="absolute inset-0 rounded-lg pointer-events-none"
                            animate={{
                                boxShadow: [
                                    "0 0 15px rgba(16,185,129,0.15), inset 0 0 15px rgba(16,185,129,0.05)",
                                    "0 0 25px rgba(0,212,255,0.2), inset 0 0 20px rgba(0,212,255,0.08)",
                                    "0 0 15px rgba(168,85,247,0.15), inset 0 0 15px rgba(168,85,247,0.05)",
                                    "0 0 15px rgba(16,185,129,0.15), inset 0 0 15px rgba(16,185,129,0.05)",
                                ],
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                    </>
                )}

                <motion.span
                    animate={revealed ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.5, delay: 0.3, repeat: 0 }}
                    className="shrink-0 text-sm relative z-10"
                >
                    🔥
                </motion.span>
                <span className={`text-sm font-medium relative z-10 transition-colors duration-300 ${hovered ? "text-white" : "text-emerald-300"
                    }`}>
                    {row.withText}
                </span>
            </motion.div>
        </motion.div>
    );
}

export default function ComparisonSection() {
    return (
        <section className="py-24 sm:py-32 relative overflow-hidden">
            {/* CSS for the rotating border animation */}
            <style jsx>{`
                @keyframes borderSweep {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>

            <div className="absolute top-0 right-0 w-96 h-96 bg-neon-violet rounded-full filter blur-[150px] opacity-[0.07]" />
            <div className="absolute bottom-20 left-0 w-72 h-72 bg-red-500 rounded-full filter blur-[120px] opacity-[0.04]" />

            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <AnimatedSection className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 rounded-full glass text-neon-blue text-sm font-medium mb-4">
                        The Problem
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                        Why Job Searching is{" "}
                        <span className="gradient-text">Broken</span>
                    </h2>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        The old way is painful. The ApplyPilot way is fire. 🔥
                    </p>
                </AnimatedSection>

                <AnimatedSection>
                    <div className="glass-card rounded-2xl overflow-hidden">
                        {/* Header row */}
                        <div className="grid grid-cols-[auto_1fr_1fr] border-b border-white/10">
                            <div className="px-4 py-4 bg-slate-800/50 border-r border-white/10 flex items-center justify-center">
                                <span className="text-base">⚙️</span>
                            </div>
                            <div className="px-5 py-4 bg-red-500/10 border-r border-white/10 flex items-center gap-2">
                                <span className="text-sm font-bold text-red-400">❌ Without ApplyPilot</span>
                                <span className="text-[10px] text-red-500/50 hidden sm:inline">(the old painful way)</span>
                            </div>
                            <div className="px-5 py-4 bg-emerald-500/10 flex items-center gap-2">
                                <span className="text-sm font-bold text-emerald-400">🔥 With ApplyPilot</span>
                                <span className="text-[10px] text-emerald-400/50 hidden sm:inline">(AI does it all)</span>
                            </div>
                        </div>

                        {/* Feature rows */}
                        {comparisonRows.map((row, i) => (
                            <ComparisonRow key={i} row={row} index={i} />
                        ))}

                        {/* Bottom CTA bar */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="border-t border-white/10 bg-gradient-to-r from-emerald-500/5 via-transparent to-neon-blue/5 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🚀</span>
                                <span className="text-sm text-slate-300 font-medium">
                                    Still doing it the old way?{" "}
                                    <span className="text-white font-bold">You&apos;re falling behind.</span>
                                </span>
                            </div>
                            <Link
                                href="/login"
                                className="glow-btn px-6 py-2.5 text-sm font-bold text-white rounded-full whitespace-nowrap"
                            >
                                Switch to AI — Free
                            </Link>
                        </motion.div>
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
}
