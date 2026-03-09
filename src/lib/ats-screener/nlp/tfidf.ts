// TF-IDF implementation — ported from ats-screener-main
import { tokenize } from './tokenizer';

interface TermFrequency {
    term: string;
    tf: number;
    count: number;
}

export function computeTF(text: string): TermFrequency[] {
    const tokens = tokenize(text);
    const counts = new Map<string, number>();
    for (const token of tokens) {
        counts.set(token.normalized, (counts.get(token.normalized) || 0) + 1);
    }
    const total = tokens.length;
    const frequencies: TermFrequency[] = [];
    counts.forEach((count, term) => {
        frequencies.push({ term, tf: count / total, count });
    });
    return frequencies.sort((a, b) => b.tf - a.tf);
}

export function computeIDF(documents: string[]): Map<string, number> {
    const docCount = documents.length;
    const termDocCounts = new Map<string, number>();
    for (const doc of documents) {
        const tokens = tokenize(doc);
        const uniqueTerms = new Set(tokens.map((t) => t.normalized));
        for (const term of uniqueTerms) {
            termDocCounts.set(term, (termDocCounts.get(term) || 0) + 1);
        }
    }
    const idf = new Map<string, number>();
    termDocCounts.forEach((df, term) => {
        idf.set(term, Math.log(docCount / (1 + df)));
    });
    return idf;
}

export function computeKeywordOverlap(
    sourceText: string,
    targetText: string
): { matched: string[]; missing: string[]; score: number } {
    const sourceTokens = tokenize(sourceText);
    const targetTokens = tokenize(targetText);
    const sourceTerms = new Set(sourceTokens.map((t) => t.normalized));
    const targetTerms = new Set(targetTokens.map((t) => t.normalized));
    const matched: string[] = [];
    const missing: string[] = [];
    for (const term of targetTerms) {
        if (sourceTerms.has(term)) {
            matched.push(term);
        } else {
            missing.push(term);
        }
    }
    const score = targetTerms.size > 0 ? matched.length / targetTerms.size : 0;
    return { matched, missing, score };
}

export function extractKeyTerms(text: string, topN: number = 20): string[] {
    const tf = computeTF(text);
    return tf.slice(0, topN).map((t) => t.term);
}
