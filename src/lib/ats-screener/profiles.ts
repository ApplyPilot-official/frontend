// ATS Scorer Profiles — ported from ats-screener-main
import type { ATSProfile } from './types';

export const WORKDAY_PROFILE: ATSProfile = {
    name: 'Workday',
    vendor: 'Workday, Inc.',
    marketShare: '~40% of Fortune 500',
    description: 'strict parser, exact keyword matching, demands clean formatting',
    parsingStrictness: 0.9,
    keywordStrategy: 'exact',
    weights: { formatting: 0.25, keywordMatch: 0.3, sectionCompleteness: 0.15, experienceRelevance: 0.15, educationMatch: 0.1, quantification: 0.05 },
    requiredSections: ['contact', 'experience', 'education', 'skills'],
    preferredDateFormats: ['MM/YYYY', 'Month YYYY'],
    quirks: [
        {
            id: 'workday-header-format', description: 'Workday expects standard section header names', check: (input) => {
                const nonStandard = input.resumeSections.filter((s) => s === 'unknown');
                if (nonStandard.length > 2) return { penalty: 5, message: 'multiple unrecognized section headers. Workday expects standard names like "Experience", "Education", "Skills".' };
                return null;
            }
        },
        {
            id: 'workday-page-limit', description: 'Workday may truncate resumes beyond 2 pages', check: (input) => {
                if (input.pageCount > 2) return { penalty: 8, message: `resume is ${input.pageCount} pages. Workday may truncate content beyond page 2.` };
                return null;
            }
        }
    ],
    passingScore: 70
};

export const TALEO_PROFILE: ATSProfile = {
    name: 'Taleo',
    vendor: 'Oracle Corporation',
    marketShare: '~25% of Fortune 500',
    description: 'boolean keyword filtering, knockout questions, rigid parsing',
    parsingStrictness: 0.85,
    keywordStrategy: 'exact',
    weights: { formatting: 0.2, keywordMatch: 0.35, sectionCompleteness: 0.15, experienceRelevance: 0.15, educationMatch: 0.1, quantification: 0.05 },
    requiredSections: ['contact', 'experience', 'education', 'skills'],
    preferredDateFormats: ['MM/YYYY', 'Month YYYY'],
    quirks: [
        {
            id: 'taleo-keyword-density', description: 'Taleo uses boolean keyword matching', check: (input) => {
                if (input.jobDescription && input.resumeSkills.length < 5) return { penalty: 10, message: 'very few skills detected. Taleo relies heavily on keyword matching. ensure your resume lists relevant skills explicitly.' };
                return null;
            }
        },
        {
            id: 'taleo-section-headers', description: 'Taleo expects standard section headers', check: (input) => {
                const standardHeaders = ['contact', 'experience', 'education', 'skills'];
                const missingStandard = standardHeaders.filter((h) => !input.resumeSections.includes(h));
                if (missingStandard.length > 1) return { penalty: 8, message: `missing standard sections: ${missingStandard.join(', ')}. Taleo requires clearly labeled sections.` };
                return null;
            }
        }
    ],
    passingScore: 65
};

export const ICIMS_PROFILE: ATSProfile = {
    name: 'iCIMS',
    vendor: 'iCIMS, Inc.',
    marketShare: '~15% of Fortune 500',
    description: 'AI-assisted matching, fuzzy keywords, more format-tolerant',
    parsingStrictness: 0.6,
    keywordStrategy: 'fuzzy',
    weights: { formatting: 0.15, keywordMatch: 0.3, sectionCompleteness: 0.15, experienceRelevance: 0.2, educationMatch: 0.1, quantification: 0.1 },
    requiredSections: ['contact', 'experience', 'education'],
    preferredDateFormats: ['Month YYYY', 'MM/YYYY', 'YYYY'],
    quirks: [
        {
            id: 'icims-skills-taxonomy', description: 'iCIMS uses a skills taxonomy for broader matching', check: (input) => {
                if (input.resumeSkills.length >= 10) return { penalty: -5, message: 'comprehensive skills list detected. iCIMS skill taxonomy matching benefits from detailed skill listings.' };
                return null;
            }
        }
    ],
    passingScore: 60
};

