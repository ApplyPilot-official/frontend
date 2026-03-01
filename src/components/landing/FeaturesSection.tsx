"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import AnimatedSection from "@/components/AnimatedSection";

/* ─── Feature card data ─── */
const features = [
    {
        icon: "🤖",
        title: "Auto-Apply Engine",
        desc: "Up to 150 applications per day, hands-free",
        detail: "Our AI agent fills out every application for you — cover letters, custom answers, everything. You sleep, it applies.",
        size: "lg",
        color: "from-cyan-500/20 to-blue-600/20",
        borderColor: "hover:border-cyan-500/30",
        tag: "⚡ Core Feature",
    },
    {
        icon: "🔎",
        title: "Multi-Platform Job Scraper",
        desc: "Find jobs from LinkedIn, Indeed, Glassdoor & 50+ boards",
        detail: "One search, every platform. Our scraper aggregates jobs from 50+ sites and filters them by your exact preferences.",
        size: "lg",
        color: "from-violet-500/20 to-purple-600/20",
        borderColor: "hover:border-violet-500/30",
        tag: "🆕 New",
    },
    {
        icon: "📄",
        title: "ATS Resume Optimizer",
        desc: "Beat the bots. Get seen by humans.",
        detail: "Our AI rewrites your resume to match ATS keywords for each job. Get 3x more callbacks with optimized formatting.",
        size: "sm",
        color: "from-emerald-500/20 to-green-600/20",
        borderColor: "hover:border-emerald-500/30",
    },
    {
        icon: "✉️",
        title: "AI Cover Letters",
        desc: "Personalized for every job in seconds",
        detail: "Each cover letter is uniquely crafted based on the job description and your experience. No templates, no generic filler.",
        size: "sm",
        color: "from-pink-500/20 to-rose-600/20",
        borderColor: "hover:border-pink-500/30",
    },
    {
        icon: "🧑‍💼",
        title: "Human Manual Apply",
        desc: "We apply where bots can't — with real humans",
        detail: "Some companies block bots. Our trained team manually applies on your behalf for those tricky portals like Workday and Taleo.",
        size: "sm",
        color: "from-amber-500/20 to-yellow-600/20",
        borderColor: "hover:border-amber-500/30",
        tag: "👤 Premium",
    },
    {
        icon: "🇺🇸",
        title: "Visa & Sponsorship Filters",
        desc: "Filter by STEM OPT, Green Card, H1-B & more",
        detail: "International student? Filter jobs by sponsorship status, STEM OPT eligibility, and Green Card availability instantly.",
        size: "sm",
        color: "from-blue-500/20 to-indigo-600/20",
        borderColor: "hover:border-blue-500/30",
        tag: "🌍 Global",
    },
    {
        icon: "📧",
        title: "Apply via Email",
        desc: "Send applications directly through email outreach",
        detail: "For jobs posted as 'email your resume', our AI crafts professional emails and sends them on your behalf with attachments.",
        size: "sm",
        color: "from-teal-500/20 to-cyan-600/20",
        borderColor: "hover:border-teal-500/30",
    },
    {
        icon: "💼",
        title: "LinkedIn Auto-Apply",
        desc: "One-click apply + Easy Apply automation",
        detail: "Connect your LinkedIn and let our agent handle Easy Apply, sending connection requests and follow-up messages automatically.",
        size: "sm",
        color: "from-sky-500/20 to-blue-600/20",
        borderColor: "hover:border-sky-500/30",
    },
    {
        icon: "📊",
        title: "Application Tracker",
        desc: "Never lose track of where you applied",
        detail: "Visual pipeline from Applied → Screening → Interview → Offer. Get reminders for follow-ups and track response rates.",
        size: "sm",
        color: "from-orange-500/20 to-red-600/20",
        borderColor: "hover:border-orange-500/30",
    },
    {
        icon: "🎯",
        title: "ATS Score Generator",
        desc: "Know your score before you apply",
        detail: "See exactly how your resume scores against the job description. Get actionable tips to push your score above 90%.",
        size: "sm",
        color: "from-lime-500/20 to-green-600/20",
        borderColor: "hover:border-lime-500/30",
    },
    {
        icon: "🧭",
        title: "Career Counselling AI",
        desc: "Personalized career guidance powered by AI",
        detail: "Get 1-on-1 AI career coaching — resume reviews, industry advice, salary negotiation tips, and career path planning.",
        size: "lg",
        color: "from-fuchsia-500/20 to-pink-600/20",
        borderColor: "hover:border-fuchsia-500/30",
        tag: "🧠 AI Powered",
    },
    {
        icon: "🎤",
        title: "AI Mock Interview",
        desc: "Walk into every interview prepared",
        detail: "Practice with AI interviewers that simulate real behavioral and technical interviews. Get instant feedback on every answer.",
        size: "sm",
        color: "from-rose-500/20 to-pink-600/20",
        borderColor: "hover:border-rose-500/30",
    },
    {
        icon: "🔍",
        title: "Hiring Contact Finder",
        desc: "Reach the person who makes the call",
        detail: "Our AI finds hiring managers, recruiters, and decision-makers for each role so you can reach out directly.",
        size: "sm",
        color: "from-indigo-500/20 to-violet-600/20",
        borderColor: "hover:border-indigo-500/30",
    },
    {
        icon: "🎛️",
        title: "Smart Job Filters",
        desc: "Apply only where you say — your rules",
        detail: "Filter by location, salary, company size, remote/hybrid, experience level, and even specific companies you love or want to avoid.",
        size: "sm",
        color: "from-cyan-500/20 to-teal-600/20",
        borderColor: "hover:border-cyan-500/30",
    },
    {
        icon: "📬",
        title: "Follow-Up Automator",
        desc: "Auto follow-up emails after application",
        detail: "Never ghost a recruiter. Our system sends polite follow-ups at the perfect intervals to keep you top-of-mind.",
        size: "sm",
        color: "from-amber-500/20 to-orange-600/20",
        borderColor: "hover:border-amber-500/30",
        tag: "🔄 Auto",
    },
    {
        icon: "📈",
        title: "Salary Insights & Negotiator",
        desc: "Know your worth. Negotiate with confidence.",
        detail: "See real salary ranges for every role. Our AI generates negotiation scripts to help you get 15-30% more than the initial offer.",
        size: "sm",
        color: "from-emerald-500/20 to-lime-600/20",
        borderColor: "hover:border-emerald-500/30",
    },
];

