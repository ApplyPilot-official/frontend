"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";

const applicationSteps = [
    { text: "Initializing ApplyPilot Agent...", icon: "⚡", color: "text-blue-400" },
    { text: "Connected to 50+ job boards ✓", icon: "🌐", color: "text-emerald-400" },
    { text: "Scanning 2,847 new listings...", icon: "🔍", color: "text-blue-400" },
    { text: "Found 23 matching positions ✓", icon: "✅", color: "text-emerald-400" },
    { text: "Tailoring resume → Google SWE III", icon: "📄", color: "text-yellow-300" },
    { text: "ATS Score: 94/100 — Optimized ✓", icon: "📊", color: "text-emerald-400" },
    { text: "Cover letter generated ✓", icon: "✉️", color: "text-emerald-400" },
    { text: "Submitting → Google...", icon: "🚀", color: "text-yellow-300" },
    { text: "Application #1 submitted ✓", icon: "✅", color: "text-emerald-400" },
    { text: "Tailoring resume → Meta ML Eng", icon: "📄", color: "text-yellow-300" },
    { text: "Cover letter generated ✓", icon: "✉️", color: "text-emerald-400" },
    { text: "Submitting → Meta...", icon: "🚀", color: "text-yellow-300" },
    { text: "Application #2 submitted ✓", icon: "✅", color: "text-emerald-400" },
    { text: "Tailoring resume → Amazon DS", icon: "📄", color: "text-yellow-300" },
    { text: "Submitting → Amazon...", icon: "🚀", color: "text-yellow-300" },
    { text: "Application #3 submitted ✓", icon: "✅", color: "text-emerald-400" },
];

