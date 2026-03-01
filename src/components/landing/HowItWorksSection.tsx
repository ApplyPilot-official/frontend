"use client";

import { motion } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";

/* ─── Neural Network Node Animation ─── */
function NeuralNetworkViz() {
    const nodes = [
        // Input layer
        { x: 20, y: 25, layer: 0 },
        { x: 20, y: 50, layer: 0 },
        { x: 20, y: 75, layer: 0 },
        // Hidden layer 1
        { x: 40, y: 20, layer: 1 },
        { x: 40, y: 40, layer: 1 },
        { x: 40, y: 60, layer: 1 },
        { x: 40, y: 80, layer: 1 },
        // Hidden layer 2
        { x: 60, y: 30, layer: 2 },
        { x: 60, y: 50, layer: 2 },
        { x: 60, y: 70, layer: 2 },
        // Output layer
        { x: 80, y: 40, layer: 3 },
        { x: 80, y: 60, layer: 3 },
    ];

    // Generate edges between consecutive layers
    const edges: { x1: number; y1: number; x2: number; y2: number; delay: number }[] = [];
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            if (nodes[j].layer === nodes[i].layer + 1) {
                edges.push({
                    x1: nodes[i].x,
                    y1: nodes[i].y,
                    x2: nodes[j].x,
                    y2: nodes[j].y,
                    delay: Math.random() * 2,
                });
            }
        }
    }

    return (
        <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full opacity-20 group-hover:opacity-40 transition-opacity duration-700"
            preserveAspectRatio="none"
        >
            {/* Edges */}
            {edges.map((edge, i) => (
                <motion.line
                    key={`edge-${i}`}
                    x1={edge.x1}
                    y1={edge.y1}
                    x2={edge.x2}
                    y2={edge.y2}
                    stroke="url(#nn-gradient)"
                    strokeWidth="0.3"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: [0.2, 0.6, 0.2] }}
                    transition={{
                        pathLength: { duration: 1.5, delay: edge.delay * 0.3 },
                        opacity: { duration: 2, delay: edge.delay * 0.3, repeat: Infinity },
                    }}
                />
            ))}
            {/* Nodes */}
            {nodes.map((node, i) => (
                <motion.circle
                    key={`node-${i}`}
                    cx={node.x}
                    cy={node.y}
                    r="2"
                    fill={node.layer === 3 ? "#10b981" : "#00d4ff"}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 1, 0.4] }}
                    transition={{
                        duration: 2,
                        delay: node.layer * 0.4 + i * 0.1,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}
            <defs>
                <linearGradient id="nn-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0.6" />
                </linearGradient>
            </defs>
        </svg>
    );
}

/* ─── Victory Confetti Animation ─── */
function VictoryAnimation() {
    const emojis = ["🎉", "🏆", "💰", "📩", "⭐", "🎊"];
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30 group-hover:opacity-60 transition-opacity duration-500">
            {emojis.map((emoji, i) => (
                <motion.div
                    key={i}
                    className="absolute text-lg"
                    initial={{
                        x: `${30 + Math.random() * 40}%`,
                        y: "-10%",
                        rotate: 0,
                        opacity: 0,
                    }}
                    animate={{
                        y: "110%",
                        rotate: 360,
                        opacity: [0, 0.8, 0.8, 0],
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        delay: i * 0.6 + Math.random(),
                        repeat: Infinity,
                        repeatDelay: 2,
                        ease: "linear",
                    }}
                >
                    {emoji}
                </motion.div>
            ))}
        </div>
    );
}

/* ─── Document Upload Animation ─── */
function DocumentAnimation() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 group-hover:opacity-50 transition-opacity duration-500">
            {/* Floating Document Pages */}
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="absolute"
                    style={{
                        left: `${25 + i * 20}%`,
                        width: "24px",
                        height: "30px",
                        background: "linear-gradient(135deg, rgba(0,212,255,0.3), rgba(168,85,247,0.2))",
                        border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: "3px",
                    }}
                    initial={{ y: "120%", rotate: -5 + i * 5, opacity: 0 }}
                    animate={{
                        y: ["120%", "30%", "30%", "-20%"],
                        rotate: [-5 + i * 5, 0, 0, 5],
                        opacity: [0, 0.8, 0.8, 0],
                    }}
                    transition={{
                        duration: 4,
                        delay: i * 1.2,
                        repeat: Infinity,
                        repeatDelay: 2,
                        ease: "easeInOut",
                    }}
                >
                    {/* Line indicators on document */}
                    <div className="mt-2 mx-1 space-y-1">
                        <div className="h-[1px] bg-white/40 w-full" />
                        <div className="h-[1px] bg-white/30 w-3/4" />
                        <div className="h-[1px] bg-white/20 w-1/2" />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

