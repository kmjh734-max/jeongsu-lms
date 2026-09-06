import type { LessonPackVocabItem } from "@/lib/lesson-materials/generate-lesson-pack";
import {
  buildBlankCandidatesFromVocab,
  buildHeuristicBlankCandidates,
} from "@/lib/lesson-materials/build-blank-candidates-from-vocab";
import type { BlankCandidateSource } from "@/lib/lesson-materials/blank-selection-diagnostics";

function annotateSource(
  rows: unknown[],
  source: BlankCandidateSource
): unknown[] {
  return rows.map((raw) => {
    const row = (raw ?? {}) as Record<string, unknown>;
    const prev = Array.isArray(row.sources)
      ? (row.sources as string[])
      : row.source
        ? [String(row.source)]
        : [];
    const sources = Array.from(new Set([...prev, source]));
    return { ...row, source, sources };
  });
}

function positionKey(row: Record<string, unknown>): string | null {
  const sid = String(row.sentenceId ?? "").trim();
  const start = Number(row.tokenStartIndex ?? row.start);
  const end = Number(row.tokenEndIndex ?? row.end);
  if (sid && Number.isFinite(start) && Number.isFinite(end)) {
    return `${sid}:${start}:${end}`;
  }
  const answer = String(row.answerText ?? row.token ?? "").trim().toLowerCase();
  const occ = Number(row.occurrenceIndex ?? 0);
  if (!sid || !answer) return null;
  return `${sid}:${answer}:${occ}`;
}

/**
 * Merge AI + saved vocab + deterministic content-word candidates.
 * Dedupes by sentenceId + token offsets (or sentenceId+token+occurrence).
 */
export function mergeBlankCandidateSources(input: {
  aiCandidates: unknown[];
  sentences: Array<{ id: string; english: string }>;
  vocab?: LessonPackVocabItem[];
  titleText?: string;
  maxFallback?: number;
}): {
  merged: unknown[];
  aiCandidateCount: number;
  savedVocabularyCandidateCount: number;
  fallbackCandidateCount: number;
} {
  const ai = annotateSource(input.aiCandidates ?? [], "ai");
  const vocabRaw =
    (input.vocab?.length ?? 0) > 0
      ? buildBlankCandidatesFromVocab({
          sentences: input.sentences,
          vocab: input.vocab!,
          titleText: input.titleText,
          maxCandidates: input.maxFallback ?? 48,
        })
      : [];
  const vocab = annotateSource(vocabRaw, "saved-vocabulary");
  const fallbackRaw = buildHeuristicBlankCandidates({
    sentences: input.sentences,
    titleText: input.titleText,
    maxCandidates: input.maxFallback ?? 48,
  });
  const fallback = annotateSource(fallbackRaw, "deterministic-fallback");

  const byPos = new Map<string, Record<string, unknown>>();
  const order: string[] = [];

  const ingest = (rows: unknown[]) => {
    for (const raw of rows) {
      const row = { ...(raw as Record<string, unknown>) };
      const key = positionKey(row);
      if (!key) continue;
      const existing = byPos.get(key);
      if (!existing) {
        byPos.set(key, row);
        order.push(key);
        continue;
      }
      const sources = Array.from(
        new Set([
          ...((existing.sources as string[]) ?? []),
          ...((row.sources as string[]) ?? []),
        ])
      );
      // Prefer AI scores / grade when merging
      const preferAi =
        sources.includes("ai") &&
        ((row.sources as string[]) ?? []).includes("ai");
      byPos.set(key, {
        ...(preferAi ? { ...existing, ...row } : { ...row, ...existing }),
        sources,
        source: sources[0],
      });
    }
  };

  ingest(ai);
  ingest(vocab);
  ingest(fallback);

  return {
    merged: order.map((k) => byPos.get(k)!),
    aiCandidateCount: ai.length,
    savedVocabularyCandidateCount: vocab.length,
    fallbackCandidateCount: fallback.length,
  };
}
