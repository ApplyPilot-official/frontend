import type { Metadata } from "next";
import Image from "next/image";
import AnimatedSection from "@/components/AnimatedSection";

export const metadata: Metadata = {
    title: "About",
    description: "Learn about ApplyPilot — the AI-powered job application automation service helping thousands land their dream jobs.",
};

const values = [
    {
        icon: "🎯",
        title: "Mission-Driven",
        description: "We believe everyone deserves equal access to job opportunities. AI levels the playing field.",
    },
    {
        icon: "🔒",
        title: "Privacy First",
        description: "Your data is yours. We never sell personal information and use enterprise-grade encryption.",
    },
    {
        icon: "⚡",
        title: "Innovation",
        description: "Constantly pushing the boundaries of what AI can do for job seekers with cutting-edge technology.",
    },
    {
        icon: "🤝",
        title: "User-Centric",
        description: "Every feature we build starts with a real problem faced by real job seekers.",
    },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen hero-bg pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <AnimatedSection className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 text-sm font-medium mb-4">
                        About Us
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
                        Reimagining the{" "}
                        <span className="gradient-text">Job Search</span>
                    </h1>
                    <p className="text-lg text-surface-600 max-w-3xl mx-auto leading-relaxed">
                        ApplyPilot was born from a simple frustration: job searching is broken.
                        The average job seeker spends 11 hours per week on applications, yet
                        only 2% ever hear back. We&apos;re here to change that.
                    </p>
                </AnimatedSection>

                {/* Logo section */}
                <AnimatedSection className="flex justify-center mb-16">
                    <div className="relative w-32 h-32 bg-white border border-surface-300 rounded-3xl p-4 shadow-lg">
                        <Image
                            src="/logo.png"
                            alt="ApplyPilot Logo"
                            fill
                            className="object-contain p-2"
                        />
                    </div>
                </AnimatedSection>

                {/* Story */}
                <AnimatedSection className="max-w-3xl mx-auto mb-20">
                    <div className="bg-white border border-surface-300 rounded-2xl p-8 sm:p-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            Our Story
                        </h2>
                        <div className="space-y-4 text-surface-600 leading-relaxed">
                            <p>
                                We started ApplyPilot because we experienced the pain of modern
                                job searching firsthand. Manually tailoring resumes, writing cover
                                letters, and filling out repetitive application forms — it was
                                exhausting and inefficient.
                            </p>
                            <p>
                                We realized that AI could automate most of this process while
                                actually doing it <em>better</em> than humans could manually. Our
                                AI analyzes job descriptions, matches them to your skills, and
                                generates perfectly tailored application materials in seconds.
                            </p>
                            <p>
                                Today, ApplyPilot helps thousands of job seekers across the world
                                land interviews faster. We&apos;re a fully remote, USA-based team
                                united by a single mission: making the job search human again by
                                letting AI handle the busywork.
                            </p>
                        </div>
                    </div>
                </AnimatedSection>

                {/* Values */}
                <AnimatedSection className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                        Our <span className="gradient-text">Values</span>
                    </h2>
                </AnimatedSection>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {values.map((value, i) => (
                        <AnimatedSection key={i} delay={i * 0.1}>
                            <div className="bg-white border border-surface-300 rounded-2xl p-6 text-center card-hover h-full">
                                <div className="text-3xl mb-4">{value.icon}</div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                    {value.title}
                                </h3>
                                <p className="text-sm text-surface-600 leading-relaxed">
                                    {value.description}
                                </p>
                            </div>
                        </AnimatedSection>
                    ))}
                </div>
            </div>
        </div>
    );
}
