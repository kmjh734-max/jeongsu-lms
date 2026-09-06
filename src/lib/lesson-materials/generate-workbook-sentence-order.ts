import {
  SENTENCE_ORDER_SKIP_RESTORE,
  SENTENCE_ORDER_SKIP_TOO_FEW,
} from "@/lib/lesson-materials/sentence-order-constants";
import {
  buildSentenceOrderSeed,
  displayNumberForIndex,
  formatAnswerOrderSequence,
  hashSeedToUint32,
  planSentenceOrderSetSizes,
  shuffleSentenceIds,
  stripLeadingSentenceMarkers,
  validateSentenceOrderQuestion,
  type SentenceOrderQuestion,
  type SentenceOrderSkip,
  type SentenceOrderSourceSentence,
} from "@/lib/lesson-materials/sentence-order-shuffle";
import {
  sentencesRestoreOriginal,
  splitEnglishPassageIntoSentences,
} from "@/lib/lesson-materials/split-english-sentences";
import { formatWorkbookPassage } from "@/lib/lesson-materials/workbook-types";

function computeSourceHash(englishLines: string[]): string {
  const joined = englishLines
    .map((t) => formatWorkbookPassage(t).toLowerCase())
    .filter(Boolean)
    .join("\n");
  // Client-safe deterministic hash (server generate path only needs stability)
  let out = "";
  for (let i = 0; i < 4; i++) {
    out += hashSeedToUint32(`${joined}#so#${i}`)
      .toString(16)
      .padStart(8, "0");
  }
  return out;
}

export type GenerateSentenceOrderInput = {
  workbookId: string;
  passages: Array<{
    projectId: string;
    title: string;
    source: string | null;
    /** Stored lesson_material_items in order */
    sentences: Array<{
      id: string;
      english: string;
      korean?: string | null;
    }>;
  }>;
};

export type GenerateSentenceOrderResult = {
  questions: SentenceOrderQuestion[];
  skipped: SentenceOrderSkip[];
  openAiRequestCount: 0;
};

function normalizeEnglish(text: string): string {
  return formatWorkbookPassage(text);
}

/**
 * Prefer stored item rows as one sentence each.
 * If only one row contains multiple sentences, fall back to code splitter.
 */
export function resolvePassageSentences(input: {
  projectId: string;
  sentences: Array<{ id: string; english: string; korean?: string | null }>;
}):
  | { ok: true; sentences: SentenceOrderSourceSentence[]; sourceHash: string }
  | { ok: false; reason: string } {
  const rows = input.sentences
    .map((s, orderIndex) => ({
      id: s.id,
      english: normalizeEnglish(s.english),
      korean: s.korean ?? undefined,
      orderIndex,
    }))
    .filter((s) => s.english.length > 0);

  if (rows.length === 0) {
    return { ok: false, reason: SENTENCE_ORDER_SKIP_TOO_FEW };
  }

  let resolved: SentenceOrderSourceSentence[];

  if (rows.length >= 2) {
    resolved = rows.map((r) => ({
      sentenceId: r.id,
      orderIndex: r.orderIndex,
      english: r.english,
      englishDisplay: stripLeadingSentenceMarkers(r.english),
      korean: r.korean,
    }));
  } else {
    const only = rows[0]!;
    const parts = splitEnglishPassageIntoSentences(only.english);
    if (parts.length >= 2) {
      if (!sentencesRestoreOriginal(only.english, parts)) {
        return { ok: false, reason: SENTENCE_ORDER_SKIP_RESTORE };
      }
      resolved = parts.map((english, orderIndex) => ({
        sentenceId: `${only.id}#${orderIndex}`,
        orderIndex,
        english,
        englishDisplay: stripLeadingSentenceMarkers(english),
        korean: orderIndex === 0 ? only.korean : undefined,
      }));
    } else {
      resolved = [
        {
          sentenceId: only.id,
          orderIndex: 0,
          english: only.english,
          englishDisplay: stripLeadingSentenceMarkers(only.english),
          korean: only.korean,
        },
      ];
    }
  }

  if (resolved.length < 3) {
    return { ok: false, reason: SENTENCE_ORDER_SKIP_TOO_FEW };
  }

  const sourceHash = computeSourceHash(resolved.map((s) => s.english));
  return { ok: true, sentences: resolved, sourceHash };
}

