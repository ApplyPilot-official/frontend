"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

const messages = [
    "Applying to Software Engineer at Google...",
    "Generating tailored cover letter...",
    "Application submitted successfully. ✓",
];

export default function HeroLaptop() {
    const [messageIndex, setMessageIndex] = useState(0);
    const [displayText, setDisplayText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const typeMessage = useCallback(() => {
        const currentMessage = messages[messageIndex];

        if (!isDeleting) {
            if (displayText.length < currentMessage.length) {
                setTimeout(() => {
                    setDisplayText(currentMessage.slice(0, displayText.length + 1));
                }, 40 + Math.random() * 30);
            } else {
                setTimeout(() => setIsDeleting(true), 2000);
            }
        } else {
            if (displayText.length > 0) {
                setTimeout(() => {
                    setDisplayText(displayText.slice(0, -1));
                }, 20);
            } else {
                setIsDeleting(false);
                setMessageIndex((prev) => (prev + 1) % messages.length);
            }
        }
    }, [displayText, isDeleting, messageIndex]);

    useEffect(() => {
        const timer = setTimeout(typeMessage, 0);
        return () => clearTimeout(timer);
    }, [typeMessage]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 60, rotateX: 15 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            className="laptop-container relative w-full max-w-lg mx-auto"
        >
            {/* Glow effect behind laptop */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-400/20 via-primary-500/30 to-accent-400/20 rounded-3xl blur-3xl scale-110" />

            {/* Laptop Screen */}
            <div className="laptop-screen relative">
                <div className="relative bg-slate-900 rounded-t-2xl p-1 shadow-2xl shadow-primary-900/20">
                    {/* Camera notch */}
                    <div className="flex justify-center py-2">
                        <div className="w-2 h-2 rounded-full bg-slate-700" />
                    </div>

                    {/* Screen content */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg mx-1 mb-1 p-4 sm:p-6 min-h-[200px] sm:min-h-[260px]">
                        {/* Terminal header */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                            </div>
                            <span className="text-xs text-slate-500 ml-2 font-mono">
                                ApplyPilot Terminal
                            </span>
                        </div>

                        {/* Terminal lines */}
                        <div className="space-y-3 font-mono text-sm">
                            <div className="flex items-start gap-2">
                                <span className="text-green-400 shrink-0">$</span>
                                <span className="text-slate-300">applypilot start --auto</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-primary-400 shrink-0">→</span>
                                <span className="text-slate-400">
                                    Scanning 1,247 job listings...
                                </span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-primary-400 shrink-0">→</span>
                                <span className="text-slate-400">
                                    Found 18 matching positions
                                </span>
                            </div>

                            {/* Animated typing line */}
                            <motion.div
                                className="flex items-start gap-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <span className="text-yellow-400 shrink-0">⟩</span>
                                <span className="text-blue-300">
                                    {displayText}
                                    <span className="typing-cursor" />
                                </span>
                            </motion.div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-4 pt-3 border-t border-slate-700/50">
                            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                                <span>Progress</span>
                                <span>12/18 applications</span>
                            </div>
                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "67%" }}
                                    transition={{ duration: 2, delay: 1, ease: "easeOut" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Laptop Base / Keyboard */}
                <div className="relative">
                    <div className="bg-gradient-to-b from-slate-300 to-slate-400 rounded-b-xl h-3 mx-4 shadow-inner" />
                    <div className="flex justify-center -mt-0.5">
                        <div className="bg-slate-400 rounded-b-lg w-20 h-1" />
                    </div>
                </div>
            </div>

            {/* Reflection */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-primary-500/10 blur-xl rounded-full" />
        </motion.div>
    );
}
