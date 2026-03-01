"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import HeroLaptop from "@/components/HeroLaptop";

const heroSubtitles = [
    "While you sleep, AI applies to hundreds of jobs for you",
    "Stop copy-pasting. Start landing interviews.",
    "Your personal AI agent — applying, tracking, and winning jobs 24/7",
];

function RotatingText() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % heroSubtitles.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="h-[60px] sm:h-[40px] relative overflow-hidden">
            {heroSubtitles.map((text, i) => (
                <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{
                        opacity: index === i ? 1 : 0,
                        y: index === i ? 0 : -30,
                    }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="absolute inset-0 text-lg sm:text-xl text-slate-400 leading-relaxed"
                >
                    {text}
                </motion.p>
            ))}
        </div>
    );
}

export default function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center hero-bg overflow-hidden pt-24 pb-16">
            {/* Decorative orbs */}
            <div className="orb w-[500px] h-[500px] bg-neon-blue top-10 -left-64 animate-float" />
            <div className="orb w-[400px] h-[400px] bg-neon-violet bottom-20 -right-48 animate-float-slow" />
            <div className="orb w-[300px] h-[300px] bg-neon-emerald top-1/2 left-1/3 animate-float-delay" />

            {/* Star particles */}
            <div className="absolute inset-0 stars-bg opacity-40" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                    {/* Left: Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-neon-blue font-medium mb-6">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            AI Agent Active — Applying Now
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
                            Never Miss Your{" "}
                            <br />
                            Dream Job{" "}
                            <span className="gradient-text">Again</span>
                        </h1>

                        <div className="mb-8 max-w-lg">
                            <RotatingText />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <Link
                                href="/login"
                                className="glow-btn inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white rounded-full"
                            >
                                🤖 Get My AI Job Agent
                                <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                            <Link
                                href="#how-it-works"
                                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-slate-300 glass rounded-full hover:bg-white/5 hover:-translate-y-1 transition-all duration-300 border border-white/10"
                            >
                                See How It Works
                            </Link>
                        </div>

                        {/* Social proof strip */}
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex -space-x-2">
                                {["review_priya.jpg", "review_rahul.jpg", "review_sneha.jpg", "review_arjun.jpg"].map((img, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-dark-700 overflow-hidden relative">
                                        <Image src={`/${img}`} alt="User" fill className="object-cover" />
                                    </div>
                                ))}
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue to-neon-violet border-2 border-dark-700 flex items-center justify-center text-[10px] text-white font-bold">
                                    +10k
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500">
                                    Loved by <span className="text-slate-300">10,000+</span> job seekers · avg. <span className="text-neon-blue">7 days</span> to first interview
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: 3D Laptop */}
                    <div className="order-first lg:order-last">
                        <HeroLaptop />
                    </div>
                </div>
            </div>
        </section>
    );
}
