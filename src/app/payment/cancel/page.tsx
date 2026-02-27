"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function PaymentCancelPage() {
    return (
        <div className="min-h-screen hero-bg flex items-center justify-center px-4 pt-20">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="glass-strong rounded-3xl p-10 text-center max-w-md w-full"
            >
                <div className="w-16 h-16 mx-auto rounded-full bg-yellow-100 flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                    Payment Cancelled
                </h1>
                <p className="text-slate-500 mb-6">
                    No worries! Your payment was not processed. You can try again anytime.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/pricing"
                        className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl hover:shadow-lg transition-all"
                    >
                        Try Again
                    </Link>
                    <Link
                        href="/"
                        className="px-6 py-3 text-sm font-semibold text-slate-600 glass rounded-xl hover:shadow-lg transition-all"
                    >
                        Go Home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
