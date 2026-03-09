import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dbConnect from '@/lib/db';
import Profile from '@/models/Profile';
import { getAuthUser } from '@/lib/auth';
import masterFormSchema from '@/masterFormSchema.json';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Sections that should be extracted by Gemini (S1–S5)
const AI_SECTIONS = ['S1', 'S2', 'S3', 'S4', 'S5'];

interface SchemaField {
    id: string;
    key: string;
    label: string;
    type: string;
    mandatory: boolean;
    aiCanAssume: boolean;
    aiExtractFromResume: boolean;
    userMustFillIfNull: boolean;
    notes?: string;
    aiAssumptionLogic?: string;
    options?: string | string[];
}

interface SchemaSection {
    sectionId: string;
    sectionName: string;
    isArray: boolean;
    arrayKey?: string;
    fields: SchemaField[];
}

function buildPrompt(section: SchemaSection): string {
    const mandatoryFields: string[] = [];
    const optionalFields: string[] = [];

    for (const field of section.fields) {
        if (!field.aiExtractFromResume) continue;

        const fieldDesc = `- ${field.key} (${field.label}): type=${field.type}${field.options ? `, options=${JSON.stringify(field.options)}` : ''}${field.notes ? `, notes: ${field.notes}` : ''}${field.aiAssumptionLogic ? `, inference allowed: ${field.aiAssumptionLogic}` : ''}`;

        if (field.mandatory) {
            mandatoryFields.push(fieldDesc);
        } else {
            optionalFields.push(fieldDesc);
        }
    }

    const isArraySection = section.isArray;
    const projectLimit = section.sectionId === 'S4'
        ? '\n- IMPORTANT: Return at most 3 projects. Pick the most relevant or impressive ones. Do NOT return more than 3.'
        : '';
    const arrayInstruction = isArraySection
        ? `\n\nARRAY SECTION: This section returns an ARRAY of objects. Key: "${section.arrayKey}".
- Always return an ARRAY even if only one entry exists
- One entry = one separate object in the array
- Never merge two separate entries into one object
- Return { "${section.arrayKey}": [] } if none found
- Return format: { "${section.arrayKey}": [ { fields... }, { fields... } ] }${projectLimit}`
        : '';

    return `You are a resume parser for Apply Pilot, a US job application platform for students.

You will receive a resume and two field lists: MANDATORY and OPTIONAL.

RULE 1 — MANDATORY FIELDS (zero tolerance for errors):
- Extract ONLY if the value is explicitly and clearly written in the resume
- Return the exact value as written — no changes, no formatting, no cleanup
- If NOT found or unclear → return null. That is the correct answer.
- NEVER infer, guess, complete, or assume a mandatory field
- A wrong value is worse than null. Always choose null over a guess.

RULE 2 — OPTIONAL FIELDS (best effort):
- Extract if explicitly present
- You MAY infer from strong contextual evidence
- If nothing to support it → return null
- Inference examples that are allowed:
    Title says "Software Engineering Intern" → employmentType = "Internship"
    End date is missing or says "Present" → currentlyWorking = true
    Resume written in English, no language listed → languages could include English/Fluent
${arrayInstruction}

OUTPUT:
- Return ONLY a raw valid JSON object
- No markdown, no code fences, no explanation, no preamble
- Every field in both lists must appear in your output — null if not found
- Date format: "YYYY-MM"
- Context: US-based international students (F-1, OPT, STEM OPT, CPT holders)

MANDATORY FIELDS:
${mandatoryFields.length > 0 ? mandatoryFields.join('\n') : '(none)'}

OPTIONAL FIELDS:
${optionalFields.length > 0 ? optionalFields.join('\n') : '(none)'}

Return only the JSON. Begin now.`;
}

async function callGeminiWithRetry(
    prompt: string,
    resumeBase64: string,
    mimeType: string,
    sectionId: string
): Promise<Record<string, unknown>> {
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const result = await model.generateContent([
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: resumeBase64,
                    },
                },
                { text: prompt },
            ]);

            const text = result.response.text();
            const cleaned = text.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            console.log(`✅ Section ${sectionId} extracted successfully (attempt ${attempt})`);
            return parsed;
        } catch (error) {
            console.error(`Section ${sectionId} attempt ${attempt} failed:`, error);
            if (attempt === 3) {
                throw new Error(
                    `Section ${sectionId} failed after 3 attempts: ${error instanceof Error ? error.message : String(error)}`
                );
            }
            // Wait before retrying: 2s after attempt 1, 4s after attempt 2
            await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
        }
    }
    // This should never be reached
    throw new Error(`Section ${sectionId} failed unexpectedly`);
}

