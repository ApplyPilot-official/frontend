"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { OnboardingScreen, getAuthHeaders } from "@/components/onboarding/shared";
import UploadScreen from "@/components/onboarding/UploadScreen";
import LoadingScreen from "@/components/onboarding/LoadingScreen";
import ErrorScreen from "@/components/onboarding/ErrorScreen";
import GapFormScreen from "@/components/onboarding/GapFormScreen";
import CredentialsScreen from "@/components/onboarding/CredentialsScreen";

export default function OnboardingPage() {
    const { status: sessionStatus } = useSession();
    const router = useRouter();
    const [screen, setScreen] = useState<OnboardingScreen>("upload");
    const [error, setError] = useState("");
    const [gapFields, setGapFields] = useState<string[]>([]);
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch initial status on mount
    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch("/api/profile/status", { headers: getAuthHeaders() });
            if (!res.ok) return;
            const data = await res.json();

            switch (data.processingStatus) {
                case "processing":
                    setScreen("loading");
                    break;
                case "needs_input":
                    setGapFields(data.gapFields || []);
                    setScreen("gap");
                    break;
                case "complete":
                    router.push("/profile");
                    break;
                case "failed":
                    setError("We had trouble reading your resume. Please try again.");
                    setScreen("error");
                    break;
                default:
                    setScreen("upload");
            }
        } catch {
            // No profile yet
        }
    }, [router]);

    useEffect(() => {
        if (sessionStatus === "authenticated") fetchStatus();
    }, [sessionStatus, fetchStatus]);

    // Poll for status changes during loading screen
    useEffect(() => {
        if (screen !== "loading") {
            if (pollRef.current) clearInterval(pollRef.current);
            return;
        }

        pollRef.current = setInterval(async () => {
            try {
                const res = await fetch("/api/profile/status", { headers: getAuthHeaders() });
                if (!res.ok) return;
                const data = await res.json();

                if (data.processingStatus === "needs_input") {
                    setGapFields(data.gapFields || []);
                    setScreen("gap");
                } else if (data.processingStatus === "failed") {
                    setError("We had trouble reading your resume. Please try again.");
                    setScreen("error");
                } else if (data.processingStatus === "complete") {
                    router.push("/profile");
                }
            } catch { /* keep polling */ }
        }, 5000);

        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [screen, router]);

    // After upload completes, trigger processing and switch to loading
    const handleUploadComplete = async () => {
        setScreen("loading");
        try {
            const res = await fetch("/api/profile/process-resume", {
                method: "POST",
                headers: getAuthHeaders(),
            });
            if (!res.ok) {
                const data = await res.json();
                if (data.processingStatus === "failed") {
                    setError("We had trouble reading your resume. Please try again.");
                    setScreen("error");
                    return;
                }
            }
            const data = await res.json();
            if (data.processingStatus === "needs_input") {
                const statusRes = await fetch("/api/profile/status", { headers: getAuthHeaders() });
                if (statusRes.ok) {
                    const s = await statusRes.json();
                    setGapFields(s.gapFields || []);
                }
                setScreen("gap");
            }
        } catch {
            setError("Processing failed. Please try again.");
            setScreen("error");
        }
    };

    const handleRetry = async () => {
        setError("");
        setScreen("loading");
        try {
            const res = await fetch("/api/profile/process-resume", {
                method: "POST",
                headers: getAuthHeaders(),
            });
            if (!res.ok) {
                const data = await res.json();
                if (data.processingStatus === "failed") {
                    setError("We had trouble reading your resume. Please try again.");
                    setScreen("error");
                }
            } else {
                const data = await res.json();
                if (data.processingStatus === "needs_input") {
                    const statusRes = await fetch("/api/profile/status", { headers: getAuthHeaders() });
                    if (statusRes.ok) {
                        const s = await statusRes.json();
                        setGapFields(s.gapFields || []);
                    }
                    setScreen("gap");
                }
            }
        } catch {
            setError("Retry failed. Please try again.");
            setScreen("error");
        }
    };

    if (sessionStatus === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-100">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (sessionStatus === "unauthenticated") {
        router.push("/login");
        return null;
    }

    return (
        <div className="min-h-screen bg-surface-100 pt-24 pb-16">
            <div className="max-w-2xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-2xl font-bold text-surface-950 mb-2">
                        {screen === "gap" ? "Complete Your Profile" : screen === "credentials" ? "Almost Done!" : "Set Up Your Profile"}
                    </h1>
                    <p className="text-sm text-surface-600">
                        {screen === "gap"
                            ? "Review and fill in the details below"
                            : screen === "credentials"
                                ? "Add your account credentials for auto-applying"
                                : "Upload your resume and let our AI do the work"}
                    </p>
                </motion.div>

                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-surface-300">
                    <AnimatePresence mode="wait">
                        {screen === "upload" && (
                            <UploadScreen
                                onUploadComplete={handleUploadComplete}
                                getAuthHeaders={getAuthHeaders}
                            />
                        )}
                        {screen === "loading" && <LoadingScreen />}
                        {screen === "error" && (
                            <ErrorScreen
                                error={error}
                                onRetry={handleRetry}
                                onReupload={() => {
                                    setError("");
                                    setScreen("upload");
                                }}
                            />
                        )}
                        {screen === "gap" && (
                            <GapFormScreen
                                gapFields={gapFields}
                                onSubmitComplete={() => setScreen("credentials")}
                            />
                        )}
                        {screen === "credentials" && (
                            <CredentialsScreen
                                onComplete={() => router.push("/profile")}
                                getAuthHeaders={getAuthHeaders}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
