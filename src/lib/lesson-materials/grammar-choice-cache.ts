import { createHash } from "node:crypto";
import type { GrammarChoiceCandidate } from "@/lib/lesson-materials/workbook-types";
import { computePassageSourceHash } from "@/lib/lesson-materials/workbook-blank-cache";
import {
  GRAMMAR_ANALYSIS_VERSION_NONE,
  GRAMMAR_CHOICE_PROMPT_VERSION,
} from "@/lib/lesson-materials/grammar-choice-constants";

export type StoredGrammarChoiceCacheRow = {
  passageId: string;
  sourceHash: string;
  grammarAnalysisVersion: string;
  grammarChoicePromptVersion: string;
  candidates: GrammarChoiceCandidate[];
  createdAt: string;
};

export type StoredGrammarChoiceCache = {
  algorithmVersion: string;
  byPassageId: Record<string, StoredGrammarChoiceCacheRow>;
};

export function computeGrammarAnalysisVersion(
  points: Array<{
    sentenceId: string;
    title: string;
    example?: string;
    bookTerm?: string;
  }>
): string {
  if (!points.length) return GRAMMAR_ANALYSIS_VERSION_NONE;
  const payload = points
    .map(
      (p) =>
        `${p.sentenceId}|${p.title}|${p.example ?? ""}|${p.bookTerm ?? ""}`
    )
    .sort()
    .join("\n");
  return createHash("sha256").update(payload).digest("hex").slice(0, 16);
}

export function getCachedGrammarChoiceCandidates(
  cache: StoredGrammarChoiceCache | null | undefined,
  passageId: string,
  sourceHash: string,
  grammarAnalysisVersion: string
): GrammarChoiceCandidate[] | null {
  if (!cache || cache.algorithmVersion !== GRAMMAR_CHOICE_PROMPT_VERSION) {
    return null;
  }
  const row = cache.byPassageId?.[passageId];
  if (!row) return null;
  if (row.sourceHash !== sourceHash) return null;
  if (row.grammarAnalysisVersion !== grammarAnalysisVersion) return null;
  if (row.grammarChoicePromptVersion !== GRAMMAR_CHOICE_PROMPT_VERSION) {
    return null;
  }
  if (!Array.isArray(row.candidates) || row.candidates.length === 0) {
    return null;
  }
  return row.candidates;
}

export function upsertGrammarChoiceCache(
  cache: StoredGrammarChoiceCache | null | undefined,
  row: StoredGrammarChoiceCacheRow
): StoredGrammarChoiceCache {
  const base: StoredGrammarChoiceCache = {
    algorithmVersion: GRAMMAR_CHOICE_PROMPT_VERSION,
    byPassageId: { ...(cache?.byPassageId ?? {}) },
  };
  base.byPassageId[row.passageId] = row;
  return base;
}

export function hashEnglishLines(englishLines: string[]): string {
  return computePassageSourceHash(englishLines);
}
