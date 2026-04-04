"use client";

import { motion } from "framer-motion";

export default function SocialProofTagline() {
    return (
        <section className="relative py-16 overflow-hidden">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="inline-block px-8 py-6 rounded-2xl bg-gradient-to-r from-primary-50 via-white to-green-50 border border-primary-100 shadow-sm"
                >
                    <p className="text-2xl sm:text-3xl font-bold text-surface-900 leading-snug">
                        Try us once. Trust us —{" "}
                        <span className="gradient-text">you&apos;ll bring your friends.</span>{" "}
                        <span className="inline-block animate-bounce">🤝</span>
                    </p>
                </motion.div>
            </div>
            <div className="max-w-4xl mx-auto px-4 text-center mt-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="inline-block px-8 py-6 rounded-2xl bg-gradient-to-r from-green-50 via-white to-primary-50 border border-primary-100 shadow-sm"
                >
                    <p className="text-2xl sm:text-3xl font-bold text-surface-900 leading-snug">
                         We find you jobs —{" "}
                        <span className="gradient-text">before they even hit the boards.</span>{" "}
                        <span className="inline-block animate-pulse">🚀</span>
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
