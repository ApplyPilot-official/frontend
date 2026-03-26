"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { schema, getAuthHeaders } from "./shared";
import FieldInput from "./FieldInput";

interface GapFormScreenProps {
    gapFields: string[];
    onSubmitComplete: () => void;
}

const SECTION_ICONS: Record<string, string> = {
    S1: "👤", S2: "🎓", S3: "💼", S4: "🚀", S5: "⚡",
    S6: "🗽", S7: "🎯",
};

// Fields to show autofilled from AI for user review/correction in S1
const S1_REVIEW_FIELDS = ["zipCode", "linkedInUrl", "githubUrl", "portfolioUrl", "pronouns"];

// Fields to show for user in S5 (these are optional but useful to review)
const S5_USER_FIELDS = ["softSkills", "hobbies", "certifications"];

// For array sections, these optional fields should be shown for each entry for user to fill
const S2_OPTIONAL_FIELDS = ["gpa", "gpaScale", "eduStartDate", "eduEndDate"];
const S3_OPTIONAL_FIELDS = ["employmentType"];

export default function GapFormScreen({ gapFields, onSubmitComplete }: GapFormScreenProps) {
    const [extractedData, setExtractedData] = useState<Record<string, unknown>>({});
    const [gapAnswers, setGapAnswers] = useState<Record<string, unknown>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/profile", { headers: getAuthHeaders() });
                if (res.ok) {
                    const data = await res.json();
                    if (data.profile?.extractedData) {
                        setExtractedData(data.profile.extractedData);
                    }
                }
            } catch { /* ignore */ }
        })();
    }, []);

    const updateGapAnswer = (key: string, value: unknown) => {
        setGapAnswers((prev) => ({ ...prev, [key]: value }));
    };

    // For array entries, update nested values
    const updateArrayEntry = (arrayKey: string, index: number, fieldKey: string, value: unknown) => {
        setGapAnswers((prev) => {
            const arr = [...((prev[arrayKey] || extractedData[arrayKey] || []) as Record<string, unknown>[])];
            if (!arr[index]) arr[index] = {};
            arr[index] = { ...arr[index], [fieldKey]: value };
            return { ...prev, [arrayKey]: arr };
        });
    };

    const getArrayEntryValue = (arrayKey: string, index: number, fieldKey: string): unknown => {
        const gapArr = gapAnswers[arrayKey] as Record<string, unknown>[] | undefined;
        if (gapArr?.[index]?.[fieldKey] !== undefined) return gapArr[index][fieldKey];
        const extArr = extractedData[arrayKey] as Record<string, unknown>[] | undefined;
        if (extArr?.[index]?.[fieldKey] !== undefined) return extArr[index][fieldKey];
        return "";
    };

    const allValues = { ...extractedData, ...gapAnswers };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError("");
        try {
            // Send ALL values (extracted + user answers merged) not just gap answers
            const allData = { ...extractedData, ...gapAnswers };
            const res = await fetch("/api/profile/gap-submit", {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(allData),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save");
            }
            onSubmitComplete();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save profile");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Build sections to display ──

    // S1: mandatory gaps + review fields (linkedin, github, portfolio, zip)
    const renderS1Section = () => {
        const s1 = schema.sections.find((s) => s.sectionId === "S1");
        if (!s1) return null;

        // Get gap field IDs for S1
        const s1GapIds = gapFields
            .filter((g) => g.startsWith("S1_"))
            .map((g) => g.replace(/\[\d+\]$/, ""));

        // Mandatory gap fields
        const gapFieldsList = s1.fields.filter((f) => s1GapIds.includes(f.id));
        // Optional review fields (show pre-filled, user can correct)
        const reviewFields = s1.fields.filter((f) => S1_REVIEW_FIELDS.includes(f.key) && !s1GapIds.includes(f.id));

        if (gapFieldsList.length === 0 && reviewFields.length === 0) return null;

        return (
            <div className="bg-white rounded-2xl p-5 border border-surface-300">
                <h3 className="text-sm font-semibold text-surface-950 mb-4 flex items-center gap-2">
                    <span className="text-lg">{SECTION_ICONS.S1}</span>
                    {s1.sectionName}
                </h3>

                {gapFieldsList.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs text-yellow-400/80 mb-3">Missing from resume — please fill in:</p>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {gapFieldsList.map((field) => (
                                <FieldInput key={field.id} field={field} sectionId="S1" value={allValues[field.key]} onChange={updateGapAnswer} allValues={allValues} />
                            ))}
                        </div>
                    </div>
                )}

                {reviewFields.length > 0 && (
                    <div>
                        <p className="text-xs text-surface-500 mb-3">Review & correct (auto-filled from resume):</p>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {reviewFields.map((field) => (
                                <FieldInput key={field.id} field={field} sectionId="S1" value={allValues[field.key]} onChange={updateGapAnswer} allValues={allValues} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Array sections: S2, S3 — show pre-filled entries with optional fields to fill
    const renderArraySection = (sectionId: string, optionalFieldKeys: string[]) => {
        const section = schema.sections.find((s) => s.sectionId === sectionId);
        if (!section || !section.arrayKey) return null;

        const entries = (extractedData[section.arrayKey] as Record<string, unknown>[]) || [];
        if (entries.length === 0) return null;

        // Build gap field IDs for this section
        const sectionGapIds = gapFields
            .filter((g) => g.startsWith(sectionId + "_"))
            .map((g) => g.replace(/\[\d+\]$/, ""));

        // Fields that are marked as gaps
        const gapFieldsList = section.fields.filter((f) => sectionGapIds.includes(f.id));
        // Optional fields we always want user to review
        const optionalFields = section.fields.filter((f) => optionalFieldKeys.includes(f.key));
        // Combine (unique)
        const fieldsToShow = [...gapFieldsList];
        for (const f of optionalFields) {
            if (!fieldsToShow.find((g) => g.id === f.id)) fieldsToShow.push(f);
        }

        if (fieldsToShow.length === 0) return null;

        return (
            <div className="bg-white rounded-2xl p-5 border border-surface-300">
                <h3 className="text-sm font-semibold text-surface-950 mb-4 flex items-center gap-2">
                    <span className="text-lg">{SECTION_ICONS[sectionId]}</span>
                    {section.sectionName}
                </h3>

                {entries.map((entry, idx) => {
                    // Show a summary of the entry (e.g. university name or company name)
                    const entryLabel = (entry as Record<string, unknown>)[
                        sectionId === "S2" ? "universityName" : "companyName"
                    ] as string || `Entry ${idx + 1}`;
                    const subtitle = sectionId === "S2"
                        ? (entry.degree as string || "")
                        : (entry.jobTitle as string || "");

                    return (
                        <div key={idx} className="mb-4 last:mb-0">
                            <div className="bg-surface-100/50 rounded-xl p-4 border border-surface-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-bold text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-full">
                                        {idx + 1}
                                    </span>
                                    <span className="text-sm font-medium text-surface-950">{entryLabel}</span>
                                    {subtitle && <span className="text-xs text-surface-500">· {subtitle}</span>}
                                </div>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {fieldsToShow.map((field) => {
                                        const isMandatoryGap = sectionGapIds.includes(field.id);
                                        return (
                                            <FieldInput
                                                key={`${field.id}-${idx}`}
                                                field={{ ...field, mandatory: isMandatoryGap }}
                                                sectionId={sectionId}
                                                value={getArrayEntryValue(section.arrayKey!, idx, field.key)}
                                                onChange={(_key, value) => updateArrayEntry(section.arrayKey!, idx, field.key, value)}
                                                allValues={allValues}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // S5: Show soft skills, hobbies, certifications for user to add/review
    const renderS5Section = () => {
        const s5 = schema.sections.find((s) => s.sectionId === "S5");
        if (!s5) return null;

        const fieldsToShow = s5.fields.filter((f) => S5_USER_FIELDS.includes(f.key));
        if (fieldsToShow.length === 0) return null;

        return (
            <div className="bg-white rounded-2xl p-5 border border-surface-300">
                <h3 className="text-sm font-semibold text-surface-950 mb-4 flex items-center gap-2">
                    <span className="text-lg">{SECTION_ICONS.S5}</span>
                    Skills, Hobbies & Certifications
                </h3>
                <p className="text-xs text-surface-500 mb-3">Add or review these optional fields:</p>
                <div className="grid sm:grid-cols-2 gap-4">
                    {fieldsToShow.map((field) => (
                        <FieldInput key={field.id} field={field} sectionId="S5" value={allValues[field.key]} onChange={updateGapAnswer} allValues={allValues} />
                    ))}
                </div>
            </div>
        );
    };

    // S6, S7: always shown
    const renderAlwaysShowSection = (sectionId: string) => {
        const section = schema.sections.find((s) => s.sectionId === sectionId);
        if (!section) return null;

        return (
            <div className="bg-white rounded-2xl p-5 border border-surface-300">
                <h3 className="text-sm font-semibold text-surface-950 mb-4 flex items-center gap-2">
                    <span className="text-lg">{SECTION_ICONS[sectionId]}</span>
                    {section.sectionName}
                </h3>
                {section.important && (
                    <p className="text-xs text-yellow-400 bg-yellow-400/5 rounded-lg p-2 mb-3">
                        ⚠️ {section.important}
                    </p>
                )}
                <div className="grid sm:grid-cols-2 gap-4">
                    {section.fields.map((field) => (
                        <FieldInput key={field.id} field={field} sectionId={sectionId} value={allValues[field.key]} onChange={updateGapAnswer} allValues={allValues} />
                    ))}
                </div>
            </div>
        );
    };



    return (
        <motion.div
            key="gap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="text-center mb-2">
                <div className="text-4xl mb-3">📝</div>
                <h2 className="text-xl font-bold text-surface-950 mb-2">Almost there — just a few details</h2>
                <p className="text-sm text-surface-600">
                    We extracted most of your profile from the resume. Review the sections below and fill in anything missing.
                </p>
            </div>

            {/* S1 — Personal Information (gaps + review fields) */}
            {renderS1Section()}

            {/* S2 — Education entries with optional fields */}
            {renderArraySection("S2", S2_OPTIONAL_FIELDS)}

            {/* S3 — Work Experience entries with optional fields */}
            {renderArraySection("S3", S3_OPTIONAL_FIELDS)}

            {/* S5 — Soft skills, hobbies, certifications */}
            {renderS5Section()}

            {/* S6 — US Work Authorization */}
            {renderAlwaysShowSection("S6")}

            {/* S7 — Job Preferences */}
            {renderAlwaysShowSection("S7")}



            {error && (
                <p className="text-sm text-red-400 bg-red-50 border border-red-500/20 rounded-xl p-3">
                    {error}
                </p>
            )}

            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-3.5 text-sm font-bold text-white bg-gradient-to-r from-accent-green to-primary-500 rounded-xl hover:shadow-lg hover:shadow-accent-green/30 transition-all disabled:opacity-60"
            >
                {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving your profile...
                    </span>
                ) : (
                    "Complete Profile & Continue 🚀"
                )}
            </button>
        </motion.div>
    );
}
