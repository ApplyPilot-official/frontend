"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";

const navLinks = [
    { href: "/#features", label: "Features" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/#reviews", label: "Reviews" },
    { href: "/#business", label: "For Business" },
];

export default function Navbar() {
    const { data: session } = useSession();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [helpUnread, setHelpUnread] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchUnread = useCallback(async () => {
        if (!session?.user) return;
        try {
            const headers: HeadersInit = { "Content-Type": "application/json" };
            if (typeof window !== "undefined") {
                const token = localStorage.getItem("token");
                if (token) headers["Authorization"] = `Bearer ${token}`;
            }
            const res = await fetch("/api/helpdesk/unread", { headers });
            if (res.ok) {
                const data = await res.json();
                setHelpUnread(data.unreadCount || 0);
            }
        } catch { /* ignore */ }
    }, [session?.user]);

    useEffect(() => { fetchUnread(); }, [fetchUnread]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const userInitial = session?.user?.name?.[0]?.toUpperCase() || "U";

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

                    {/* Desktop Nav — only show landing page links when logged out */}
                    {!session && (
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
                    )}

                    {/* Right side: CTA or Profile */}
                    <div className="hidden md:flex items-center gap-3">
                        {session ? (
                            /* ── Logged-in: profile icon + dropdown ── */
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-full hover:bg-white/5 transition-all"
                                >
                                    {session.user?.image ? (
                                        <Image
                                            src={session.user.image}
                                            alt=""
                                            width={36}
                                            height={36}
                                            className="rounded-full ring-2 ring-primary-500/40"
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-neon-violet flex items-center justify-center text-white font-bold text-sm ring-2 ring-primary-500/30">
                                            {userInitial}
                                        </div>
                                    )}
                                    <svg
                                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                <AnimatePresence>
                                    {profileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-full mt-2 w-56 bg-dark-400 border border-dark-50/30 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
                                        >
                                            {/* User info */}
                                            <div className="px-4 py-3 border-b border-dark-50/20">
                                                <p className="text-sm font-semibold text-white truncate">
                                                    {session.user?.name || "User"}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate">
                                                    {session.user?.email}
                                                </p>
                                            </div>

                                            <div className="py-1.5">
                                                <Link
                                                    href="/dashboard"
                                                    onClick={() => setProfileOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-dark-300 transition-colors"
                                                >
                                                    <span>📊</span> Dashboard
                                                </Link>
                                                <Link
                                                    href="/onboarding"
                                                    onClick={() => setProfileOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-dark-300 transition-colors"
                                                >
                                                    <span>👤</span> Edit Profile
                                                </Link>
                                                <Link
                                                    href="/subscription"
                                                    onClick={() => setProfileOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-dark-300 transition-colors"
                                                >
                                                    <span>💎</span> Subscription
                                                </Link>
                                                <Link
                                                    href="/dashboard?tab=helpdesk"
                                                    onClick={() => setProfileOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-dark-300 transition-colors"
                                                >
                                                    <span>🎫</span> Help Desk
                                                    {helpUnread > 0 && (
                                                        <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ml-auto">
                                                            {helpUnread}
                                                        </span>
                                                    )}
                                                </Link>
                                            </div>

                                            <div className="border-t border-dark-50/20 py-1.5">
                                                <button
                                                    onClick={() => signOut({ callbackUrl: "/" })}
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                                                >
                                                    <span>🚪</span> Sign Out
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            /* ── Logged-out: Login + CTA buttons ── */
                            <>
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
                            </>
                        )}
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
                            {!session && navLinks.map((link) => (
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
                                {session ? (
                                    <>
                                        <div className="flex items-center gap-3 mb-3">
                                            {session.user?.image ? (
                                                <Image
                                                    src={session.user.image}
                                                    alt=""
                                                    width={32}
                                                    height={32}
                                                    className="rounded-full"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-neon-violet flex items-center justify-center text-white font-bold text-xs">
                                                    {userInitial}
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-medium text-white">{session.user?.name}</p>
                                                <p className="text-xs text-slate-500">{session.user?.email}</p>
                                            </div>
                                        </div>
                                        <Link
                                            href="/dashboard"
                                            onClick={() => setMobileOpen(false)}
                                            className="block text-sm text-slate-300 hover:text-white py-2"
                                        >
                                            📊 Dashboard
                                        </Link>
                                        <Link
                                            href="/onboarding"
                                            onClick={() => setMobileOpen(false)}
                                            className="block text-sm text-slate-300 hover:text-white py-2"
                                        >
                                            👤 Edit Profile
                                        </Link>
                                        <Link
                                            href="/subscription"
                                            onClick={() => setMobileOpen(false)}
                                            className="block text-sm text-slate-300 hover:text-white py-2"
                                        >
                                            💎 Subscription
                                        </Link>
                                        <Link
                                            href="/dashboard?tab=helpdesk"
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white py-2"
                                        >
                                            🎫 Help Desk
                                            {helpUnread > 0 && (
                                                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                                    {helpUnread}
                                                </span>
                                            )}
                                        </Link>
                                        <button
                                            onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }); }}
                                            className="block text-sm text-red-400 hover:text-red-300 py-2"
                                        >
                                            🚪 Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            onClick={() => setMobileOpen(false)}
                                            className="block text-sm text-slate-300 hover:text-white py-2"
                                        >
                                            Log In
                                        </Link>
                                        <Link
                                            href="/login"
                                            onClick={() => setMobileOpen(false)}
                                            className="glow-btn block text-center text-sm font-semibold text-white px-6 py-3 rounded-full"
                                        >
                                            Start Applying Free
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
