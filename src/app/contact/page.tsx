"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        // Create mailto link
        const subject = encodeURIComponent(
            `Contact from ${formData.get("name")} via ApplyPilot`
        );
        const body = encodeURIComponent(
            `Name: ${formData.get("name")}\nEmail: ${formData.get("email")}\n\nMessage:\n${formData.get("message")}`
        );
        window.location.href = `mailto:contact@applypilot.us?subject=${subject}&body=${body}`;
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen hero-bg pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <AnimatedSection className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 text-sm font-medium mb-4">
                        Contact
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
                        Get in <span className="gradient-text">Touch</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Have a question or feedback? We&apos;d love to hear from you.
                    </p>
                </AnimatedSection>

                <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    {/* Contact Form */}
                    <AnimatedSection>
                        <div className="glass-strong rounded-2xl p-8">
                            {submitted ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-12"
                                >
                                    <div className="text-5xl mb-4">✉️</div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                                        Opening your email client...
                                    </h3>
                                    <p className="text-slate-500 text-sm">
                                        Complete sending the email from your mail application. We&apos;ll
                                        get back to you within 24 hours.
                                    </p>
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="mt-4 text-primary-600 text-sm font-medium hover:underline"
                                    >
                                        Send another message
                                    </button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label
                                            htmlFor="name"
                                            className="block text-sm font-medium text-slate-700 mb-1.5"
                                        >
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="block text-sm font-medium text-slate-700 mb-1.5"
                                        >
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="message"
                                            className="block text-sm font-medium text-slate-700 mb-1.5"
                                        >
                                            Message
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            required
                                            rows={5}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm resize-none"
                                            placeholder="How can we help?"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-3.5 px-6 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5 transition-all duration-200"
                                    >
                                        Send Message
                                    </button>
                                </form>
                            )}
                        </div>
                    </AnimatedSection>

                    {/* Contact Info */}
                    <AnimatedSection delay={0.2}>
                        <div className="space-y-6">
                            <div className="glass-strong rounded-2xl p-6">
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                    📧 Email Us
                                </h3>
                                <a
                                    href="mailto:contact@applypilot.us"
                                    className="text-primary-600 hover:underline"
                                >
                                    contact@applypilot.us
                                </a>
                                <p className="text-sm text-slate-500 mt-1">
                                    We typically respond within 24 hours.
                                </p>
                            </div>

                            <div className="glass-strong rounded-2xl p-6">
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                    🌍 Location
                                </h3>
                                <p className="text-slate-600 text-sm">
                                    Fully remote, USA-based SaaS company.
                                </p>
                            </div>

                            <div className="glass-strong rounded-2xl p-6">
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                    💬 FAQ
                                </h3>
                                <p className="text-slate-600 text-sm mb-2">
                                    Most questions are answered in our FAQ section.
                                </p>
                                <a
                                    href="/#faq"
                                    className="text-primary-600 text-sm font-medium hover:underline"
                                >
                                    Visit FAQ →
                                </a>
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </div>
        </div>
    );
}