export const GREENHOUSE_PROFILE: ATSProfile = {
    name: 'Greenhouse',
    vendor: 'Greenhouse Software',
    marketShare: 'top tech companies and startups',
    description: 'structured scorecards, semantic matching, lenient formatting',
    parsingStrictness: 0.4,
    keywordStrategy: 'semantic',
    weights: { formatting: 0.1, keywordMatch: 0.25, sectionCompleteness: 0.1, experienceRelevance: 0.25, educationMatch: 0.1, quantification: 0.2 },
    requiredSections: ['experience', 'education'],
    preferredDateFormats: ['Month YYYY', 'MM/YYYY', 'YYYY'],
    quirks: [
        {
            id: 'greenhouse-quantification', description: 'Greenhouse structured scorecards reward measurable impact', check: (input) => {
                const quantifiedRatio = input.experienceBullets.filter((b) => /\d+%|\$[\d,]+|\d+\s*(?:x|times)/i.test(b)).length / Math.max(1, input.experienceBullets.length);
                if (quantifiedRatio >= 0.4) return { penalty: -8, message: 'strong quantification in experience bullets. Greenhouse scorecards reward measurable impact.' };
                return null;
            }
        },
        {
            id: 'greenhouse-projects', description: 'Greenhouse values project work', check: (input) => {
                if (input.resumeSections.includes('projects')) return { penalty: -3, message: 'projects section detected. Greenhouse hiring managers value seeing project work.' };
                return null;
            }
        }
    ],
    passingScore: 55
};

export const LEVER_PROFILE: ATSProfile = {
    name: 'Lever',
    vendor: 'Lever (Employ Inc.)',
    marketShare: 'popular with startups and mid-market tech',
    description: 'contextual matching, lenient parsing, values narrative quality',
    parsingStrictness: 0.35,
    keywordStrategy: 'semantic',
    weights: { formatting: 0.08, keywordMatch: 0.22, sectionCompleteness: 0.1, experienceRelevance: 0.3, educationMatch: 0.1, quantification: 0.2 },
    requiredSections: ['experience'],
    preferredDateFormats: ['Month YYYY', 'YYYY'],
    quirks: [
        {
            id: 'lever-narrative', description: 'Lever values well-written experience', check: (input) => {
                const avgBulletLength = input.experienceBullets.length > 0 ? input.experienceBullets.reduce((sum, b) => sum + b.length, 0) / input.experienceBullets.length : 0;
                if (avgBulletLength >= 60 && avgBulletLength <= 150) return { penalty: -5, message: 'well-detailed experience descriptions. Lever contextual matching works best with descriptive bullets.' };
                return null;
            }
        },
        {
            id: 'lever-summary', description: 'Lever benefits from a professional summary', check: (input) => {
                if (input.resumeSections.includes('summary')) return { penalty: -3, message: 'professional summary detected. Lever CRM uses this for candidate context.' };
                return null;
            }
        }
    ],
    passingScore: 50
};

export const SUCCESSFACTORS_PROFILE: ATSProfile = {
    name: 'SuccessFactors',
    vendor: 'SAP SE',
    marketShare: '~15% of large enterprise',
    description: 'enterprise structured parsing, rigid field mapping, exact matching',
    parsingStrictness: 0.85,
    keywordStrategy: 'exact',
    weights: { formatting: 0.25, keywordMatch: 0.25, sectionCompleteness: 0.2, experienceRelevance: 0.15, educationMatch: 0.1, quantification: 0.05 },
    requiredSections: ['contact', 'experience', 'education', 'skills'],
    preferredDateFormats: ['MM/YYYY', 'DD/MM/YYYY'],
    quirks: [
        {
            id: 'sf-structured-data', description: 'SuccessFactors maps resume fields to structured SAP data', check: (input) => {
                const hasDates = /\b(19|20)\d{2}\b/.test(input.resumeText);
                if (!hasDates) return { penalty: 10, message: 'no dates detected. SuccessFactors requires structured date fields for each position.' };
                if (input.experienceBullets.length === 0) return { penalty: 8, message: 'no clear experience entries detected. SuccessFactors needs structured employer/title/date fields.' };
                return null;
            }
        },
        {
            id: 'sf-section-structure', description: 'SuccessFactors requires all standard sections', check: (input) => {
                const required = ['contact', 'experience', 'education', 'skills'];
                const missing = required.filter((r) => !input.resumeSections.includes(r));
                if (missing.length > 0) return { penalty: missing.length * 5, message: `missing sections: ${missing.join(', ')}. SuccessFactors requires structured sections for field mapping.` };
                return null;
            }
        }
    ],
    passingScore: 65
};

export const ALL_PROFILES: ATSProfile[] = [
    WORKDAY_PROFILE, TALEO_PROFILE, SUCCESSFACTORS_PROFILE,
    ICIMS_PROFILE, GREENHOUSE_PROFILE, LEVER_PROFILE
];

export function getProfile(name: string): ATSProfile | undefined {
    return ALL_PROFILES.find((p) => p.name.toLowerCase() === name.toLowerCase());
}
