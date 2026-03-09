// ATS Screener API route — Gemini-powered 6-platform scoring for authenticated users
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { buildFullScoringPrompt } from "@/lib/ats-screener/prompts";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

// Rate limiting
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const MAX_RPM = 10;

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    if (rateLimits.size > 5000) {
        rateLimits.forEach((val, key) => {
            if (now > val.resetAt) rateLimits.delete(key);
        });
    }
    const entry = rateLimits.get(ip);
    if (entry && now < entry.resetAt) {
        if (entry.count >= MAX_RPM) return false;
        entry.count++;
    } else {
        rateLimits.set(ip, { count: 1, resetAt: now + 60_000 });
    }
    return true;
}

function extractJSON(raw: string): unknown {
    const trimmed = raw.trim();
    try { return JSON.parse(trimmed); } catch { /* ignore */ }
    const cleaned = trimmed.replace(/```json\n?|\n?```/g, '').trim();
    try { return JSON.parse(cleaned); } catch { /* ignore */ }
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end > start) {
        try { return JSON.parse(cleaned.slice(start, end + 1)); } catch { /* ignore */ }
    }
    return null;
}

export async function POST(request: NextRequest) {
    // Auth check
    const session = await getServerSession();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (!GEMINI_API_KEY) {
        return NextResponse.json({ error: "Gemini API key not configured", fallback: true }, { status: 503 });
    }

    // Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(ip)) {
        return NextResponse.json({ error: "Rate limit exceeded. Try again in 60 seconds." }, { status: 429 });
    }

    let body: { resumeText?: string; jobDescription?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body.resumeText || body.resumeText.trim().length === 0) {
        return NextResponse.json({ error: "resumeText is required" }, { status: 400 });
    }
    if (body.resumeText.length > 50_000) {
        return NextResponse.json({ error: "resumeText exceeds maximum length" }, { status: 400 });
    }
    if (body.jobDescription && body.jobDescription.length > 20_000) {
        return NextResponse.json({ error: "jobDescription exceeds maximum length" }, { status: 400 });
    }

    const prompt = buildFullScoringPrompt(body.resumeText, body.jobDescription);

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 90_000);

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.3,
                        topP: 0.85,
                        maxOutputTokens: 16384,
                    },
                }),
                signal: controller.signal,
            }
        );

        clearTimeout(timeout);

        if (!response.ok) {
            const errBody = await response.text().catch(() => "");
            console.warn(`Gemini API returned ${response.status}: ${errBody.slice(0, 300)}`);
            return NextResponse.json({ error: "LLM scoring failed", fallback: true }, { status: 503 });
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

        if (!text) {
            return NextResponse.json({ error: "Empty response from LLM", fallback: true }, { status: 503 });
        }

        const parsed = extractJSON(text);
        if (!parsed || typeof parsed !== "object") {
            return NextResponse.json({ error: "Invalid JSON from LLM", fallback: true }, { status: 503 });
        }

        return NextResponse.json(
            { ...parsed as Record<string, unknown>, _provider: "gemini-2.0-flash", _fallback: false },
            {
                headers: {
                    "X-Content-Type-Options": "nosniff",
                    "Cache-Control": "no-store",
                },
            }
        );
    } catch (err) {
        const isTimeout = err instanceof DOMException && err.name === "AbortError";
        console.warn(`Gemini ${isTimeout ? "timed out" : "failed"}:`, err);
        return NextResponse.json({ error: "LLM scoring failed", fallback: true }, { status: 503 });
    }
}