function buildQuestion(input: {
  workbookId: string;
  passageId: string;
  title: string;
  source: string | null;
  passageOrdinal: number;
  setIndex: number;
  setSentences: SentenceOrderSourceSentence[];
  sourceHash: string;
  /** Pin first only for unsplit 7–10 sentence passages */
  pinFirstSentence: boolean;
}): SentenceOrderQuestion | { error: string } {
  const {
    workbookId,
    passageId,
    title,
    source,
    passageOrdinal,
    setIndex,
    setSentences,
    sourceHash,
    pinFirstSentence,
  } = input;

  const originalSentenceIds = setSentences.map((s) => s.sentenceId);
  const originalEnglish = setSentences.map((s) => s.english);
  const seed = buildSentenceOrderSeed({
    workbookId,
    passageId,
    setIndex,
    sourceHash: computeSourceHash([
      sourceHash,
      `set:${setIndex}`,
      originalSentenceIds.join(","),
    ]),
  });

  const given = pinFirstSentence ? setSentences[0]! : null;
  const toShuffle = pinFirstSentence ? setSentences.slice(1) : setSentences;
  const shuffleIds = toShuffle.map((s) => s.sentenceId);
  const shuffledIds = shuffleSentenceIds(shuffleIds, seed);

  const byId = new Map(toShuffle.map((s) => [s.sentenceId, s] as const));
  const shuffledItems = shuffledIds.map((id, i) => {
    const s = byId.get(id)!;
    return {
      displayNumber: displayNumberForIndex(i),
      sentenceId: s.sentenceId,
      english: s.english,
      englishDisplay: s.englishDisplay,
      originalOrderIndex: s.orderIndex,
    };
  });

  const numberBySentenceId = new Map(
    shuffledItems.map((it) => [it.sentenceId, it.displayNumber] as const)
  );
  const answerOrderNumbers = shuffleIds.map(
    (id) => numberBySentenceId.get(id)!
  );

  const questionId = computeSourceHash([
    seed,
    passageId,
    String(setIndex),
  ]).slice(0, 16);

  const q: SentenceOrderQuestion = {
    questionId,
    passageId,
    title,
    source,
    setIndex,
    passageOrdinal,
    seed,
    pinFirstSentence,
    givenSentence: given
      ? {
          sentenceId: given.sentenceId,
          english: given.english,
          englishDisplay: given.englishDisplay,
          originalOrderIndex: given.orderIndex,
        }
      : null,
    originalSentenceIds,
    originalEnglish,
    shuffledSentenceIds: shuffledIds,
    shuffledItems,
    answerOrderNumbers,
    restoredPassagePreview: originalEnglish.join(" "),
  };

  const check = validateSentenceOrderQuestion(q);
  if (!check.ok) return { error: check.reason };
  return q;
}

export function generateWorkbookSentenceOrder(
  input: GenerateSentenceOrderInput
): GenerateSentenceOrderResult {
  const questions: SentenceOrderQuestion[] = [];
  const skipped: SentenceOrderSkip[] = [];
  let passageOrdinal = 0;

  for (const p of input.passages) {
    const resolved = resolvePassageSentences({
      projectId: p.projectId,
      sentences: p.sentences,
    });

    if (!resolved.ok) {
      skipped.push({
        projectId: p.projectId,
        title: p.title,
        reason: resolved.reason,
      });
      continue;
    }

    const { sentences, sourceHash } = resolved;
    const sizes = planSentenceOrderSetSizes(sentences.length);
    if (sizes.length === 0) {
      skipped.push({
        projectId: p.projectId,
        title: p.title,
        reason: SENTENCE_ORDER_SKIP_TOO_FEW,
      });
      continue;
    }

    // Pin first only when one set of 7–10 (not when split into multiple sets)
    const pinFirst =
      sizes.length === 1 &&
      sentences.length >= 7 &&
      sentences.length <= 10;

    passageOrdinal += 1;
    let offset = 0;
    let failed = false;

    for (let si = 0; si < sizes.length; si++) {
      const size = sizes[si]!;
      const slice = sentences.slice(offset, offset + size).map((s, i) => ({
        ...s,
        orderIndex: i,
      }));
      offset += size;

      const built = buildQuestion({
        workbookId: input.workbookId,
        passageId: p.projectId,
        title: p.title,
        source: p.source,
        passageOrdinal,
        setIndex: si + 1,
        setSentences: slice,
        sourceHash,
        pinFirstSentence: pinFirst,
      });

      if ("error" in built) {
        skipped.push({
          projectId: p.projectId,
          title: p.title,
          reason: `${SENTENCE_ORDER_SKIP_RESTORE} (${built.error})`,
        });
        // Roll back questions from this passage
        for (let k = questions.length - 1; k >= 0; k--) {
          if (questions[k]!.passageId === p.projectId) questions.splice(k, 1);
        }
        passageOrdinal -= 1;
        failed = true;
        break;
      }
      questions.push(built);
    }

    if (failed) continue;

    // Coverage: every sentence used once
    const used = questions
      .filter((q) => q.passageId === p.projectId)
      .flatMap((q) => q.originalSentenceIds);
    if (
      used.length !== sentences.length ||
      new Set(used).size !== sentences.length
    ) {
      for (let k = questions.length - 1; k >= 0; k--) {
        if (questions[k]!.passageId === p.projectId) questions.splice(k, 1);
      }
      passageOrdinal -= 1;
      skipped.push({
        projectId: p.projectId,
        title: p.title,
        reason: SENTENCE_ORDER_SKIP_RESTORE,
      });
    }
  }

  return { questions, skipped, openAiRequestCount: 0 };
}

export { formatAnswerOrderSequence };
