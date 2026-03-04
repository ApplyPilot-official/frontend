"use client";

import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";

interface PricingCardProps {
    featured?: boolean;
}

const features = [
    "Unlimited job applications",
    "AI-tailored cover letters",
    "Smart job matching",
    "Application tracking dashboard",
    "Resume optimization",
    "Priority email support",
    "Weekly job market reports",
];

export default function PricingCard({ featured = true }: PricingCardProps) {
    return (
        <AnimatedSection>
            <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className={`relative rounded-3xl p-[1px] ${featured
                    ? "bg-gradient-to-br from-primary-500 via-primary-400 to-accent-500"
                    : "bg-slate-200"
                    }`}
            >
                {/* Popular badge */}
                {featured && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-xs font-semibold rounded-full shadow-lg shadow-primary-500/25">
                        Most Popular
                    </div>
                )}

                <div className="bg-white rounded-3xl p-8 md:p-10">
                    <div className="text-center mb-8">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            Pro Plan
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Everything you need to land your dream job
                        </p>
                        <div className="flex items-baseline justify-center gap-1">
                            <span className="text-5xl font-bold gradient-text">$35</span>
                            <span className="text-slate-500 text-sm">/month</span>
                        </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                        {features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                                    <svg
                                        className="w-3 h-3 text-primary-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <span className="text-sm text-slate-600">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    {/* Payment Button placeholder - ready for Razorpay */}
                    <button
                        className="w-full py-3.5 px-6 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5 transition-all duration-200"
                        onClick={() => {
                            // TODO: Integrate Razorpay here
                            // razorpayHandler.open({ amount: 3500, currency: 'USD', ... })
                            window.location.href = "/pricing";
                        }}
                    >
                        Get Started
                    </button>

                    <p className="text-center text-xs text-slate-400 mt-3">
                        Cancel anytime · Secure payment
                    </p>
                </div>
            </motion.div>
        </AnimatedSection>
    );
}
