import {
  SENTENCE_ORDER_ALGORITHM_VERSION,
  SENTENCE_ORDER_MAX_ADJACENT_PAIR_RATIO,
  SENTENCE_ORDER_MAX_SAME_POSITION_RATIO,
  SENTENCE_ORDER_MAX_SHUFFLE_ATTEMPTS,
} from "@/lib/lesson-materials/sentence-order-constants";

export type SentenceOrderSourceSentence = {
  sentenceId: string;
  orderIndex: number;
  english: string;
  englishDisplay: string;
  korean?: string;
};

export type SentenceOrderShuffledItem = {
  /** 1-based choice number in shuffled presentation order (not original order) */
  displayNumber: number;
  sentenceId: string;
  english: string;
  englishDisplay: string;
  originalOrderIndex: number;
};

export type SentenceOrderQuestion = {
  questionId: string;
  passageId: string;
  title: string;
  source: string | null;
  setIndex: number;
  /** 1-based ordinal among successfully generated passages */
  passageOrdinal: number;
  seed: string;
  /** When true, first original sentence is shown fixed; not in shuffledItems */
  pinFirstSentence: boolean;
  givenSentence: {
    sentenceId: string;
    english: string;
    englishDisplay: string;
    originalOrderIndex: number;
  } | null;
  originalSentenceIds: string[];
  originalEnglish: string[];
  shuffledSentenceIds: string[];
  shuffledItems: SentenceOrderShuffledItem[];
  /** Display numbers in original order for the shuffled (non-pinned) items */
  answerOrderNumbers: number[];
  /** Full original English joined for optional answer-key expansion */
  restoredPassagePreview: string;
};

export type SentenceOrderSkip = {
  projectId: string;
  title: string;
  reason: string;
};

/** Strip leading circled / decorative sentence markers for display only. */
export function stripLeadingSentenceMarkers(text: string): string {
  return String(text ?? "")
    .replace(
      /^[\s]*(?:[❶❷❸❹❺❻❼❽❾❿①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮]|[\d]+)[.)]\s+/,
      ""
    )
    .replace(/^[\s]*[❶❷❸❹❺❻❼❽❾❿①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮]+\s*/, "")
    .trim();
}

