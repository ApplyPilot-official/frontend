"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PaymentSuccessPage() {
    const { data: session } = useSession();
    const [confetti, setConfetti] = useState<{ x: number; y: number; color: string; delay: number }[]>([]);

    useEffect(() => {
        const particles = Array.from({ length: 50 }, () => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            color: ["#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"][
                Math.floor(Math.random() * 6)
            ],
            delay: Math.random() * 2,
        }));
        setConfetti(particles);
    }, []);

    return (
        <div className="min-h-screen bg-dark-700 flex items-center justify-center px-4 overflow-hidden relative">
            {/* Confetti */}
            {confetti.map((p, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: -20, x: `${p.x}vw` }}
                    animate={{
                        opacity: [0, 1, 1, 0],
                        y: ["0vh", "100vh"],
                        rotate: [0, 360, 720],
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        delay: p.delay,
                        ease: "easeOut",
                    }}
                    className="absolute top-0 w-2 h-2 rounded-full pointer-events-none"
                    style={{ backgroundColor: p.color, left: `${p.x}%` }}
                />
            ))}

            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center max-w-lg relative z-10"
            >
                {/* Success icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-neon-emerald to-primary-500 flex items-center justify-center shadow-2xl shadow-neon-emerald/30"
                >
                    <svg
                        className="w-12 h-12 text-white"
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
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl sm:text-4xl font-bold text-white mb-4"
                >
                    Payment Successful! 🎉
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-slate-400 mb-2"
                >
                    Welcome to ApplyPilot{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}!
                </motion.p>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm text-slate-500 mb-8"
                >
                    Your subscription is now active. A confirmation email has been sent to your inbox.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-3"
                >
                    <Link
                        href="/onboarding"
                        className="inline-flex items-center px-8 py-4 text-sm font-bold text-white bg-gradient-to-r from-neon-blue to-primary-500 rounded-xl hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all"
                    >
                        Complete Your Profile →
                    </Link>

                    <p className="text-xs text-slate-600">
                        or{" "}
                        <Link href="/dashboard" className="text-primary-400 hover:underline">
                            go to dashboard
                        </Link>
                    </p>
                </motion.div>

                {/* Trust badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12 flex items-center justify-center gap-6 text-xs text-slate-600"
                >
                    <span>🔒 Secure Payment</span>
                    <span>📧 Receipt Sent</span>
                    <span>💰 30-Day Guarantee</span>
                </motion.div>
            </motion.div>
        </div>
    );
}
