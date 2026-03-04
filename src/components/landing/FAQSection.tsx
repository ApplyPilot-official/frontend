"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import AnimatedSection from "@/components/AnimatedSection";

const faqs = [
    {
        question: "How does ApplyPilot work?",
        answer: "ApplyPilot uses advanced AI to scan job boards, match positions to your profile, generate tailored resumes and cover letters, and submit applications on your behalf — all automatically, 24/7.",
    },
    {
        question: "Is my data secure?",
        answer: "Absolutely. We use enterprise-grade encryption and never sell your personal data. You can delete your data at any time from your dashboard.",
    },
    {
        question: "Can I control which jobs I apply to?",
        answer: "Yes! Set filters for job title, location, salary range, company size, and more. Review applications before they're submitted or let the AI apply automatically.",
    },
    {
        question: "What job platforms do you support?",
        answer: "LinkedIn, Indeed, Glassdoor, ZipRecruiter, Naukri, and 50+ other job boards. We're constantly adding new platforms.",
    },
    {
        question: "Can I cancel my subscription anytime?",
        answer: "Yes, cancel anytime from your dashboard. No contracts, no cancellation fees. Your subscription stays active until the end of your billing period.",
    },
    {
        question: "How does billing work?",
        answer: "You choose a monthly plan and pay via secure Razorpay checkout. Cancel anytime from your dashboard — no contracts or hidden fees.",
    },
];

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="py-24 sm:py-32 relative">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <AnimatedSection className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 rounded-full glass text-neon-blue text-sm font-medium mb-4">
                        FAQ
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        Frequently Asked{" "}
                        <span className="gradient-text">Questions</span>
                    </h2>
                </AnimatedSection>

                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <AnimatedSection key={i} delay={i * 0.05}>
                            <div className="glass-card rounded-2xl overflow-hidden">
                                <button
                                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                    className="w-full flex items-center justify-between p-5 text-left"
                                >
                                    <span className="text-sm font-semibold text-white pr-4">
                                        {faq.question}
                                    </span>
                                    <motion.svg
                                        animate={{ rotate: openIndex === i ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="w-5 h-5 text-neon-blue shrink-0"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </motion.svg>
                                </button>
                                <motion.div
                                    initial={false}
                                    animate={{
                                        height: openIndex === i ? "auto" : 0,
                                        opacity: openIndex === i ? 1 : 0,
                                    }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-5 pb-5">
                                        <p className="text-sm text-slate-400 leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        </AnimatedSection>
                    ))}
                </div>
            </div>
        </section>
    );
}