export function hashSeedToUint32(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function hexHash(input: string, parts = 3): string {
  let out = "";
  for (let i = 0; i < parts; i++) {
    out += hashSeedToUint32(`${input}#${i}`)
      .toString(16)
      .padStart(8, "0");
  }
  return out;
}

export function buildSentenceOrderSeed(input: {
  workbookId: string;
  passageId: string;
  setIndex: number;
  sourceHash: string;
}): string {
  const raw = [
    input.workbookId,
    input.passageId,
    String(input.setIndex),
    input.sourceHash,
    SENTENCE_ORDER_ALGORITHM_VERSION,
  ].join("|");
  return hexHash(raw, 3);
}

/** Mulberry32 PRNG */
export function createSeededRng(seed: string): () => number {
  let state = hashSeedToUint32(seed) || 1;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function fisherYatesShuffle<T>(items: T[], rng: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return out;
}

export function samePositionRatio(
  original: string[],
  shuffled: string[]
): number {
  if (original.length === 0) return 0;
  let same = 0;
  for (let i = 0; i < original.length; i++) {
    if (original[i] === shuffled[i]) same += 1;
  }
  return same / original.length;
}

export function isExactReverse(original: string[], shuffled: string[]): boolean {
  if (original.length !== shuffled.length || original.length < 2) return false;
  for (let i = 0; i < original.length; i++) {
    if (original[i] !== shuffled[original.length - 1 - i]) return false;
  }
  return true;
}

/** Forward adjacent pairs kept in shuffled sequence (order preserved as neighbors). */
export function adjacentPairKeepRatio(
  original: string[],
  shuffled: string[]
): number {
  if (original.length < 2) return 0;
  const origPairs = new Set<string>();
  for (let i = 0; i < original.length - 1; i++) {
    origPairs.add(`${original[i]}>${original[i + 1]}`);
  }
  let kept = 0;
  for (let i = 0; i < shuffled.length - 1; i++) {
    if (origPairs.has(`${shuffled[i]}>${shuffled[i + 1]}`)) kept += 1;
  }
  return kept / origPairs.size;
}

export function isAcceptableShuffle(
  original: string[],
  shuffled: string[]
): boolean {
  if (original.length !== shuffled.length) return false;
  if (original.join("|") === shuffled.join("|")) return false;
  if (isExactReverse(original, shuffled)) return false;
  if (
    samePositionRatio(original, shuffled) >=
    SENTENCE_ORDER_MAX_SAME_POSITION_RATIO
  ) {
    return false;
  }
  if (
    adjacentPairKeepRatio(original, shuffled) >=
    SENTENCE_ORDER_MAX_ADJACENT_PAIR_RATIO
  ) {
    return false;
  }
  return true;
}

export type ShuffleAttemptScore = {
  ids: string[];
  samePos: number;
  adjacent: number;
  identity: boolean;
  reverse: boolean;
};

export function scoreShuffle(
  original: string[],
  shuffled: string[]
): ShuffleAttemptScore {
  return {
    ids: shuffled,
    samePos: samePositionRatio(original, shuffled),
    adjacent: adjacentPairKeepRatio(original, shuffled),
    identity: original.join("|") === shuffled.join("|"),
    reverse: isExactReverse(original, shuffled),
  };
}

/**
 * Deterministic shuffle with quality gates. Never returns identity/reverse
 * when alternatives exist; falls back to best non-identity attempt.
 */
export function shuffleSentenceIds(
  originalIds: string[],
  seed: string
): string[] {
  if (originalIds.length <= 1) return [...originalIds];

  const rng = createSeededRng(seed);
  let best: ShuffleAttemptScore | null = null;

  for (let attempt = 0; attempt < SENTENCE_ORDER_MAX_SHUFFLE_ATTEMPTS; attempt++) {
    const attemptSeed = `${seed}#${attempt}`;
    const attemptRng = createSeededRng(attemptSeed);
    // Mix base rng so attempt 0 still depends on seed
    void rng();
    const shuffled = fisherYatesShuffle(originalIds, attemptRng);
    const scored = scoreShuffle(originalIds, shuffled);
    if (isAcceptableShuffle(originalIds, shuffled)) {
      return shuffled;
    }
    if (
      !scored.identity &&
      !scored.reverse &&
      (best == null ||
        scored.samePos + scored.adjacent < best.samePos + best.adjacent)
    ) {
      best = scored;
    }
  }

  if (best) return best.ids;

  // Last resort: rotate by 1 (guaranteed non-identity for n>=2)
  const rotated = [...originalIds.slice(1), originalIds[0]!];
  if (!isExactReverse(originalIds, rotated)) return rotated;
  // n=2 reverse is the only alternative — accept rotated anyway (not identity)
  return rotated;
}

/**
 * One passage → one question (all sentences). Numbers scale past 10 freely.
 */
export function planSentenceOrderSetSizes(count: number): number[] {
  if (count < 3) return [];
  return [count];
}

/** Shuffled presentation index → 1-based display number */
export function displayNumberForIndex(shuffledIndex: number): number {
  return shuffledIndex + 1;
}

export function validateSentenceOrderQuestion(
  q: SentenceOrderQuestion
): { ok: true } | { ok: false; reason: string } {
  const shuffledIds = q.shuffledItems.map((x) => x.sentenceId);
  if (new Set(shuffledIds).size !== shuffledIds.length) {
    return { ok: false, reason: "중복된 sentenceId" };
  }
  const numbers = q.shuffledItems.map((x) => x.displayNumber);
  if (new Set(numbers).size !== numbers.length) {
    return { ok: false, reason: "중복된 보기 번호" };
  }
  for (let i = 0; i < q.shuffledItems.length; i++) {
    if (q.shuffledItems[i]!.displayNumber !== i + 1) {
      return { ok: false, reason: "보기 번호는 위에서부터 1..n 이어야 합니다" };
    }
  }

  const expectedShuffleCount = q.pinFirstSentence
    ? q.originalSentenceIds.length - 1
    : q.originalSentenceIds.length;
  if (q.shuffledItems.length !== expectedShuffleCount) {
    return { ok: false, reason: "보기 문장 수 불일치" };
  }
  if (q.answerOrderNumbers.length !== expectedShuffleCount) {
    return { ok: false, reason: "정답 번호 수 불일치" };
  }

  for (const n of q.answerOrderNumbers) {
    if (!q.shuffledItems.some((it) => it.displayNumber === n)) {
      return { ok: false, reason: `정답 번호 없음: ${n}` };
    }
  }

  const restoredFromAnswers = q.answerOrderNumbers.map((n) => {
    const item = q.shuffledItems.find((it) => it.displayNumber === n);
    return item?.sentenceId ?? "";
  });
  const expectedIds = q.pinFirstSentence
    ? q.originalSentenceIds.slice(1)
    : q.originalSentenceIds;
  if (restoredFromAnswers.join("|") !== expectedIds.join("|")) {
    return { ok: false, reason: "정답 번호로 복원한 sentenceId 불일치" };
  }

  if (
    q.shuffledSentenceIds.join("|") !==
    q.shuffledItems.map((x) => x.sentenceId).join("|")
  ) {
    return { ok: false, reason: "shuffledSentenceIds 불일치" };
  }

  const fullRestoredIds = q.pinFirstSentence
    ? [q.givenSentence!.sentenceId, ...restoredFromAnswers]
    : restoredFromAnswers;
  if (fullRestoredIds.join("|") !== q.originalSentenceIds.join("|")) {
    return { ok: false, reason: "전체 원문 sentenceId 복원 실패" };
  }

  const byId = new Map(
    [...(q.givenSentence ? [q.givenSentence] : []), ...q.shuffledItems].map(
      (s) => [s.sentenceId, s.english] as const
    )
  );
  const restoredEnglish = q.originalSentenceIds.map((id) => byId.get(id) ?? "");
  if (restoredEnglish.join("\n") !== q.originalEnglish.join("\n")) {
    return { ok: false, reason: "원문 영어 복원 불일치" };
  }

  return { ok: true };
}

/** Answer key: `2 → 4 → 3 → 1` (no parentheses) */
export function formatAnswerOrderSequence(numbers: number[]): string {
  return numbers.join(" → ");
}
