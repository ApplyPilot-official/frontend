"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

const YOUTUBE_VIDEO_ID = "7DZFgCJNsLE";

const highlights = [
    { icon: "🤖", label: "AI-Powered Applications" },
    { icon: "📊", label: "ATS-Optimized Resumes" },
    { icon: "🎯", label: "Smart Job Matching" },
    { icon: "⚡", label: "24/7 Auto-Apply" },
];

export default function PromoVideoSection() {
    const [youtubeError, setYoutubeError] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

    return (
        <section
            ref={sectionRef}
            id="promo-video"
            className="relative py-20 sm:py-28 overflow-hidden"
        >
            {/* Background decorations */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-primary-50/30 to-white pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary-100/40 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-12 sm:mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-sm text-primary-700 font-medium mb-5">
                        <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                        See It In Action
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-surface-950 leading-tight mb-4 tracking-tight">
                        Your Job Search,{" "}
                        <span className="gradient-text">Automated</span>
                    </h2>
                    <p className="text-lg sm:text-xl text-surface-600 max-w-2xl mx-auto leading-relaxed">
                        Watch how ApplyPilot&apos;s AI agent applies to hundreds of jobs
                        while you focus on what matters most — preparing for interviews.
                    </p>
                </motion.div>

                {/* Video Container */}
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.96 }}
                    animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative mx-auto max-w-4xl"
                >
                    {/* Glow behind video */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-primary-400/20 via-accent-green/20 to-primary-400/20 rounded-3xl blur-2xl opacity-60" />

                    {/* Video wrapper */}
                    <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-surface-200 shadow-2xl shadow-surface-200/50 overflow-hidden">
                        {/* Browser chrome bar */}
                        <div className="flex items-center gap-2 px-4 py-3 bg-surface-100 border-b border-surface-200">
                            <div className="flex gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-red-400" />
                                <span className="w-3 h-3 rounded-full bg-amber-400" />
                                <span className="w-3 h-3 rounded-full bg-green-400" />
                            </div>
                            <div className="flex-1 mx-4">
                                <div className="bg-white rounded-lg px-3 py-1 text-xs text-surface-500 border border-surface-200 max-w-xs mx-auto text-center truncate">
                                    applypilot.com — Product Overview
                                </div>
                            </div>
                        </div>

                        {/* Video */}
                        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                            {!youtubeError ? (
                                <iframe
                                    className="absolute inset-0 w-full h-full"
                                    src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1&color=white`}
                                    title="ApplyPilot — Product Overview"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    onError={() => setYoutubeError(true)}
                                />
                            ) : (
                                <video
                                    className="absolute inset-0 w-full h-full object-cover"
                                    controls
                                    preload="metadata"
                                    poster=""
                                    playsInline
                                >
                                    <source src="/promo.mp4" type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Highlights strip */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mt-10 sm:mt-14"
                >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
                        {highlights.map((item, i) => (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0, y: 15 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                                className="flex items-center gap-2.5 px-4 py-3 bg-white rounded-xl border border-surface-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                            >
                                <span className="text-xl flex-shrink-0">{item.icon}</span>
                                <span className="text-sm font-semibold text-surface-800 leading-tight">
                                    {item.label}
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    {/* CTA below video */}
                    <div className="text-center mt-10">
                        <p className="text-surface-500 text-sm mb-4">
                            Join <span className="text-surface-700 font-semibold">1,050+</span> job seekers already using ApplyPilot
                        </p>
                        <a
                            href="/login"
                            className="glow-btn inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-surface-950 rounded-full"
                        >
                            🚀 Start Applying Automatically
                            <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
