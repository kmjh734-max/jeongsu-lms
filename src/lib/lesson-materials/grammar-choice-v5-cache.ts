import { createHash } from "node:crypto";
import type { GrammarChoiceCandidate } from "@/lib/lesson-materials/workbook-types";
import { computePassageSourceHash } from "@/lib/lesson-materials/workbook-blank-cache";
import {
  GRAMMAR_CHOICE_GENERATOR_VERSION,
  GRAMMAR_CHOICE_REVIEWER_VERSION,
  GRAMMAR_CHOICE_PROMPT_VERSION,
} from "@/lib/lesson-materials/grammar-choice-constants";
import type { WorkbookGrammarChoiceDiagnostics } from "@/lib/lesson-materials/workbook-types";

export type StoredGrammarChoiceV5Row = {
  passageId: string;
  sourceHash: string;
  analysisHintHash: string;
  generatorModel: string;
  reviewerModel: string;
  generatorReasoningEffort: string;
  reviewerReasoningEffort: string;
  generatorVersion: string;
  reviewerVersion: string;
  candidates: GrammarChoiceCandidate[];
  diagnostics?: Partial<WorkbookGrammarChoiceDiagnostics>;
  createdAt: string;
};

export type StoredGrammarChoiceV5Cache = {
  algorithmVersion: string;
  byPassageId: Record<string, StoredGrammarChoiceV5Row>;
};

export function getCachedGrammarChoiceV5(
  cache: StoredGrammarChoiceV5Cache | null | undefined,
  key: {
    passageId: string;
    sourceHash: string;
    analysisHintHash: string;
    generatorModel: string;
    reviewerModel: string;
    generatorReasoningEffort: string;
    reviewerReasoningEffort: string;
  }
): StoredGrammarChoiceV5Row | null {
  if (!cache || cache.algorithmVersion !== GRAMMAR_CHOICE_PROMPT_VERSION) {
    return null;
  }
  const row = cache.byPassageId?.[key.passageId];
  if (!row) return null;
  if (row.sourceHash !== key.sourceHash) return null;
  if (row.analysisHintHash !== key.analysisHintHash) return null;
  if (row.generatorModel !== key.generatorModel) return null;
  if (row.reviewerModel !== key.reviewerModel) return null;
  if (row.generatorReasoningEffort !== key.generatorReasoningEffort) return null;
  if (row.reviewerReasoningEffort !== key.reviewerReasoningEffort) return null;
  if (row.generatorVersion !== GRAMMAR_CHOICE_GENERATOR_VERSION) return null;
  if (row.reviewerVersion !== GRAMMAR_CHOICE_REVIEWER_VERSION) return null;
  if (!Array.isArray(row.candidates) || row.candidates.length === 0) return null;
  return row;
}

export function upsertGrammarChoiceV5Cache(
  cache: StoredGrammarChoiceV5Cache | null | undefined,
  row: StoredGrammarChoiceV5Row
): StoredGrammarChoiceV5Cache {
  return {
    algorithmVersion: GRAMMAR_CHOICE_PROMPT_VERSION,
    byPassageId: {
      ...(cache?.byPassageId ?? {}),
      [row.passageId]: row,
    },
  };
}

export function hashEnglishLines(englishLines: string[]): string {
  return computePassageSourceHash(englishLines);
}

export function hashCacheKeyParts(parts: string[]): string {
  return createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 16);
}
