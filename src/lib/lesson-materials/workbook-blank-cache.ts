import { createHash } from "node:crypto";
import { formatWorkbookPassage } from "@/lib/lesson-materials/workbook-types";
import type { BlankPartOfSpeech } from "@/lib/lesson-materials/workbook-types";
import type {
  BlankCandidateScore,
  BlankSemanticRole,
} from "@/lib/lesson-materials/blank-concept-score";

/** Bump when blank selection prompt / scoring / algorithm changes. */
export const BLANK_POOL_ALGORITHM_VERSION = "blank-selection-v3";
/** Alias matching product naming */
export const BLANK_SELECTION_ALGORITHM_VERSION = BLANK_POOL_ALGORITHM_VERSION;

export type StoredBlankCandidate = {
  sentenceId: string;
  answerText: string;
  occurrenceIndex: number;
  lemma: string;
  partOfSpeech: BlankPartOfSpeech;
  meaningKo: string;
  priority: number;
  conceptScore: number;
  selectionReasonKo: string;
  wordFamily?: string;
  semanticRole?: BlankSemanticRole | null;
  competitionGroup?: string | null;
  scores?: BlankCandidateScore;
  finalScore?: number;
};

export type StoredBlankCandidatePool = {
  passageId: string;
  sourceHash: string;
  algorithmVersion: string;
  candidates: StoredBlankCandidate[];
  coreSentenceIds?: string[];
  createdAt: string;
};

export function normalizeEnglishForHash(text: string): string {
  return formatWorkbookPassage(text).toLowerCase();
}

export function computePassageSourceHash(englishLines: string[]): string {
  const joined = englishLines
    .map(normalizeEnglishForHash)
    .filter(Boolean)
    .join("\n");
  return createHash("sha256").update(joined).digest("hex").slice(0, 32);
}

export function isBlankPoolFresh(
  pool: StoredBlankCandidatePool | null | undefined,
  passageId: string,
  sourceHash: string
): pool is StoredBlankCandidatePool {
  if (!pool) return false;
  if (pool.passageId !== passageId) return false;
  if (pool.sourceHash !== sourceHash) return false;
  if (pool.algorithmVersion !== BLANK_POOL_ALGORITHM_VERSION) return false;
  return Array.isArray(pool.candidates) && pool.candidates.length > 0;
}
