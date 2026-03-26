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
            className={`grid grid-cols-[auto_1fr_1fr] group transition-colors duration-300 hover:bg-primary-50/50 ${index < comparisonRows.length - 1 ? "border-b border-surface-200" : ""
                }`}
        >
            {/* Icon column */}
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={revealed ? { opacity: 1, scale: 1 } : {}}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="px-4 py-4 flex items-center justify-center text-xl border-r border-surface-200"
            >
                {row.icon}
            </motion.div>

            {/* Without column — crossed out */}
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={revealed ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4 }}
                className="px-5 py-4 border-r border-surface-200 flex items-center gap-2"
            >
                <span className="text-accent-red/70 shrink-0 text-xs">✕</span>
                <span className="text-sm text-surface-500 line-through decoration-accent-red/40 decoration-1 group-hover:text-surface-600 transition-colors">
                    {row.without}
                </span>
            </motion.div>

            {/* With column */}
            <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={revealed ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="relative px-5 py-4 flex items-center gap-2 cursor-pointer"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* Subtle highlight on hover */}
                {hovered && (
                    <motion.div
                        className="absolute inset-0 bg-accent-green/5 rounded-lg -z-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    />
                )}

                <motion.span
                    animate={revealed ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.5, delay: 0.3, repeat: 0 }}
                    className="shrink-0 text-sm relative z-10"
                >
                    🔥
                </motion.span>
                <span className={`text-sm font-medium relative z-10 transition-colors duration-300 ${hovered ? "text-accent-green" : "text-surface-800"
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
            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <AnimatedSection className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-sm font-medium mb-4">
                        The Problem
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-950 mb-4">
                        Why Job Searching is{" "}
                        <span className="gradient-text">Broken</span>
                    </h2>
                    <p className="text-lg text-surface-600 max-w-2xl mx-auto">
                        The old way is painful. The ApplyPilot way is fire. 🔥
                    </p>
                </AnimatedSection>

                <AnimatedSection>
                    <div className="bg-white rounded-2xl overflow-hidden border border-surface-300 shadow-sm">
                        {/* Header row */}
                        <div className="grid grid-cols-[auto_1fr_1fr] border-b border-surface-300">
                            <div className="px-4 py-4 bg-surface-100 border-r border-surface-300 flex items-center justify-center">
                                <span className="text-base">⚙️</span>
                            </div>
                            <div className="px-5 py-4 bg-red-50 border-r border-surface-300 flex items-center gap-2">
                                <span className="text-sm font-bold text-accent-red">❌ Without ApplyPilot</span>
                                <span className="text-[10px] text-accent-red/50 hidden sm:inline">(the old painful way)</span>
                            </div>
                            <div className="px-5 py-4 bg-green-50 flex items-center gap-2">
                                <span className="text-sm font-bold text-accent-green">🔥 With ApplyPilot</span>
                                <span className="text-[10px] text-accent-green/50 hidden sm:inline">(AI does it all)</span>
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
                            className="border-t border-surface-300 bg-surface-100 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🚀</span>
                                <span className="text-sm text-surface-600 font-medium">
                                    Still doing it the old way?{" "}
                                    <span className="text-surface-900 font-bold">You&apos;re falling behind.</span>
                                </span>
                            </div>
                            <Link
                                href="/login"
                                className="glow-btn px-6 py-2.5 text-sm font-bold text-surface-950 rounded-full whitespace-nowrap"
                            >
                                Switch to AI
                            </Link>
                        </motion.div>
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
}
