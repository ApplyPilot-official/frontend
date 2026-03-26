"use client";

import AnimatedSection from "@/components/AnimatedSection";
import AnimatedCounter from "@/components/landing/AnimatedCounter";

const stats = [
    { value: 10000, suffix: "+", label: "Students Placed" },
    { value: 150, suffix: "/Day", label: "Applications (Elite)" },
    { value: 7, suffix: " Days", label: "Avg. to First Interview" },
    { value: 95, suffix: "%", label: "ATS Pass Rate" },
];

export default function StatsSection() {
    return (
        <section className="py-16 relative overflow-hidden">
            <div className="section-divider mb-16" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, i) => (
                        <AnimatedSection key={i} delay={i * 0.1} className="text-center">
                            <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
                                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                            </div>
                            <p className="text-sm text-surface-600">{stat.label}</p>
                        </AnimatedSection>
                    ))}
                </div>
            </div>

            <div className="section-divider mt-16" />
        </section>
    );
}
