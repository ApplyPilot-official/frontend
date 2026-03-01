"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
    { href: "/#features", label: "Features" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/#reviews", label: "Reviews" },
    { href: "/#business", label: "For Business" },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                ? "glass-dark shadow-lg shadow-black/20 py-3"
                : "bg-transparent py-5"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="relative w-11 h-11 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-lg shadow-white/10">
                            <Image
                                src="/logo.png"
                                alt="ApplyPilot"
                                width={36}
                                height={36}
                                className="object-contain"
                            />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">
                            Apply<span className="gradient-text">Pilot</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm text-slate-300 hover:text-white transition-colors relative group"
                            >
                                {link.label}
                                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-neon-blue to-neon-violet group-hover:w-full transition-all duration-300" />
                            </Link>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link
                            href="/login"
                            className="text-sm text-slate-300 hover:text-white transition-colors px-4 py-2"
                        >
                            Log In
                        </Link>
                        <Link
                            href="/login"
                            className="glow-btn text-sm font-semibold text-white px-6 py-2.5 rounded-full"
                        >
                            Start Applying Free
                        </Link>
                    </div>

                    {/* Mobile Hamburger */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-1.5"
                        aria-label="Toggle menu"
                    >
                        <motion.span
                            animate={
                                mobileOpen
                                    ? { rotate: 45, y: 5 }
                                    : { rotate: 0, y: 0 }
                            }
                            className="w-6 h-0.5 bg-white rounded-full block"
                        />
                        <motion.span
                            animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                            className="w-6 h-0.5 bg-white rounded-full block"
                        />
                        <motion.span
                            animate={
                                mobileOpen
                                    ? { rotate: -45, y: -5 }
                                    : { rotate: 0, y: 0 }
                            }
                            className="w-6 h-0.5 bg-white rounded-full block"
                        />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="md:hidden glass-dark mt-2 mx-4 rounded-2xl overflow-hidden"
                    >
                        <div className="p-6 space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="block text-sm text-slate-300 hover:text-white py-2 transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="pt-4 border-t border-white/10 space-y-3">
                                <Link
                                    href="/login"
                                    className="block text-sm text-slate-300 hover:text-white py-2"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/login"
                                    className="glow-btn block text-center text-sm font-semibold text-white px-6 py-3 rounded-full"
                                >
                                    Start Applying Free
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
