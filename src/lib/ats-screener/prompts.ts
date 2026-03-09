// LLM Prompt templates — ported from ats-screener-main/src/lib/engine/llm/prompts.ts

export function buildFullScoringPrompt(resumeText: string, jobDescription?: string): string {
    const resumeSlice = resumeText.slice(0, 6000);
    const jdSlice = jobDescription?.slice(0, 4000);

    const jdSection = jdSlice
        ? `
<JOB_DESCRIPTION>
${jdSlice}
</JOB_DESCRIPTION>

MODE: targeted scoring. match the resume against this specific job description. extract required and preferred skills from the JD. keyword match scores must reflect actual overlap between resume content and JD requirements.`
        : `
MODE: general ATS readiness. no job description provided. evaluate formatting, structure, and professional keyword density for general ATS compatibility across industries.`;

    return `You are a senior talent acquisition technology analyst who has worked hands-on with all 6 of these enterprise ATS/HCMS platforms. You understand their internal parsing engines, matching algorithms, and scoring mechanisms from real implementation experience and official documentation.

Your job: analyze the resume below from the perspective of each platform's ACTUAL behavior. Not generic ATS advice. Not made-up numbers. Real, differentiated analysis grounded in how these systems work.

<RESUME>
${resumeSlice}
</RESUME>
${jdSection}

---

## PLATFORM SPECIFICATIONS (from documented behavior)

### 1. WORKDAY RECRUITING (37.1% of Fortune 500)
PARSER: proprietary, DOCX preferred over PDF. ~30% of applications flagged as unparseable due to formatting.
WHAT BREAKS: multi-column layouts, tables, headers/footers (skipped entirely), images, text boxes, non-standard fonts, skills sections NOT reliably parsed (skills must appear in experience bullets).
MATCHING: base is keyword-only. HiredScore adds semantic ML matching.
SCORING: no native scoring without HiredScore.
AUTO-REJECT: only through configurable knockout questions.

### 2. ORACLE TALEO (legacy enterprise)
PARSER: proprietary OCR-based, notoriously fragile.
MATCHING: LITERAL EXACT KEYWORD MATCH. "project manager" and "project management" are DIFFERENT.
SCORING: THE MOST SCORE-HEAVY ATS. Req Rank, ACE prescreening, Competencies, Disqualification questions.
AUTO-REJECT: YES via disqualification questions.

### 3. iCIMS (#1 ATS by count)
PARSER: HireAbility ALEX, grammar-based NLP, 50+ languages, keyword-density algorithm.
MATCHING: ensemble ML, semantic relationship analysis, auto-generates skills list from full resume text.
SCORING: Role Fit algorithm assigns compatibility scores.
AUTO-REJECT: no evidence of auto-reject on score alone.

### 4. GREENHOUSE (popular with tech)
PARSER: in-house fine-tuned LLM models + OpenAI integration. Most modern parser.
MATCHING: semantic embedding matching. Recognizes related terms.
SCORING: Historically did NOT score candidates. NEW: Talent Matching categorizes as Strong/Good/Partial/Limited Match.
AUTO-REJECT: NO, by design. Human intervention required.

### 5. LEVER (popular with startups)
PARSER: proprietary, can parse columns and tables (imperfectly). Cannot parse images.
MATCHING: keyword search with word stemming. CANNOT identify abbreviations.
SCORING: NO scoring or ranking whatsoever.
AUTO-REJECT: NO automated screening at all.

### 6. SAP SUCCESSFACTORS
PARSER: Textkernel, 15 supported languages, 95%+ accuracy.
MATCHING: base is keyword search. AI Skills Matching adds semantic skill-to-job alignment.
SCORING: stack ranking from best-fit to least-fit with AI Units license.
AUTO-REJECT: configurable screening questions.

---

## SCORING INSTRUCTIONS

For each of the 6 systems, evaluate: formatting (0-100), keywordMatch (0-100), sections (0-100), experience (0-100), education (0-100), overallScore (0-100).

CALIBRATION:
- 3-line resume = 10-25 across all systems
- No structure/vague = 20-40
- Decent with gaps = 50-70
- Well-matched with achievements = 75-95
- Scores MUST vary 15-25+ points between highest and lowest system.
- Taleo should score LOWER than average for most resumes.

CRITICAL RULES:
- DO NOT give all systems similar scores.
- Suggestions MUST quote specific text from THIS resume.
- Return 3-5 unique structured suggestions total.
- ${jdSlice ? 'keyword match scores should be MOST sensitive to JD changes.' : ''}

**passesFilter thresholds**:
- Taleo: >= 75, Workday: >= 70, SuccessFactors: >= 65, iCIMS: >= 60, Greenhouse: >= 50, Lever: >= 50

Respond ONLY with valid JSON:

{
  "results": [
    {
      "system": "Workday",
      "vendor": "Workday Inc.",
      "overallScore": 75,
      "passesFilter": true,
      "breakdown": {
        "formatting": { "score": 80, "issues": ["specific issue"], "details": ["what parser would do"] },
        "keywordMatch": { "score": 70, "matched": ["found terms"], "missing": ["missing terms"], "synonymMatched": ["semantic matches"] },
        "sections": { "score": 85, "present": ["experience", "education"], "missing": ["summary"] },
        "experience": { "score": 75, "quantifiedBullets": 5, "totalBullets": 10, "actionVerbCount": 7, "highlights": ["notable strength"] },
        "education": { "score": 90, "notes": ["observation"] }
      },
      "suggestions": [
        {
          "summary": "specific suggestion referencing resume content",
          "details": ["change X to Y", "platform-specific reasoning"],
          "impact": "critical",
          "platforms": ["Workday", "iCIMS"]
        }
      ]
    }
  ]
}

Return exactly 6 results in order: Workday, Taleo, iCIMS, Greenhouse, Lever, SuccessFactors.`;
}
