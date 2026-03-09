"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LOADING_MESSAGES } from "./shared";

export default function LoadingScreen() {
    const [msgIndex, setMsgIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="py-12 text-center"
        >
            {/* Animated spinner */}
            <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-dark-50/20" />
                <div className="absolute inset-0 rounded-full border-4 border-t-neon-blue border-r-neon-violet border-b-transparent border-l-transparent animate-spin" />
                <div className="absolute inset-3 rounded-full border-4 border-dark-50/10" />
                <div
                    className="absolute inset-3 rounded-full border-4 border-t-transparent border-r-transparent border-b-neon-emerald border-l-neon-blue animate-spin"
                    style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-2xl">🤖</div>
            </div>

            {/* Cycling messages */}
            <AnimatePresence mode="wait">
                <motion.p
                    key={msgIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-lg font-medium text-white mb-2"
                >
                    {LOADING_MESSAGES[msgIndex]}
                </motion.p>
            </AnimatePresence>

            <p className="text-sm text-slate-500">This usually takes 15–30 seconds</p>

            {/* Step progress */}
            <div className="mt-8 max-w-xs mx-auto">
                <div className="flex gap-1.5">
                    {LOADING_MESSAGES.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= msgIndex
                                    ? "bg-gradient-to-r from-neon-blue to-neon-violet"
                                    : "bg-dark-50/20"
                                }`}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
