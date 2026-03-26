"use client";

import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";

export default function CTASection() {
    return (
        <section className="py-24 sm:py-32 relative overflow-hidden">
            {/* Background — vibrant blue gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700" />

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <AnimatedSection>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-950 mb-6 leading-tight">
                        Your next offer letter is
                        <br />
                        <span className="text-accent-yellow">one click away.</span>
                    </h2>
                    <p className="text-lg text-primary-100 mb-10 max-w-2xl mx-auto">
                        Let AI do the heavy lifting while you focus on showing up.
                        Every second you wait, a competitor is getting ahead.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center px-10 py-4 text-base font-bold text-primary-700 bg-white rounded-full hover:bg-primary-50 hover:-translate-y-1 transition-all duration-300 shadow-lg"
                        >
                            🚀 Start Free Today
                            <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                        <Link
                            href="#pricing"
                            className="inline-flex items-center justify-center px-10 py-4 text-base font-semibold text-surface-950 border-2 border-white/40 rounded-full hover:bg-white/10 hover:-translate-y-1 transition-all duration-300"
                        >
                            See Pricing
                        </Link>
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
}
