"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function PaymentSuccessPage() {
    return (
        <div className="min-h-screen hero-bg flex items-center justify-center px-4 pt-20">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="glass-strong rounded-3xl p-10 text-center max-w-md w-full"
            >
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                    Payment Successful!
                </h1>
                <p className="text-slate-500 mb-6">
                    Welcome aboard! Your Pro plan is now active. Let&apos;s start automating your job search.
                </p>
                <Link
                    href="/dashboard"
                    className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl hover:shadow-lg transition-all"
                >
                    Go to Dashboard →
                </Link>
            </motion.div>
        </div>
    );
}
