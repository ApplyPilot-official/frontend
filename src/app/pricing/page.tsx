import type { Metadata } from "next";
import PricingCard from "@/components/PricingCard";
import AnimatedSection from "@/components/AnimatedSection";

export const metadata: Metadata = {
    title: "Pricing",
    description: "Simple, transparent pricing for ApplyPilot. $35/month for unlimited AI-powered job applications.",
};

export default function PricingPage() {
    return (
        <div className="min-h-screen hero-bg pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <AnimatedSection className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 text-sm font-medium mb-4">
                        Pricing
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
                        Simple, Transparent <span className="gradient-text">Pricing</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        One plan. Everything included. No hidden fees. Start with a 7-day
                        free trial.
                    </p>
                </AnimatedSection>

                <div className="max-w-md mx-auto mb-16">
                    <PricingCard featured />
                </div>

                {/* Comparison / Guarantee */}
                <AnimatedSection className="text-center">
                    <div className="glass-strong rounded-2xl p-8 max-w-2xl mx-auto">
                        <h3 className="text-xl font-bold text-slate-900 mb-3">
                            💰 30-Day Money-Back Guarantee
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            If you&apos;re not satisfied with ApplyPilot within the first 30 days,
                            we&apos;ll give you a full refund — no questions asked. We&apos;re that
                            confident you&apos;ll love it.
                        </p>
                    </div>
                </AnimatedSection>
            </div>
        </div>
    );
}