/* ─── Step Data ─── */
const steps = [
    {
        num: "01",
        icon: "📄",
        title: "Upload Your Resume",
        subtitle: "60 seconds to launch",
        description:
            "Drop your CV, answer 3 quick questions about your dream role. Our AI builds your profile in under 60 seconds.",
        gradient: "from-cyan-500 to-blue-500",
        glowColor: "rgba(0,212,255,0.15)",
        borderGlow: "hover:shadow-[0_0_40px_rgba(0,212,255,0.15)]",
        accentBg: "from-cyan-500/10 to-blue-500/10",
    },
    {
        num: "02",
        icon: "🧠",
        title: "AI Goes to Work",
        subtitle: "24/7 autonomous agent",
        description:
            "Our neural engine scans 50+ job boards, tailors your resume & cover letter for each role, and applies automatically — while you sleep.",
        gradient: "from-violet-500 to-fuchsia-500",
        glowColor: "rgba(168,85,247,0.15)",
        borderGlow: "hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]",
        accentBg: "from-violet-500/10 to-fuchsia-500/10",
    },
    {
        num: "03",
        icon: "🏆",
        title: "You Get Interviews",
        subtitle: "Results, not promises",
        description:
            "Track everything in your dashboard, prep with AI mock interviews, and walk into every meeting confident. Average: 7 days to first interview.",
        gradient: "from-emerald-500 to-lime-500",
        glowColor: "rgba(16,185,129,0.15)",
        borderGlow: "hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]",
        accentBg: "from-emerald-500/10 to-lime-500/10",
    },
];