/* ─── Interactive Feature Card ─── */
function FeatureCard({
    feature,
    index,
}: {
    feature: (typeof features)[0];
    index: number;
}) {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <AnimatedSection
            delay={index * 0.05}
            className={feature.size === "lg" ? "col-span-2" : ""}
        >
            <motion.div
                className="relative h-full"
                style={{ perspective: "1000px" }}
                onHoverStart={() => setIsFlipped(true)}
                onHoverEnd={() => setIsFlipped(false)}
                whileHover={{ y: -6, scale: 1.02 }}
            >
                {/* Card container with 3D flip */}
                <motion.div
                    className="relative w-full h-full"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                    {/* ─── Front face ─── */}
                    <div
                        className={`glass-card rounded-2xl p-6 card-hover group cursor-pointer h-full border border-white/5 ${feature.borderColor} transition-all duration-500 ${feature.size === "lg" ? "flex items-center gap-6" : ""
                            }`}
                        style={{ backfaceVisibility: "hidden" }}
                    >
                        {/* Tag */}
                        {feature.tag && (
                            <div className="absolute -top-2.5 right-4 z-10">
                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-white backdrop-blur-md border border-white/10">
                                    {feature.tag}
                                </span>
                            </div>
                        )}

                        {/* Icon with glow */}
                        <div className="relative">
                            <motion.div
                                className={`text-3xl mb-3 ${feature.size === "lg" ? "text-5xl mb-0" : ""
                                    } transition-transform duration-300`}
                                whileHover={{ scale: 1.3, rotate: [0, -10, 10, 0] }}
                                transition={{ duration: 0.4 }}
                            >
                                {feature.icon}
                            </motion.div>
                            {/* Glow behind icon */}
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-full filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}
                                style={{ transform: "scale(2)" }}
                            />
                        </div>

                        <div>
                            <h3 className="text-base font-semibold text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all duration-300">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                                {feature.desc}
                            </p>
                        </div>

                        {/* Hover shimmer line */}
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-2xl" />
                    </div>

                    {/* ─── Back face (detail) ─── */}
                    <div
                        className={`absolute inset-0 glass-card rounded-2xl p-6 flex flex-col justify-center border border-white/10 bg-gradient-to-br ${feature.color}`}
                        style={{
                            backfaceVisibility: "hidden",
                            transform: "rotateY(180deg)",
                        }}
                    >
                        <div className="text-2xl mb-3">{feature.icon}</div>
                        <h3 className="text-sm font-bold text-white mb-2">
                            {feature.title}
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            {feature.detail}
                        </p>
                        <div className="mt-4">
                            <span className="text-[10px] text-cyan-400 font-medium flex items-center gap-1">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                Hover to flip back
                            </span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatedSection>
    );
}

/* ─── Main Section ─── */
export default function FeaturesSection() {
    return (
        <section id="features" className="py-24 sm:py-32 relative">
            <div className="absolute top-20 right-0 w-96 h-96 bg-neon-blue rounded-full filter blur-[150px] opacity-[0.06]" />
            <div className="absolute bottom-40 left-10 w-72 h-72 bg-neon-violet rounded-full filter blur-[150px] opacity-[0.04]" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <AnimatedSection className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 rounded-full glass text-neon-violet text-sm font-medium mb-4">
                        Full Arsenal
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                        Everything You Need to{" "}
                        <span className="gradient-text">Win</span>
                    </h2>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        A complete AI-powered toolkit to dominate your job search.
                    </p>

                    {/* Feature count badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full glass text-xs text-slate-400"
                    >
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        {features.length} powerful tools — all included in every plan
                    </motion.div>
                </AnimatedSection>

                {/* Bento grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {features.map((feature, i) => (
                        <FeatureCard key={i} feature={feature} index={i} />
                    ))}
                </div>

                {/* Bottom teaser */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mt-12"
                >
                    <p className="text-sm text-slate-500">
                        ...and more features shipping every week 🚀
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
