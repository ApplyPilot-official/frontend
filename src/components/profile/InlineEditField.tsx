"use client";

import { useState } from "react";
import { SchemaField } from "@/components/onboarding/shared";

interface InlineEditFieldProps {
    field: SchemaField;
    value: unknown;
    fieldPath: string;
    isCredential?: boolean;
    getAuthHeaders: () => HeadersInit;
}

export default function InlineEditField({ field, value, fieldPath, isCredential, getAuthHeaders }: InlineEditFieldProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState<unknown>(value);
    const [isSaving, setIsSaving] = useState(false);
    const [displayValue, setDisplayValue] = useState(value);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: getAuthHeaders(),
                body: JSON.stringify({ fieldPath, value: editValue }),
            });
            if (res.ok) {
                setDisplayValue(editValue);
                setIsEditing(false);
            }
        } catch { /* ignore */ } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditValue(displayValue);
        setIsEditing(false);
    };

    const inputClass = "w-full px-3 py-2 bg-dark-600 border border-dark-50/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50";

    // Format display value
    const formatDisplay = () => {
        const v = displayValue;
        if (v === null || v === undefined || v === "") return <span className="text-slate-600 italic">Not provided</span>;
        if (field.type === "boolean") return v ? "Yes" : "No";
        if (field.type === "tags" && Array.isArray(v)) {
            return (
                <div className="flex flex-wrap gap-1">
                    {(v as string[]).map((tag, i) => (
                        <span key={`${tag}-${i}`} className="px-2 py-0.5 bg-primary-500/10 text-primary-400 text-xs rounded-full">
                            {tag}
                        </span>
                    ))}
                </div>
            );
        }
        if (field.type === "password" || isCredential) return "••••••••";
        if (Array.isArray(v)) return (v as string[]).join(", ");
        return String(v);
    };

    // Render edit input
    const renderEditInput = () => {
        if (field.type === "select" && Array.isArray(field.options)) {
            return (
                <select value={editValue as string} onChange={(e) => setEditValue(e.target.value)} className={inputClass}>
                    <option value="">Select...</option>
                    {field.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            );
        }
        if (field.type === "boolean") {
            return (
                <div className="flex gap-2">
                    {[{ l: "Yes", v: true }, { l: "No", v: false }].map(({ l, v }) => (
                        <button key={l} type="button" onClick={() => setEditValue(v)}
                            className={`px-4 py-2 rounded-lg text-xs font-medium ${editValue === v ? "bg-primary-500/20 text-primary-400 border border-primary-500/40" : "bg-dark-600 text-slate-400 border border-dark-50/30"}`}>
                            {l}
                        </button>
                    ))}
                </div>
            );
        }
        if (field.type === "textarea") {
            return <textarea value={editValue as string} onChange={(e) => setEditValue(e.target.value)} className={`${inputClass} min-h-[60px] resize-y`} />;
        }
        if (field.type === "multiselect" && Array.isArray(field.options)) {
            const selected = (editValue as string[]) || [];
            return (
                <div className="flex flex-wrap gap-1.5">
                    {field.options.map((opt: string) => (
                        <button key={opt} type="button"
                            onClick={() => setEditValue(selected.includes(opt) ? selected.filter((s: string) => s !== opt) : [...selected, opt])}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium ${selected.includes(opt)
                                ? "bg-primary-500/20 text-primary-400 border border-primary-500/40"
                                : "bg-dark-600 text-slate-400 border border-dark-50/30"}`}>
                            {opt}
                        </button>
                    ))}
                </div>
            );
        }
        const inputType = ["password", "email", "tel", "url", "number", "date", "month"].includes(field.type) ? field.type : "text";
        return <input type={inputType} value={editValue as string} onChange={(e) => setEditValue(e.target.value)} className={inputClass} />;
    };

    return (
        <div className="flex items-start gap-3 py-2.5 border-b border-dark-50/10 last:border-0">
            <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 mb-0.5">{field.label}</p>
                {isEditing ? (
                    <div className="space-y-2 mt-1">
                        {renderEditInput()}
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-3 py-1 text-xs font-medium text-white bg-primary-500/20 border border-primary-500/40 rounded-lg hover:bg-primary-500/30 transition-all disabled:opacity-50"
                            >
                                {isSaving ? "Saving..." : "Save"}
                            </button>
                            <button
                                onClick={handleCancel}
                                className="px-3 py-1 text-xs font-medium text-slate-400 bg-dark-600 border border-dark-50/30 rounded-lg hover:bg-dark-300 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-white">{formatDisplay()}</div>
                )}
            </div>
            {!isEditing && (
                <button
                    onClick={() => setIsEditing(true)}
                    className="shrink-0 px-2 py-1 text-[10px] font-medium text-slate-500 hover:text-primary-400 bg-dark-600 hover:bg-primary-500/10 rounded-md border border-dark-50/20 hover:border-primary-500/30 transition-all"
                >
                    Edit
                </button>
            )}
        </div>
    );
}
