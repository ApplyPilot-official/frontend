"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-surface-100 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
            }
        >
            <LoginContent />
        </Suspense>
    );
}

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (session) {
            router.push("/dashboard");
        }
    }, [session, router]);

    useEffect(() => {
        if (searchParams.get("verified") === "true") {
            setSuccess("Email verified! You can now log in.");
        }
        const errParam = searchParams.get("error");
        if (errParam === "expired-token") {
            setError("Verification link has expired. Please sign up again.");
        } else if (errParam === "invalid-token") {
            setError("Invalid verification link.");
        } else if (errParam === "CredentialsSignin") {
            setError("Invalid email or password.");
        }
    }, [searchParams]);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        try {
            if (mode === "signup") {
                const res = await fetch("/api/auth/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, name }),
                });
                const data = await res.json();
                if (!res.ok) {
                    setError(data.error || "Something went wrong");
                    return;
                }
                setSuccess(data.message || "Account created! Check your email.");
                setMode("login");
            } else {
                const result = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                });

                if (result?.error) {
                    setError("Invalid email or password");
                } else if (result?.ok) {
                    router.push("/dashboard");
                }
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-100 flex items-center justify-center px-4 pt-20">
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative w-full max-w-md"
            >
                <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-surface-300">
                    {/* Logo */}
                    <div className="flex justify-center mb-6">
                        <div className="relative w-16 h-16 bg-white rounded-2xl p-2 shadow-md border border-surface-200">
                            <Image
                                src="/logo.png"
                                alt="ApplyPilot"
                                fill
                                className="object-contain p-1"
                            />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-surface-950 text-center mb-2">
                        {mode === "login" ? "Welcome Back" : "Create Account"}
                    </h1>
                    <p className="text-surface-500 text-center text-sm mb-6">
                        {mode === "login"
                            ? "Sign in to continue your job search"
                            : "Start automating your job applications"}
                    </p>

                    {/* Alerts */}
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-accent-red text-sm"
                            >
                                {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-accent-green text-sm"
                            >
                                {success}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Google Sign In */}
                    <button
                        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                        className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border border-surface-300 rounded-2xl hover:bg-surface-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group mb-6"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        <span className="text-sm font-semibold text-surface-700 group-hover:text-surface-900">
                            Continue with Google
                        </span>
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px bg-surface-300" />
                        <span className="text-xs text-surface-500 uppercase tracking-wider">
                            or
                        </span>
                        <div className="flex-1 h-px bg-surface-300" />
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        {mode === "signup" && (
                            <div>
                                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    placeholder="John Doe"
                                    className="w-full px-4 py-3 bg-surface-100 border border-surface-300 rounded-xl text-surface-900 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1.5">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 bg-surface-100 border border-surface-300 rounded-xl text-surface-900 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                                placeholder="Min 8 characters"
                                className="w-full px-4 py-3 bg-surface-100 border border-surface-300 rounded-xl text-surface-900 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 px-6 text-sm font-bold text-surface-950 bg-primary-500 rounded-xl hover:bg-primary-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    {mode === "login" ? "Signing in..." : "Creating account..."}
                                </span>
                            ) : mode === "login" ? (
                                "Sign In"
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    {/* Toggle mode */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setMode(mode === "login" ? "signup" : "login");
                                setError("");
                                setSuccess("");
                            }}
                            className="text-sm text-surface-500 hover:text-primary-600 transition-colors"
                        >
                            {mode === "login"
                                ? "Don't have an account? Sign up"
                                : "Already have an account? Sign in"}
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-surface-500">
                            By signing in, you agree to our{" "}
                            <a
                                href="/terms-of-use"
                                className="text-primary-500 hover:underline"
                            >
                                Terms of Use
                            </a>{" "}
                            and{" "}
                            <a
                                href="/privacy-policy"
                                className="text-primary-500 hover:underline"
                            >
                                Privacy Policy
                            </a>
                            .
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
