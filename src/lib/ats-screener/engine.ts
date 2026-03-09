// Scoring engine — ported from ats-screener-main
// Deterministic rule-based scoring: same input = same output
import type { ATSProfile, ScoringInput, ScoreResult, ScoreBreakdown } from './types';
import { ALL_PROFILES } from './profiles';
import { tokenize } from './nlp/tokenizer';
import { getCanonical, areSynonyms } from './nlp/synonyms';

// ─── Main entry: score against all 6 ATS profiles ───
export function scoreResume(input: ScoringInput): ScoreResult[] {
    return ALL_PROFILES.map((profile) => scoreAgainstProfile(input, profile));
}

function scoreAgainstProfile(input: ScoringInput, profile: ATSProfile): ScoreResult {
    const breakdown = computeBreakdown(input, profile);
    const weightedScore = computeWeightedScore(breakdown, profile);
    const quirkAdjustment = computeQuirkAdjustment(input, profile);
    const overallScore = Math.max(0, Math.min(100, Math.round(weightedScore + quirkAdjustment.totalAdjustment)));
    const suggestions = generateSuggestions(breakdown, profile, quirkAdjustment.messages);
    return { system: profile.name, vendor: profile.vendor, overallScore, passesFilter: overallScore >= profile.passingScore, breakdown, suggestions };
}

// ─── Breakdown computation ───
function computeBreakdown(input: ScoringInput, profile: ATSProfile): ScoreBreakdown {
    const formatting = scoreFormatting(input, profile.parsingStrictness);
    const sections = scoreSections(input.resumeSections, profile.requiredSections);
    const experience = scoreExperience(input.experienceBullets);
    const education = scoreEducation(input.educationText);
    const keywords = matchKeywords(input.resumeText, input.jobDescription || '', profile.keywordStrategy);
    return {
        formatting: { score: formatting.score, issues: formatting.issues, details: formatting.details },
        keywordMatch: { score: keywords.score, matched: keywords.matched, missing: keywords.missing, synonymMatched: keywords.synonymMatched },
        sections: { score: sections.score, present: sections.present, missing: sections.missing },
        experience: { score: experience.score, quantifiedBullets: experience.quantifiedBullets, totalBullets: experience.totalBullets, actionVerbCount: experience.actionVerbCount, highlights: experience.highlights },
        education: { score: education.score, notes: education.notes }
    };
}

function computeWeightedScore(breakdown: ScoreBreakdown, profile: ATSProfile): number {
    const { weights } = profile;
    const quantificationScore = breakdown.experience.totalBullets > 0
        ? Math.round((breakdown.experience.quantifiedBullets / breakdown.experience.totalBullets) * 100) : 0;
    return (
        breakdown.formatting.score * weights.formatting +
        breakdown.keywordMatch.score * weights.keywordMatch +
        breakdown.sections.score * weights.sectionCompleteness +
        breakdown.experience.score * weights.experienceRelevance +
        breakdown.education.score * weights.educationMatch +
        quantificationScore * weights.quantification
    );
}

function computeQuirkAdjustment(input: ScoringInput, profile: ATSProfile) {
    let totalAdjustment = 0;
    const messages: string[] = [];
    for (const quirk of profile.quirks) {
        const result = quirk.check(input);
        if (result) { totalAdjustment -= result.penalty; messages.push(result.message); }
    }
    return { totalAdjustment, messages };
}

