"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import masterFormSchema from "@/masterFormSchema.json";
import { SchemaField, SchemaSection, getAuthHeaders } from "@/components/onboarding/shared";
import InlineEditField from "@/components/profile/InlineEditField";

const schema = masterFormSchema as { sections: SchemaSection[] };

// Section display order
const SECTION_ORDER = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9"];

const SECTION_ICONS: Record<string, string> = {
    S1: "👤", S2: "🎓", S3: "💼", S4: "🚀", S5: "⚡",
    S6: "🗽", S7: "🎯", S8: "📇", S9: "🔐",
};

const CREDENTIAL_KEYS = ["linkedInEmail", "linkedInPassword", "linkedInPhone", "gmailAddress", "gmailPassword", "gmailRecoveryPhone"];

interface ProfileData {
    processingStatus: string;
    masterProfile: Record<string, unknown>;
    resumeFileName?: string;
    resumeUploadedAt?: string;
}

export default function ProfilePage() {
    const { status: sessionStatus } = useSession();
    const router = useRouter();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = useCallback(async () => {
        try {
            const res = await fetch("/api/profile", { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                if (data.profile) {
                    setProfile({
                        processingStatus: data.profile.processingStatus,
                        masterProfile: data.profile.masterProfile || {},
                        resumeFileName: data.profile.resumeFileName,
                        resumeUploadedAt: data.profile.resumeUploadedAt,
                    });
                } else {
                    router.push("/onboarding");
                }
            }
        } catch {
            // ignore
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        if (sessionStatus === "authenticated") fetchProfile();
    }, [sessionStatus, fetchProfile]);

    if (sessionStatus === "loading" || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-700">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (sessionStatus === "unauthenticated") {
        router.push("/login");
        return null;
    }

    if (!profile || !["complete", "approved"].includes(profile.processingStatus)) {
        router.push("/onboarding");
        return null;
    }

    const mp = profile.masterProfile;

    const getFieldValue = (field: SchemaField, section: SchemaSection) => {
        if (section.isArray && section.arrayKey) {
            return mp[section.arrayKey];
        }
        return mp[field.key];
    };

    const renderArraySection = (section: SchemaSection) => {
        const entries = (mp[section.arrayKey!] as Record<string, unknown>[]) || [];

        return (
            <div className="space-y-3">
                {entries.length === 0 ? (
                    <p className="text-sm text-slate-500 italic py-2">No entries yet</p>
                ) : (
                    entries.map((entry, idx) => (
                        <div key={idx} className="bg-dark-600/50 rounded-xl p-4 border border-dark-50/10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-slate-500 font-medium">
                                    Entry {idx + 1}
                                </span>
                            </div>
                            {section.fields.map((field) => (
                                <InlineEditField
                                    key={`${field.id}-${idx}`}
                                    field={field}
                                    value={entry[field.key]}
                                    fieldPath={`masterProfile.${section.arrayKey}.${idx}.${field.key}`}
                                    isCredential={false}
                                    getAuthHeaders={getAuthHeaders}
                                />
                            ))}
                        </div>
                    ))
                )}
                <button
                    onClick={async () => {
                        const newEntry: Record<string, unknown> = {};
                        section.fields.forEach((f) => { newEntry[f.key] = null; });
                        const updated = [...entries, newEntry];
                        try {
                            await fetch("/api/profile", {
                                method: "PATCH",
                                headers: getAuthHeaders(),
                                body: JSON.stringify({
                                    fieldPath: `masterProfile.${section.arrayKey}`,
                                    value: updated,
                                }),
                            });
                            fetchProfile();
                        } catch { /* ignore */ }
                    }}
                    className="w-full py-2 text-xs font-medium text-slate-400 bg-dark-600 rounded-xl border border-dashed border-dark-50/30 hover:border-primary-500/30 hover:text-primary-400 transition-all"
                >
                    + Add New {section.sectionName.replace(/s$/, "")}
                </button>
            </div>
        );
    };

    const renderFlatSection = (section: SchemaSection) => {
        const isCredentials = section.sectionId === "S9";

        // If credentials section and nothing saved, show prompt
        if (isCredentials) {
            const hasAnyCredential = section.fields.some((f) => mp[f.key]);
            if (!hasAnyCredential) {
                return (
                    <div className="text-center py-4">
                        <p className="text-sm text-slate-400 mb-3">
                            Add your login details to enable auto-applying
                        </p>
                        <button
                            onClick={() => router.push("/onboarding")}
                            className="px-4 py-2 text-xs font-medium text-neon-violet bg-neon-violet/10 rounded-xl border border-neon-violet/20 hover:bg-neon-violet/20 transition-all"
                        >
                            Add Now →
                        </button>
                    </div>
                );
            }
        }

        return (
            <div>
                {section.fields.map((field) => (
                    <InlineEditField
                        key={field.id}
                        field={field}
                        value={getFieldValue(field, section)}
                        fieldPath={`masterProfile.${field.key}`}
                        isCredential={CREDENTIAL_KEYS.includes(field.key)}
                        getAuthHeaders={getAuthHeaders}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-dark-700 pt-24 pb-16">
            <div className="max-w-3xl mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-2xl font-bold text-white mb-1">Your Profile</h1>
                    <p className="text-sm text-slate-400">
                        Manage your profile information for AI-powered job applications
                    </p>
                </motion.div>

                {/* Resume Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-dark-400 rounded-2xl p-5 border border-dark-50/20 mb-6"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-lg">
                                📄
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">
                                    {profile.resumeFileName || "Resume"}
                                </p>
                                {profile.resumeUploadedAt && (
                                    <p className="text-xs text-slate-500">
                                        Uploaded {new Date(profile.resumeUploadedAt).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => router.push("/onboarding")}
                            className="px-3 py-1.5 text-xs font-medium text-slate-400 bg-dark-600 rounded-lg border border-dark-50/20 hover:border-primary-500/30 hover:text-primary-400 transition-all"
                        >
                            Replace Resume
                        </button>
                    </div>
                    <p className="text-[10px] text-yellow-500/70 mt-2">
                        ⚠️ Replacing your resume will re-trigger AI extraction
                    </p>
                </motion.div>

                {/* Profile Sections */}
                <div className="space-y-4">
                    {SECTION_ORDER.map((sectionId, idx) => {
                        const section = schema.sections.find((s) => s.sectionId === sectionId);
                        if (!section) return null;

                        return (
                            <motion.div
                                key={sectionId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + idx * 0.03 }}
                                className={`bg-dark-400 rounded-2xl p-5 border ${sectionId === "S9" ? "border-neon-violet/20" : "border-dark-50/20"
                                    }`}
                            >
                                <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                    <span className="text-lg">{SECTION_ICONS[sectionId] || "📋"}</span>
                                    {section.sectionName}
                                </h2>

                                {section.isArray && section.arrayKey
                                    ? renderArraySection(section)
                                    : renderFlatSection(section)}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