export default function HeroLaptop() {
    const [visibleLines, setVisibleLines] = useState<number>(0);
    const [currentTyping, setCurrentTyping] = useState("");
    const [progress, setProgress] = useState(0);
    const [appCount, setAppCount] = useState(0);
    const terminalRef = useRef<HTMLDivElement>(null);

    // Auto-scroll terminal to bottom
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [visibleLines, currentTyping]);

    const typeNextLine = useCallback(() => {
        if (visibleLines >= applicationSteps.length) {
            setTimeout(() => {
                setVisibleLines(0);
                setCurrentTyping("");
                setProgress(0);
                setAppCount(0);
            }, 4000);
            return;
        }

        const line = applicationSteps[visibleLines];
        let charIndex = 0;

        const typeChar = () => {
            if (charIndex <= line.text.length) {
                setCurrentTyping(line.text.slice(0, charIndex));
                charIndex++;
                setTimeout(typeChar, 20 + Math.random() * 12);
            } else {
                setVisibleLines((prev) => prev + 1);
                setCurrentTyping("");
                setProgress((prev) => Math.min(prev + (100 / applicationSteps.length), 100));
                // Count submitted apps
                if (line.text.includes("submitted")) {
                    setAppCount((prev) => prev + 1);
                }
                setTimeout(typeNextLine, 300);
            }
        };
        setTimeout(typeChar, 150);
    }, [visibleLines]);

    useEffect(() => {
        const timer = setTimeout(typeNextLine, 1200);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (visibleLines > 0 && visibleLines < applicationSteps.length) {
            // typeNextLine chain handles progression
        }
    }, [visibleLines]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 60, rotateX: 12 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            className="relative w-full max-w-xl mx-auto"
            style={{ perspective: "1200px" }}
        >
            {/* Ambient glow behind laptop */}
            <div className="absolute -inset-6 bg-gradient-to-r from-primary-500/15 via-accent-green/10 to-accent-yellow/10 rounded-[40px] blur-[80px] opacity-80" />
            <div className="absolute -inset-3 bg-gradient-to-b from-primary-500/8 to-transparent rounded-3xl blur-[40px]" />

            {/* === LAPTOP SCREEN (LID) === */}
            <div className="relative">
                {/* Outer bezel */}
                <div className="relative bg-gradient-to-b from-[#2a2a30] to-[#1a1a20] rounded-t-[20px] p-[6px] shadow-2xl shadow-black/60 border border-white/[0.08]">
                    {/* Camera + sensors bar */}
                    <div className="flex items-center justify-center gap-2 py-1.5">
                        <div className="w-1 h-1 rounded-full bg-slate-600" />
                        <div className="w-2 h-2 rounded-full bg-slate-700 ring-1 ring-slate-600/50 relative">
                            <div className="absolute inset-0.5 rounded-full bg-slate-800" />
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-600" />
                    </div>

                    {/* Inner screen bezel */}
                    <div className="bg-[#0a0a12] rounded-lg overflow-hidden border border-white/[0.04]">
                        {/* macOS-style toolbar */}
                        <div className="flex items-center gap-2 px-3 py-2 bg-[#1c1c26] border-b border-white/[0.06]">
                            <div className="flex gap-1.5">
                                <div className="w-[10px] h-[10px] rounded-full bg-[#ff5f57] shadow-sm shadow-red-500/30" />
                                <div className="w-[10px] h-[10px] rounded-full bg-[#febc2e] shadow-sm shadow-yellow-500/30" />
                                <div className="w-[10px] h-[10px] rounded-full bg-[#28c840] shadow-sm shadow-green-500/30" />
                            </div>
                            <div className="flex-1 flex justify-center">
                                <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.06]">
                                    <svg className="w-2.5 h-2.5 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <span className="text-[9px] text-surface-600 font-mono">applypilot.com/agent</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[8px] text-emerald-400 font-mono font-bold tracking-wider">LIVE</span>
                            </div>
                        </div>

                        {/* Status bar */}
                        <div className="flex items-center justify-between px-3 py-1.5 bg-[#12121a] border-b border-white/[0.04]">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <span className="text-[9px]">🤖</span>
                                    <span className="text-[9px] text-blue-400 font-mono font-semibold">Agent v2.0</span>
                                </div>
                                <div className="w-px h-3 bg-white/10" />
                                <div className="flex items-center gap-1">
                                    <span className="text-[9px]">📊</span>
                                    <span className="text-[9px] text-surface-600 font-mono">Mode: <span className="text-yellow-300">Aggressive</span></span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-[9px]">🚀</span>
                                <span className="text-[9px] text-emerald-400 font-mono font-bold">{appCount} sent</span>
                            </div>
                        </div>

                        {/* Terminal body — scrollable, no truncation */}
                        <div
                            ref={terminalRef}
                            className="px-3 py-3 font-mono text-[11px] leading-[1.6] h-[230px] sm:h-[260px] overflow-y-auto scrollbar-hide"
                            style={{ scrollBehavior: "smooth" }}
                        >
                            {/* Init line */}
                            <div className="flex items-start gap-2 mb-1">
                                <span className="text-emerald-400 shrink-0">$</span>
                                <span className="text-surface-700">applypilot start --auto --mode=aggressive</span>
                            </div>
                            <div className="flex items-start gap-2 mb-2">
                                <span className="text-surface-600 shrink-0">~</span>
                                <span className="text-surface-500 text-[10px]">Starting AI job application pipeline...</span>
                            </div>

                            {/* Completed lines */}
                            {applicationSteps.slice(0, visibleLines).map((step, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-start gap-2 mb-0.5"
                                >
                                    <span className="shrink-0 w-4 text-center">{step.icon}</span>
                                    <span className={`${step.color}`}>{step.text}</span>
                                </motion.div>
                            ))}

                            {/* Currently typing */}
                            {visibleLines < applicationSteps.length && currentTyping && (
                                <div className="flex items-start gap-2 mb-0.5">
                                    <span className="shrink-0 w-4 text-center text-yellow-400">⟩</span>
                                    <span className="text-surface-700">
                                        {currentTyping}
                                        <motion.span
                                            animate={{ opacity: [1, 0] }}
                                            transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
                                            className="inline-block w-[6px] h-[13px] bg-blue-400 ml-0.5 align-middle rounded-sm"
                                        />
                                    </span>
                                </div>
                            )}

                            {/* Idle cursor */}
                            {visibleLines < applicationSteps.length && !currentTyping && (
                                <div className="flex items-start gap-2">
                                    <span className="text-emerald-400 shrink-0">$</span>
                                    <motion.span
                                        animate={{ opacity: [1, 0] }}
                                        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                                        className="inline-block w-[6px] h-[13px] bg-emerald-400 rounded-sm"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Bottom status bar — progress + stats */}
                        <div className="px-3 py-2 bg-[#0e0e16] border-t border-white/[0.06]">
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] text-surface-500 font-mono">Progress</span>
                                    <span className="text-[9px] font-mono font-bold text-blue-400">{Math.round(progress)}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] text-surface-500 font-mono">Jobs matched: <span className="text-emerald-400">23</span></span>
                                    <span className="text-[9px] text-surface-500 font-mono">|</span>
                                    <span className="text-[9px] text-surface-500 font-mono">Sent: <span className="text-blue-400">{appCount}</span></span>
                                </div>
                            </div>
                            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{
                                        background: "linear-gradient(90deg, #4285F4, #34A853, #FBBC05)",
                                    }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* === LAPTOP BASE (KEYBOARD) === */}
                <div className="relative">
                    {/* Hinge */}
                    <div className="h-[5px] bg-gradient-to-b from-[#2a2a30] to-[#3a3a42] mx-2 rounded-b-sm shadow-inner" />

                    {/* Keyboard deck */}
                    <div className="bg-gradient-to-b from-[#2e2e35] to-[#252530] rounded-b-2xl pt-1.5 pb-2 px-2 mx-1 border border-t-0 border-white/[0.06] shadow-xl shadow-black/40">
                        {/* Keyboard rows */}
                        <div className="space-y-[3px] px-1">
                            {[14, 14, 13, 12].map((keys, row) => (
                                <div key={row} className="flex gap-[2px] justify-center" style={{ paddingLeft: row === 2 ? '4px' : row === 3 ? '12px' : '0' }}>
                                    {Array.from({ length: keys }).map((_, k) => (
                                        <div
                                            key={k}
                                            className={`h-[7px] rounded-[2px] bg-[#1a1a22] border border-white/[0.04] ${row === 3 && k === 5 ? 'flex-[3]' : 'flex-1'
                                                }`}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Trackpad */}
                        <div className="mt-2 mx-auto w-[45%] h-[30px] rounded-lg bg-[#1e1e28] border border-white/[0.06] shadow-inner" />
                    </div>
                </div>
            </div>

            {/* Desk reflection */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[90%] h-4 bg-primary-500/8 blur-xl rounded-full" />
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[70%] h-2 bg-accent-green/8 blur-lg rounded-full" />
        </motion.div>
    );
}
