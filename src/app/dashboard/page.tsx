"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

export default function DashboardPage() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center hero-bg">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!session) {
        redirect("/login");
    }

    const stats = [
        { label: "Applications Sent", value: "0", icon: "📨" },
        { label: "Interviews Scheduled", value: "0", icon: "📅" },
        { label: "Response Rate", value: "—", icon: "📈" },
        { label: "Active Jobs Tracked", value: "0", icon: "💼" },
    ];

    return (
        <div className="min-h-screen hero-bg pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Welcome Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div className="flex items-center gap-4">
                        {session.user?.image && (
                            <Image
                                src={session.user.image}
                                alt=""
                                width={48}
                                height={48}
                                className="rounded-full ring-2 ring-primary-200"
                            />
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                Welcome back, {session.user?.name?.split(" ")[0]}!
                            </h1>
                            <p className="text-sm text-slate-500">{session.user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="px-4 py-2 text-sm font-medium text-slate-600 glass rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                    >
                        Sign Out
                    </button>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-strong rounded-2xl p-6 card-hover"
                        >
                            <div className="text-2xl mb-2">{stat.icon}</div>
                            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                            <p className="text-sm text-slate-500">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Placeholder Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-strong rounded-2xl p-12 text-center"
                >
                    <div className="text-5xl mb-4">🚀</div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">
                        Your AI Copilot is Ready
                    </h2>
                    <p className="text-slate-500 max-w-md mx-auto mb-6">
                        Set up your profile and preferences to start receiving AI-matched
                        job applications. It only takes 5 minutes.
                    </p>
                    <button className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all">
                        Complete Your Profile
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
