"use client";

import { SchemaField } from "./shared";

interface FieldInputProps {
    field: SchemaField;
    sectionId: string;
    value: unknown;
    onChange: (key: string, value: unknown) => void;
    allValues: Record<string, unknown>;
}

export default function FieldInput({ field, sectionId, value, onChange, allValues }: FieldInputProps) {
    // Check conditional show logic
    if (field.showIf) {
        try {
            const orMatch = field.showIf.match(/(\w+)\s*===\s*'([^']+)'\s*\|\|\s*\w+\s*===\s*'([^']+)'/);
            if (orMatch) {
                const [, key, val1, val2] = orMatch;
                const cv = allValues[key];
                if (cv !== val1 && cv !== val2) return null;
            } else {
                const match = field.showIf.match(/(\w+)\s*===\s*'([^']+)'/);
                if (match) {
                    const [, key, val] = match;
                    if (allValues[key] !== val) return null;
                }
            }
        } catch { /* show field if parse fails */ }
    }

    const currentValue = value ?? "";
    const inputClass =
        "w-full px-4 py-3 bg-surface-100 border border-surface-300 rounded-xl text-surface-950 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm transition-all";
    const fieldKey = `${sectionId}_${field.key}`;

    if (field.type === "select" && Array.isArray(field.options)) {
        return (
            <div key={fieldKey}>
                <label className="block text-xs text-surface-600 mb-1.5">
                    {field.label} {field.mandatory && <span className="text-red-400">*</span>}
                </label>
                <select
                    value={currentValue as string}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    className={inputClass}
                >
                    <option value="">Select...</option>
                    {field.options.map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
                {field.recommendationMessage && (
                    <p className="text-xs text-surface-500 mt-1">{field.recommendationMessage}</p>
                )}
            </div>
        );
    }

    if (field.type === "multiselect" && Array.isArray(field.options)) {
        const selected = (currentValue as string[]) || [];
        return (
            <div key={fieldKey}>
                <label className="block text-xs text-surface-600 mb-1.5">
                    {field.label} {field.mandatory && <span className="text-red-400">*</span>}
                </label>
                <div className="flex flex-wrap gap-2">
                    {field.options.map((opt: string) => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => {
                                const newSel = selected.includes(opt)
                                    ? selected.filter((s: string) => s !== opt)
                                    : [...selected, opt];
                                onChange(field.key, newSel);
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selected.includes(opt)
                                ? "bg-primary-500/20 text-primary-400 border border-primary-500/40"
                                : "bg-surface-100 text-surface-600 border border-surface-300 hover:border-primary-500/30"
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (field.type === "boolean") {
        return (
            <div key={fieldKey}>
                <label className="block text-xs text-surface-600 mb-1.5">
                    {field.label} {field.mandatory && <span className="text-red-400">*</span>}
                </label>
                <div className="flex gap-3">
                    {[{ label: "Yes", value: true }, { label: "No", value: false }].map(({ label, value: v }) => (
                        <button
                            key={label}
                            type="button"
                            onClick={() => onChange(field.key, v)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${currentValue === v
                                ? "bg-primary-500/20 text-primary-400 border border-primary-500/40"
                                : "bg-surface-100 text-surface-600 border border-surface-300 hover:border-primary-500/30"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (field.type === "tags") {
        const tags = (Array.isArray(currentValue) ? currentValue : []) as string[];
        return (
            <div key={fieldKey} className="sm:col-span-2">
                <label className="block text-xs text-surface-600 mb-1.5">
                    {field.label} {field.mandatory && <span className="text-red-400">*</span>}
                </label>
                <input
                    type="text"
                    className={`${inputClass} mb-2`}
                    placeholder="Type and press Enter"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val && !tags.includes(val)) {
                                onChange(field.key, [...tags, val]);
                                (e.target as HTMLInputElement).value = "";
                            }
                        }
                    }}
                />
                <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag: string, i: number) => (
                        <span
                            key={`${tag}-${i}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-500/10 text-primary-400 text-xs rounded-full"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => onChange(field.key, tags.filter((_: string, idx: number) => idx !== i))}
                                className="hover:text-red-400 ml-0.5"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            </div>
        );
    }

    if (field.type === "textarea") {
        return (
            <div key={fieldKey} className="sm:col-span-2">
                <label className="block text-xs text-surface-600 mb-1.5">
                    {field.label} {field.mandatory && <span className="text-red-400">*</span>}
                </label>
                <textarea
                    value={currentValue as string}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    className={`${inputClass} min-h-[80px] resize-y`}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                />
            </div>
        );
    }

    // Date / Month picker — always render a calendar input
    if (field.type === "date" || field.type === "month") {
        return (
            <div key={fieldKey}>
                <label className="block text-xs text-surface-600 mb-1.5">
                    {field.label} {field.mandatory && <span className="text-red-400">*</span>}
                </label>
                <div className="relative">
                    <input
                        type="date"
                        value={currentValue as string}
                        onChange={(e) => onChange(field.key, e.target.value)}
                        className={`${inputClass} cursor-pointer `}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none">📅</span>
                </div>
                {field.recommendationMessage && (
                    <p className="text-xs text-surface-500 mt-1">{field.recommendationMessage}</p>
                )}
            </div>
        );
    }

    // Default: text, email, tel, url, number, password
    const inputType = ["password", "email", "tel", "url", "number"].includes(field.type) ? field.type : "text";

    return (
        <div key={fieldKey}>
            <label className="block text-xs text-surface-600 mb-1.5">
                {field.label} {field.mandatory && <span className="text-red-400">*</span>}
            </label>
            <input
                type={inputType}
                value={currentValue as string}
                onChange={(e) => onChange(field.key, e.target.value)}
                className={inputClass}
                placeholder={`Enter ${field.label.toLowerCase()}`}
            />
            {field.recommendationMessage && (
                <p className="text-xs text-surface-500 mt-1">{field.recommendationMessage}</p>
            )}
        </div>
    );
}