function detectGapFields(extractedData: Record<string, unknown>): string[] {
    const gaps: string[] = [];
    const schema = masterFormSchema as { sections: SchemaSection[] };

    for (const section of schema.sections) {
        if (!AI_SECTIONS.includes(section.sectionId)) continue;

        if (section.isArray && section.arrayKey) {
            // For array sections, check each entry
            const entries = extractedData[section.arrayKey] as Record<string, unknown>[] | undefined;
            if (!entries || !Array.isArray(entries) || entries.length === 0) {
                // If it's a mandatory array section (minEntries > 0), mark all mandatory fields
                // For S2 (education), minEntries is 1
                if (section.sectionId === 'S2') {
                    for (const field of section.fields) {
                        if (field.mandatory) {
                            gaps.push(field.id);
                        }
                    }
                }
                continue;
            }
            // Check each entry in the array — for gap form we mark fields that are null in ANY entry
            for (let i = 0; i < entries.length; i++) {
                const entry = entries[i];
                for (const field of section.fields) {
                    if (!field.mandatory) continue;
                    const value = entry[field.key];
                    if (value === null || value === undefined || value === '') {
                        const gapId = `${field.id}[${i}]`;
                        gaps.push(gapId);
                    }
                }
            }
        } else {
            // Flat section — check each mandatory field
            for (const field of section.fields) {
                if (!field.mandatory) continue;
                const value = extractedData[field.key];
                if (value === null || value === undefined || value === '') {
                    gaps.push(field.id);
                }
            }
        }
    }

    return gaps;
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Read resume from DB
        const profile = await Profile.findOne({ userId: user._id });
        if (!profile || !profile.resumeBase64) {
            return NextResponse.json(
                { error: 'No resume found. Please upload a resume first.' },
                { status: 400 }
            );
        }

        // Set processing status
        profile.processingStatus = 'processing';
        profile.failedSection = undefined;
        await profile.save();

        const schema = masterFormSchema as { sections: SchemaSection[] };
        const aiSections = schema.sections.filter((s) => AI_SECTIONS.includes(s.sectionId));

        try {
            // Run 5 Gemini calls in parallel
            const results = await Promise.all(
                aiSections.map((section) => {
                    const prompt = buildPrompt(section);
                    return callGeminiWithRetry(
                        prompt,
                        profile.resumeBase64,
                        profile.resumeMimeType,
                        section.sectionId
                    );
                })
            );

            // Merge all 5 results into one extractedData object
            const extractedData: Record<string, unknown> = {};
            for (let i = 0; i < aiSections.length; i++) {
                const section = aiSections[i];
                const result = results[i];

                if (section.isArray && section.arrayKey) {
                    // Array section — pull out the array
                    let arr = result[section.arrayKey] || [];
                    // Cap projects at 3 entries
                    if (section.sectionId === 'S4' && Array.isArray(arr) && arr.length > 3) {
                        arr = arr.slice(0, 3);
                    }
                    extractedData[section.arrayKey] = arr;
                } else {
                    // Flat section — merge all fields
                    Object.assign(extractedData, result);
                }
            }

            // Run gap detection
            const gapFields = detectGapFields(extractedData);

            console.log(`📋 Extracted data keys: ${Object.keys(extractedData).join(', ')}`);
            console.log(`⚠️ Gap fields (${gapFields.length}): ${gapFields.join(', ')}`);

            // Save to DB
            profile.extractedData = extractedData;
            profile.gapFields = gapFields;
            profile.processingStatus = 'needs_input';
            await profile.save();

            return NextResponse.json({
                message: 'Resume processed successfully',
                processingStatus: 'needs_input',
                gapFieldCount: gapFields.length,
            });
        } catch (error) {
            console.error('Processing failed:', error);
            // Extract failed section from error message
            const errorMsg = error instanceof Error ? error.message : String(error);
            const sectionMatch = errorMsg.match(/Section (S\d)/);
            profile.processingStatus = 'failed';
            profile.failedSection = sectionMatch ? sectionMatch[1] : 'unknown';
            await profile.save();

            return NextResponse.json(
                {
                    error: 'Resume processing failed',
                    failedSection: profile.failedSection,
                    processingStatus: 'failed',
                },
                { status: 500 }
            );
        }
    } catch (error: unknown) {
        console.error('Process resume error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