export default function HowItWorksSection() {
    return (
        <section id="how-it-works" className="py-24 sm:py-32 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-emerald rounded-full filter blur-[150px] opacity-[0.05]" />

            {/* CSS for pipeline beam */}
            <style jsx>{`
                @keyframes beamFlow {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                .beam-flow {
                    background: linear-gradient(
                        90deg,
                        transparent 0%,
                        rgba(0, 212, 255, 0.05) 20%,
                        rgba(0, 212, 255, 0.3) 40%,
                        rgba(168, 85, 247, 0.5) 50%,
                        rgba(16, 185, 129, 0.3) 60%,
                        rgba(16, 185, 129, 0.05) 80%,
                        transparent 100%
                    );
                    background-size: 200% 100%;
                    animation: beamFlow 4s linear infinite;
                }
                @keyframes pulseDot {
                    0%, 100% { transform: scale(1); opacity: 0.6; }
                    50% { transform: scale(1.5); opacity: 1; }
                }
                .pulse-dot {
                    animation: pulseDot 2s ease-in-out infinite;
                }
            `}</style>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <AnimatedSection className="text-center mb-20">
                    <span className="inline-block px-4 py-1.5 rounded-full glass text-neon-emerald text-sm font-medium mb-4">
                        3 Simple Steps
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                        How It <span className="gradient-text">Works</span>
                    </h2>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        From resume to offer letter — in three effortless steps.
                    </p>
                </AnimatedSection>

                {/* Pipeline layout */}
                <div className="relative">
                    {/* ─── Connecting Beam Line (Desktop) ─── */}
                    <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] -translate-y-1/2 z-0">
                        {/* Base line */}
                        <div className="h-[2px] bg-white/5 rounded-full" />
                        {/* Animated energy beam overlaid */}
                        <div className="absolute inset-0 h-[2px] beam-flow rounded-full" />
                        {/* Glowing dots at connection points */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-cyan-400 pulse-dot shadow-[0_0_15px_rgba(0,212,255,0.6)]" />
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-violet-400 pulse-dot shadow-[0_0_15px_rgba(168,85,247,0.6)]" style={{ animationDelay: "0.7s" }} />
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-400 pulse-dot shadow-[0_0_15px_rgba(16,185,129,0.6)]" style={{ animationDelay: "1.4s" }} />
                    </div>

                    {/* ─── Flowing Emojis along the beam (Desktop) ─── */}
                    <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] -translate-y-1/2 z-10 pointer-events-none">
                        {/* Document flowing from step 1 to step 2 */}
                        {["📄", "📝", "📋"].map((emoji, i) => (
                            <motion.div
                                key={`doc-${i}`}
                                className="absolute text-xl"
                                initial={{ left: "0%", opacity: 0, y: -10 }}
                                animate={{
                                    left: ["0%", "48%"],
                                    opacity: [0, 1, 1, 0],
                                    y: [-10, -15, -10, -5],
                                    scale: [0.7, 1.1, 1, 0.8],
                                }}
                                transition={{
                                    duration: 3,
                                    delay: i * 1.2 + 0.5,
                                    repeat: Infinity,
                                    repeatDelay: 2,
                                    ease: "easeInOut",
                                }}
                            >
                                {emoji}
                            </motion.div>
                        ))}
                        {/* AI brain flowing from step 2 to step 3 */}
                        {["🧠", "⚡", "✨"].map((emoji, i) => (
                            <motion.div
                                key={`ai-${i}`}
                                className="absolute text-xl"
                                initial={{ left: "50%", opacity: 0, y: -10 }}
                                animate={{
                                    left: ["50%", "98%"],
                                    opacity: [0, 1, 1, 0],
                                    y: [-10, -18, -10, -5],
                                    scale: [0.7, 1.2, 1, 0.8],
                                }}
                                transition={{
                                    duration: 3,
                                    delay: i * 1.2 + 1.5,
                                    repeat: Infinity,
                                    repeatDelay: 2,
                                    ease: "easeInOut",
                                }}
                            >
                                {emoji}
                            </motion.div>
                        ))}
                    </div>

                    {/* ─── Step Cards ─── */}
                    <div className="grid md:grid-cols-3 gap-8 relative z-10">
                        {steps.map((step, i) => (
                            <AnimatedSection key={i} delay={i * 0.2}>
                                <motion.div
                                    whileHover={{ y: -12, scale: 1.03 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className={`relative glass-card rounded-2xl p-8 card-hover text-center group cursor-default overflow-hidden border border-white/5 hover:border-white/10 ${step.borderGlow} transition-all duration-500`}
                                >
                                    {/* Step-specific background animation */}
                                    {i === 0 && <DocumentAnimation />}
                                    {i === 1 && <NeuralNetworkViz />}
                                    {i === 2 && <VictoryAnimation />}

                                    {/* Gradient accent bg on hover */}
                                    <div
                                        className={`absolute inset-0 bg-gradient-to-br ${step.accentBg} opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl`}
                                    />

                                    {/* Step number pill */}
                                    <div className="absolute -top-0 left-1/2 -translate-x-1/2 z-20">
                                        <motion.div
                                            className={`px-5 py-1.5 rounded-b-xl text-xs font-black text-white bg-gradient-to-r ${step.gradient} shadow-lg`}
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            STEP {step.num}
                                        </motion.div>
                                    </div>

                                    {/* Content */}
                                    <div className="relative z-10 pt-6">
                                        {/* Animated Icon */}
                                        <motion.div
                                            className="text-5xl mb-4 inline-block"
                                            animate={
                                                i === 0
                                                    ? { y: [0, -8, 0], rotate: [0, -5, 5, 0] }
                                                    : i === 1
                                                        ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }
                                                        : { y: [0, -6, 0], scale: [1, 1.15, 1] }
                                            }
                                            transition={{
                                                duration: i === 1 ? 3 : 2.5,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                            }}
                                        >
                                            {step.icon}
                                        </motion.div>

                                        <h3 className="text-xl font-bold text-white mb-1">
                                            {step.title}
                                        </h3>
                                        <p className={`text-xs font-semibold mb-4 bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent`}>
                                            {step.subtitle}
                                        </p>
                                        <p className="text-slate-400 text-sm leading-relaxed">
                                            {step.description}
                                        </p>

                                        {/* Mini progress indicator */}
                                        <div className="mt-6 flex justify-center gap-1.5">
                                            {[0, 1, 2].map((dot) => (
                                                <motion.div
                                                    key={dot}
                                                    className={`h-1.5 rounded-full ${dot <= i
                                                        ? `bg-gradient-to-r ${step.gradient} w-6`
                                                        : "bg-white/10 w-1.5"
                                                        }`}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: dot * 0.2 + 0.5 }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Bottom glow line */}
                                    <div
                                        className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${step.gradient} opacity-0 group-hover:opacity-60 transition-opacity duration-500`}
                                    />
                                </motion.div>
                            </AnimatedSection>
                        ))}
                    </div>

                    {/* ─── Arrow indicators between cards (Desktop) ─── */}
                    <div className="hidden md:flex absolute top-1/2 left-0 right-0 -translate-y-1/2 justify-between px-[30%] z-20 pointer-events-none">
                        {[0, 1].map((i) => (
                            <motion.div
                                key={i}
                                className="text-2xl"
                                animate={{
                                    x: [0, 8, 0],
                                    opacity: [0.4, 1, 0.4],
                                }}
                                transition={{
                                    duration: 1.5,
                                    delay: i * 0.5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            >
                                <span className="text-white/40 font-light text-3xl">→</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Bottom tagline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mt-14"
                >
                    <div className="inline-flex items-center gap-3 glass rounded-full px-6 py-3">
                        <motion.span
                            className="text-xl"
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                            ⏱️
                        </motion.span>
                        <p className="text-sm text-slate-300">
                            Average time from sign-up to first interview:{" "}
                            <span className="font-bold text-emerald-400">7 days</span>
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