// ─── Format scoring ───
function scoreFormatting(input: ScoringInput, strictness: number) {
    const issues: string[] = [];
    const details: string[] = [];
    let deductions = 0;
    if (input.hasMultipleColumns) { const p = 15 * strictness; deductions += p; issues.push('multi-column layout detected'); details.push(`multi-column layouts confuse most ATS parsers. (-${Math.round(p)})`); }
    if (input.hasTables) { const p = 12 * strictness; deductions += p; issues.push('tables detected in resume'); details.push(`tables are poorly supported by many ATS systems. (-${Math.round(p)})`); }
    if (input.hasImages) { const p = 8 * strictness; deductions += p; issues.push('images or graphics detected'); details.push(`ATS systems cannot read text embedded in images. (-${Math.round(p)})`); }
    if (input.pageCount > 2) { const p = 5 * strictness; deductions += p; issues.push(`resume is ${input.pageCount} pages`); details.push(`most ATS prefer 1-2 pages. (-${Math.round(p)})`); }
    if (input.wordCount < 150) { const p = 10 * strictness; deductions += p; issues.push('resume appears very short'); details.push(`only ${input.wordCount} words detected. (-${Math.round(p)})`); }
    else if (input.wordCount > 1500) { const p = 3 * strictness; deductions += p; issues.push('resume is quite long'); details.push(`${input.wordCount} words is above average. (-${Math.round(p)})`); }
    const text = input.resumeText;
    const specialCharRatio = (text.match(/[^\w\s.,;:!?@#$%&*()\-+=/\\'"]/g) || []).length / text.length;
    if (specialCharRatio > 0.05) { const p = 8 * strictness; deductions += p; issues.push('unusual characters detected'); details.push(`high density of special characters. (-${Math.round(p)})`); }
    const lines = text.split('\n');
    const allCapsLines = lines.filter((l) => l.trim().length > 30 && l === l.toUpperCase() && /[A-Z]/.test(l));
    if (allCapsLines.length > 3) { const p = 3 * strictness; deductions += p; issues.push('excessive use of all-caps text'); }
    const bulletLines = lines.filter((l) => /^\s*[-•*·▪►➤○●]\s/.test(l));
    const bulletTypes = new Set(bulletLines.map((l) => l.match(/^\s*([-•*·▪►➤○●])/)?.[1]));
    if (bulletTypes.size > 2) { const p = 2 * strictness; deductions += p; issues.push('inconsistent bullet point styles'); }
    if (!input.hasMultipleColumns && !input.hasTables && !input.hasImages) details.push('clean single-column layout detected (good)');
    if (input.pageCount <= 2) details.push('appropriate page length (good)');
    if (input.wordCount >= 300 && input.wordCount <= 800) details.push('word count is in the ideal range (good)');
    return { score: Math.max(0, Math.min(100, 100 - deductions)), issues, details };
}

// ─── Section scoring ───
function scoreSections(presentSections: string[], requiredSections: string[]) {
    const presentSet = new Set(presentSections.map((s) => s.toLowerCase()));
    const present: string[] = [];
    const missing: string[] = [];
    for (const required of requiredSections) {
        if (presentSet.has(required.toLowerCase())) present.push(required);
        else missing.push(required);
    }
    const score = requiredSections.length > 0 ? Math.round((present.length / requiredSections.length) * 100) : 100;
    return { score, present, missing };
}

// ─── Experience scoring ───
const STRONG_ACTION_VERBS = new Set([
    'achieved', 'accelerated', 'administered', 'advanced', 'analyzed', 'architected', 'automated', 'built',
    'centralized', 'championed', 'collaborated', 'conceptualized', 'consolidated', 'contributed', 'converted',
    'coordinated', 'created', 'decreased', 'delivered', 'designed', 'developed', 'directed', 'drove', 'eliminated',
    'enabled', 'engineered', 'established', 'exceeded', 'executed', 'expanded', 'facilitated', 'founded',
    'generated', 'grew', 'headed', 'identified', 'implemented', 'improved', 'increased', 'influenced',
    'initiated', 'innovated', 'integrated', 'introduced', 'launched', 'led', 'leveraged', 'managed', 'maximized',
    'mentored', 'migrated', 'modernized', 'negotiated', 'operated', 'optimized', 'orchestrated', 'organized',
    'outperformed', 'overhauled', 'oversaw', 'pioneered', 'planned', 'presented', 'prioritized', 'produced',
    'programmed', 'proposed', 'published', 'raised', 'recommended', 'redesigned', 'reduced', 'refactored',
    'reformed', 're-engineered', 'reorganized', 'replaced', 'researched', 'resolved', 'restructured', 'revamped',
    'revolutionized', 'scaled', 'secured', 'simplified', 'spearheaded', 'standardized', 'streamlined',
    'strengthened', 'supervised', 'surpassed', 'synchronized', 'trained', 'transformed', 'translated', 'unified', 'upgraded'
]);

const QUANTIFICATION_PATTERNS = [
    /\d+%/, /\$[\d,]+/, /\d+\s*(?:x|times)/i, /\d+\+?\s*(?:users?|customers?|clients?|employees?|members?|team)/i,
    /\d+\+?\s*(?:projects?|products?|applications?|systems?|services?)/i, /(?:top|first|#)\s*\d+/i,
    /\d+\s*(?:hours?|days?|weeks?|months?|years?)/i, /\d{1,3}(?:,\d{3})+/, /\d+\s*(?:million|billion|thousand|k|m|b)\b/i
];

function scoreExperience(bullets: string[]) {
    if (bullets.length === 0) return { score: 0, quantifiedBullets: 0, totalBullets: 0, actionVerbCount: 0, highlights: ['no experience bullets found'] };
    const highlights: string[] = [];
    let quantifiedBullets = 0, actionVerbCount = 0;
    for (const bullet of bullets) {
        if (QUANTIFICATION_PATTERNS.some((p) => p.test(bullet))) quantifiedBullets++;
        const firstWord = bullet.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
        if (firstWord && STRONG_ACTION_VERBS.has(firstWord)) actionVerbCount++;
    }
    const totalBullets = bullets.length;
    const quantificationRatio = quantifiedBullets / totalBullets;
    const actionVerbRatio = actionVerbCount / totalBullets;
    const quantScore = Math.min(1, quantificationRatio / 0.4) * 40;
    const actionScore = Math.min(1, actionVerbRatio / 0.7) * 30;
    const bulletCountScore = totalBullets >= 8 ? 30 : totalBullets >= 5 ? 25 : totalBullets >= 3 ? 20 : 10;
    if (quantificationRatio >= 0.4) highlights.push(`${Math.round(quantificationRatio * 100)}% of bullets are quantified (excellent)`);
    else if (quantificationRatio >= 0.2) highlights.push(`${Math.round(quantificationRatio * 100)}% of bullets are quantified (good, aim for 40%+)`);
    else highlights.push(`only ${Math.round(quantificationRatio * 100)}% of bullets are quantified`);
    if (actionVerbRatio >= 0.7) highlights.push('strong use of action verbs');
    else highlights.push(`${Math.round(actionVerbRatio * 100)}% bullets start with action verbs (aim for 70%+)`);
    if (totalBullets < 5) highlights.push(`only ${totalBullets} experience bullets. consider adding more detail.`);
    const score = Math.round(Math.min(100, quantScore + actionScore + bulletCountScore));
    return { score, quantifiedBullets, totalBullets, actionVerbCount, highlights };
}

// ─── Education scoring ───
const DEGREE_LEVELS: Record<string, number> = {
    'phd': 5, 'ph.d': 5, 'doctor': 5, 'doctorate': 5, 'master': 4, "master's": 4, 'mba': 4, 'ms': 4, 'm.s': 4,
    'ma': 4, 'm.a': 4, 'm.b.a': 4, 'bachelor': 3, "bachelor's": 3, 'bs': 3, 'b.s': 3, 'ba': 3, 'b.a': 3,
    'b.eng': 3, 'associate': 2, "associate's": 2, 'as': 2, 'a.s': 2, 'aa': 2, 'a.a': 2, 'diploma': 1, 'certificate': 1, 'certification': 1
};

function scoreEducation(educationText: string) {
    if (!educationText || educationText.trim().length === 0) return { score: 20, notes: ['no education section found.'] };
    const notes: string[] = [];
    let score = 0;
    const lowerText = educationText.toLowerCase();
    let highestDegree = 0, degreeFound = '';
    for (const [degree, level] of Object.entries(DEGREE_LEVELS)) {
        if (lowerText.includes(degree) && level > highestDegree) { highestDegree = level; degreeFound = degree; }
    }
    if (highestDegree > 0) { score += 30; notes.push(`degree detected: ${degreeFound}`); }
    else notes.push('no clear degree type found.');
    if (/[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+/.test(educationText)) score += 20;
    else notes.push('institution name may not be clearly parseable');
    if (/\b(19|20)\d{2}\b/.test(educationText)) score += 15;
    else notes.push('no graduation date found.');
    const hasField = /\b(?:in|of)\s+[A-Z]/.test(educationText) || /(?:computer science|engineering|business|mathematics|biology|chemistry|physics|psychology|economics|finance|accounting|marketing|nursing|law|education|design)/i.test(educationText);
    if (hasField) { score += 15; notes.push('field of study detected'); }
    else notes.push('consider explicitly stating your field of study');
    const hasGPA = /\bgpa\b/i.test(educationText) || /\b[34]\.\d{1,2}\s*\/?\s*4/i.test(educationText);
    if (hasGPA) { score += 10; notes.push('GPA listed'); }
    const hasHonors = /\b(cum laude|magna cum laude|summa cum laude|dean'?s?\s*list|honors?|distinction)\b/i.test(educationText);
    if (hasHonors) { score += 10; notes.push('academic honors detected'); }
    return { score: Math.min(100, score), notes };
}

// ─── Keyword matching ───
function matchKeywords(resumeText: string, jobDescription: string, strategy: 'exact' | 'fuzzy' | 'semantic') {
    if (!jobDescription || jobDescription.trim().length === 0) return { score: 100, matched: [] as string[], missing: [] as string[], synonymMatched: [] as string[] };
    const resumeTokens = tokenize(resumeText);
    const jdTokens = tokenize(jobDescription);
    const resumeTerms = new Set(resumeTokens.map((t) => t.normalized));
    const jdTerms = Array.from(new Set(jdTokens.map((t) => t.normalized)));
    const resumeTermsArr = Array.from(resumeTerms);
    const resumeCanonicals = new Set(resumeTokens.map((t) => getCanonical(t.normalized)));
    const matched: string[] = [], missing: string[] = [], synonymMatched: string[] = [];
    for (const jdTerm of jdTerms) {
        if (resumeTerms.has(jdTerm)) { matched.push(jdTerm); continue; }
        if (strategy === 'exact') { missing.push(jdTerm); continue; }
        const jdCanonical = getCanonical(jdTerm);
        if (resumeCanonicals.has(jdCanonical)) { synonymMatched.push(jdTerm); continue; }
        let foundSynonym = false;
        for (const resumeTerm of resumeTermsArr) { if (areSynonyms(resumeTerm, jdTerm)) { synonymMatched.push(jdTerm); foundSynonym = true; break; } }
        if (foundSynonym) continue;
        if (strategy === 'fuzzy') { missing.push(jdTerm); continue; }
        let foundPartial = false;
        for (const resumeTerm of resumeTermsArr) {
            if ((resumeTerm.includes(jdTerm) || jdTerm.includes(resumeTerm)) && Math.min(resumeTerm.length, jdTerm.length) >= 3) { synonymMatched.push(jdTerm); foundPartial = true; break; }
        }
        if (foundPartial) continue;
        if (jdTerm.length >= 4 && resumeText.toLowerCase().includes(jdTerm)) { matched.push(jdTerm); continue; }
        missing.push(jdTerm);
    }
    const totalJdTerms = jdTerms.length;
    if (totalJdTerms === 0) return { score: 100, matched, missing, synonymMatched };
    const effectiveMatches = matched.length + synonymMatched.length * 0.8;
    const score = Math.round(Math.min(100, (effectiveMatches / totalJdTerms) * 100));
    return { score, matched, missing, synonymMatched };
}

// ─── Suggestion generation ───
function generateSuggestions(breakdown: ScoreBreakdown, profile: ATSProfile, quirkMessages: string[]): string[] {
    const suggestions: string[] = [];
    if (breakdown.formatting.score < 70) {
        if (breakdown.formatting.issues.some((i) => i.includes('multi-column'))) suggestions.push('switch to a single-column resume layout for better ATS parsing');
        if (breakdown.formatting.issues.some((i) => i.includes('tables'))) suggestions.push('remove tables and use plain text formatting instead');
        if (breakdown.formatting.issues.some((i) => i.includes('images'))) suggestions.push('remove images, logos, and graphics from your resume');
    }
    if (breakdown.keywordMatch.score < 60 && breakdown.keywordMatch.missing.length > 0) {
        const topMissing = breakdown.keywordMatch.missing.slice(0, 5);
        suggestions.push(`add these missing keywords from the job description: ${topMissing.join(', ')}`);
        if (profile.keywordStrategy === 'exact') suggestions.push(`${profile.name} uses exact keyword matching. use the exact terms from the job posting, not synonyms.`);
    }
    if (breakdown.sections.missing.length > 0) suggestions.push(`add missing sections: ${breakdown.sections.missing.join(', ')}. ${profile.name} requires these for proper parsing.`);
    if (breakdown.experience.totalBullets > 0) {
        const quantRatio = breakdown.experience.quantifiedBullets / breakdown.experience.totalBullets;
        if (quantRatio < 0.3) suggestions.push('add more quantified achievements (numbers, percentages, dollar amounts) to your experience bullets');
        if (breakdown.experience.actionVerbCount / breakdown.experience.totalBullets < 0.5) suggestions.push('start more bullet points with strong action verbs (led, developed, increased, delivered)');
    } else suggestions.push('add detailed experience bullets with measurable achievements');
    if (breakdown.education.score < 50) suggestions.push('ensure your education section includes degree type, institution, and graduation date');
    for (const message of quirkMessages) suggestions.push(message);
    return suggestions;
}
