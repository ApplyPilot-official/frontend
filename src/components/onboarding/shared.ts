// Shared types and utilities for onboarding components
import masterFormSchema from "@/masterFormSchema.json";

export interface SchemaField {
    id: string;
    key: string;
    label: string;
    type: string;
    mandatory: boolean;
    aiExtractFromResume: boolean;
    userMustFillIfNull: boolean;
    options?: string | string[];
    showIf?: string;
    displayNote?: string;
    recommendationMessage?: string;
    recommended?: boolean;
    important?: string;
}

export interface SchemaSection {
    sectionId: string;
    sectionName: string;
    isArray: boolean;
    arrayKey?: string;
    fields: SchemaField[];
    important?: string;
    displayNote?: string;
}

export const schema = masterFormSchema as { sections: SchemaSection[] };

export type OnboardingScreen = "upload" | "loading" | "error" | "gap" | "complete";

export const LOADING_MESSAGES = [
    "Uploading your resume...",
    "Reading your personal details...",
    "Extracting your work experience...",
    "Analyzing your education...",
    "Picking up your skills...",
    "Almost done, building your profile...",
];

export const ALWAYS_SHOW_SECTIONS = ["S6", "S7"];
export const CREDENTIALS_SECTION = "S9";

export function getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
}
