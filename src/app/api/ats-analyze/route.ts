import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://resume-ats-analyzer-without-login.applypilot.us";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json(
                { detail: "No file provided" },
                { status: 400 }
            );
        }

        const externalFormData = new FormData();
        externalFormData.append("file", file);

        const response = await fetch(`${API_BASE}/api/analyze`, {
            method: "POST",
            body: externalFormData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorDetail = "Failed to analyze resume";
            try {
                const errorJson = JSON.parse(errorText);
                errorDetail = errorJson.detail || errorDetail;
            } catch {
                // use default error message
            }
            return NextResponse.json(
                { detail: errorDetail },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("ATS analyze error:", error);
        return NextResponse.json(
            { detail: "Internal server error while analyzing resume" },
            { status: 500 }
        );
    }
}
