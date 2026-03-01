"use client";

import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";

export default function CTASection() {
    return (
        <section className="py-24 sm:py-32 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-dark-500 via-dark-700 to-dark-900" />
            <div className="absolute inset-0 stars-bg opacity-30" />
            <div className="absolute inset-0">
                <div className="orb w-[600px] h-[600px] bg-neon-blue top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.12]" />
                <div className="orb w-[400px] h-[400px] bg-neon-violet bottom-0 right-0 opacity-[0.1]" />
            </div>

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <AnimatedSection>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                        Your next offer letter is
                        <br />
                        <span className="gradient-text">one click away.</span>
                    </h2>
                    <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
                        Let AI do the heavy lifting while you focus on showing up.
                        Every second you wait, a competitor is getting ahead.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/login"
                            className="glow-btn inline-flex items-center justify-center px-10 py-4 text-base font-bold text-white rounded-full"
                        >
                            🚀 Start Free Today
                            <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                        <Link
                            href="#pricing"
                            className="inline-flex items-center justify-center px-10 py-4 text-base font-semibold text-slate-300 border border-white/20 rounded-full hover:bg-white/5 hover:-translate-y-1 transition-all duration-300"
                        >
                            See Pricing
                        </Link>
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
}
