"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";

const reviews = [
    {
        name: "Priya Sharma",
        role: "Final Year Student, IIT Delhi",
        photo: "/review_priya.jpg",
        company: "Google",
        text: "ApplyPilot applied to 200+ companies while I focused on my final exams. Got 8 interview calls in the first week — landed my dream role at Google!",
        rating: 5,
    },
    {
        name: "Rahul Verma",
        role: "Software Engineer, NIT Trichy",
        photo: "/review_rahul.jpg",
        company: "Microsoft",
        text: "I was spending 4 hours a day filling forms. With ApplyPilot, I set it up once and it did everything. Got placed at Microsoft in 12 days!",
        rating: 5,
    },
    {
        name: "Sneha Patel",
        role: "Data Analyst, BITS Pilani",
        photo: "/review_sneha.jpg",
        company: "Amazon",
        text: "The ATS-optimized resumes made all the difference. My callback rate went from 5% to 40%. Absolute game-changer for placement season.",
        rating: 5,
    },
    {
        name: "Arjun Krishnan",
        role: "Product Designer, VIT Vellore",
        photo: "/review_arjun.jpg",
        company: "Meta",
        text: "AI mock interviews prepared me better than any coaching. I walked into my Meta interview confident and nailed it. Worth every penny.",
        rating: 5,
    },
];

export default function ReviewsSection() {
    return (
        <section id="reviews" className="py-24 sm:py-32 relative">
            <div className="absolute top-0 left-0 w-96 h-96 bg-neon-violet rounded-full filter blur-[150px] opacity-[0.05]" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <AnimatedSection className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 rounded-full glass text-yellow-400 text-sm font-medium mb-4">
                        ⭐ Real Stories
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                        Loved by <span className="gradient-text">Job Seekers</span>
                    </h2>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Real results from real students who transformed their placements.
                    </p>
                </AnimatedSection>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {reviews.map((review, i) => (
                        <AnimatedSection key={i} delay={i * 0.1}>
                            <motion.div
                                whileHover={{ y: -6 }}
                                className="glass-card rounded-2xl overflow-hidden card-hover h-full flex flex-col"
                            >
                                {/* Large photo at the top */}
                                <div className="relative w-full h-52 overflow-hidden">
                                    <Image
                                        src={review.photo}
                                        alt={review.name}
                                        fill
                                        className="object-cover"
                                    />
                                    {/* Gradient overlay at bottom of image */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-dark-700 via-transparent to-transparent" />

                                    {/* Company badge overlaid on image */}
                                    <div className="absolute bottom-3 left-4">
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full glass text-[11px] text-neon-blue font-semibold">
                                            🏢 Hired at {review.company}
                                        </span>
                                    </div>
                                </div>

                                {/* Card body */}
                                <div className="p-5 flex flex-col flex-1">
                                    {/* Stars */}
                                    <div className="flex items-center gap-0.5 mb-3">
                                        {Array.from({ length: review.rating }).map((_, j) => (
                                            <svg key={j} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>

                                    {/* Quote */}
                                    <p className="text-sm text-slate-300 leading-relaxed mb-4 flex-1">
                                        &ldquo;{review.text}&rdquo;
                                    </p>

                                    {/* Name & role */}
                                    <div className="pt-3 border-t border-white/5">
                                        <p className="text-sm font-semibold text-white">{review.name}</p>
                                        <p className="text-[11px] text-slate-500">{review.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatedSection>
                    ))}
                </div>
            </div>
        </section>
    );
}
