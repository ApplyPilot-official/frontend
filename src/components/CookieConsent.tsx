"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function CookieConsent() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("cookie-consent");
        if (!consent) {
            // Small delay so it doesn't flash on page load
            const timer = setTimeout(() => setVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookie-consent", "accepted");
        setVisible(false);
        // Notify GoogleAnalytics component in same tab
        window.dispatchEvent(new Event("cookie-consent-updated"));
    };

    const handleDecline = () => {
        localStorage.setItem("cookie-consent", "declined");
        setVisible(false);
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed bottom-0 left-0 right-0 z-[9999] p-4"
                >
                    <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-xl rounded-2xl border border-surface-300 shadow-2xl shadow-black/10 p-5 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            {/* Icon + Text */}
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <span className="text-2xl flex-shrink-0 mt-0.5">🍪</span>
                                <div>
                                    <h3 className="text-sm font-semibold text-surface-950 mb-1">
                                        We value your privacy
                                    </h3>
                                    <p className="text-xs text-surface-600 leading-relaxed">
                                        We use cookies and similar technologies to improve your experience,
                                        analyze site traffic, and personalize content. By clicking &quot;Accept All&quot;,
                                        you consent to our use of cookies.{" "}
                                        <Link
                                            href="/privacy-policy"
                                            className="text-primary-500 hover:text-primary-600 underline underline-offset-2"
                                        >
                                            Privacy Policy
                                        </Link>
                                    </p>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                                <button
                                    onClick={handleDecline}
                                    className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-medium text-surface-600 bg-surface-100 border border-surface-300 rounded-xl hover:bg-surface-200 hover:text-surface-900 transition-all"
                                >
                                    Decline
                                </button>
                                <button
                                    onClick={handleAccept}
                                    className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5 transition-all"
                                >
                                    Accept All
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
