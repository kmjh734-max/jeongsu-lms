import type {
  BlankDensity,
  BlankPartOfSpeech,
  GeneratedBlankCandidate,
} from "@/lib/lesson-materials/workbook-types";
import {
  countEnglishWords,
  getMaxBlanksForSentence,
} from "@/lib/lesson-materials/workbook-types";
import {
  computeConceptScore,
  conflictsWithNearSynonym,
  DEGREE_ADVERBS,
} from "@/lib/lesson-materials/blank-concept-score";

const EXCLUDED_LOWER = new Set([
  "a",
  "an",
  "the",
  "i",
  "me",
  "my",
  "mine",
  "you",
  "your",
  "yours",
  "he",
  "him",
  "his",
  "she",
  "her",
  "hers",
  "it",
  "its",
  "we",
  "us",
  "our",
  "ours",
  "they",
  "them",
  "their",
  "theirs",
  "this",
  "that",
  "these",
  "those",
  "who",
  "whom",
  "whose",
  "which",
  "what",
  "and",
  "or",
  "but",
  "so",
  "nor",
  "for",
  "yet",
  "of",
  "in",
  "on",
  "at",
  "to",
  "from",
  "by",
  "with",
  "as",
  "into",
  "onto",
  "over",
  "under",
  "about",
  "be",
  "am",
  "is",
  "are",
  "was",
  "were",
  "been",
  "being",
  "do",
  "does",
  "did",
  "have",
  "has",
  "had",
  "will",
  "would",
  "shall",
  "should",
  "can",
  "could",
  "may",
  "might",
  "must",
  "not",
  "no",
  "yes",
]);

const POS_OK = new Set<BlankPartOfSpeech>([
  "noun",
  "verb",
  "adjective",
  "adverb",
]);

export type BlankSourceSentence = {
  id: string;
  english: string;
};

export type WordSpan = {
  text: string;
  start: number;
  end: number;
  wordIndex: number;
};

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Word-boundary occurrences of exact surface form in a sentence. */
export function findExactWordOccurrences(
  sentence: string,
  answerText: string
): WordSpan[] {
  const target = answerText.trim();
  if (!target) return [];
  const re = new RegExp(`\\b${escapeRegExp(target)}\\b`, "g");
  const allWords = tokenizeWords(sentence);
  const hits: WordSpan[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(sentence)) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    const wordIndex =
      allWords.find((w) => w.start === start && w.end === end)?.wordIndex ??
      allWords.findIndex((w) => w.start <= start && w.end >= end);
    hits.push({
      text: m[0],
      start,
      end,
      wordIndex: wordIndex >= 0 ? wordIndex : hits.length,
    });
  }
  return hits;
}

export function tokenizeWords(sentence: string): WordSpan[] {
  const re = /[A-Za-z]+(?:'[A-Za-z]+)?/g;
  const out: WordSpan[] = [];
  let m: RegExpExecArray | null;
  let idx = 0;
  while ((m = re.exec(sentence)) !== null) {
    out.push({
      text: m[0],
      start: m.index,
      end: m.index + m[0].length,
      wordIndex: idx++,
    });
  }
  return out;
}

export function isExcludedBlankWord(answerText: string): boolean {
  const bare = answerText.replace(/[^A-Za-z']/g, "").toLowerCase();
  if (!bare) return true;
  if (EXCLUDED_LOWER.has(bare)) return true;
  if (DEGREE_ADVERBS.has(bare)) return true;
  if (/^\d+$/.test(bare)) return true;
  return false;
}

export type ValidatedBlankCandidate = GeneratedBlankCandidate & {
  start: number;
  end: number;
  wordIndex: number;
  globalWordIndex: number;
  conceptScore: number;
};

export function validateBlankCandidates(input: {
  passageId: string;
  responsePassageId: string;
  sentences: BlankSourceSentence[];
  generatedCandidates: unknown;
  recommendedCount: number;
  density?: BlankDensity;
  vocabLemmas?: Set<string>;
  titleText?: string;
}): {
  valid: ValidatedBlankCandidate[];
  rejected: Array<{ reason: string; raw?: unknown }>;
} {
  const density = input.density ?? "standard";
  const rejected: Array<{ reason: string; raw?: unknown }> = [];
  if (input.responsePassageId && input.responsePassageId !== input.passageId) {
    rejected.push({
      reason: `passageId 불일치 (${input.responsePassageId})`,
    });
  }

  const byId = new Map(input.sentences.map((s) => [s.id, s] as const));
  const sentenceOffsets = new Map<string, number>();
  const sentenceWordCounts = new Map<string, number>();
  let running = 0;
  for (const s of input.sentences) {
    sentenceOffsets.set(s.id, running);
    const wc = countEnglishWords(s.english);
    sentenceWordCounts.set(s.id, wc);
    running += tokenizeWords(s.english).length + 1;
  }

  const list = Array.isArray(input.generatedCandidates)
    ? input.generatedCandidates
    : [];
  if (!Array.isArray(input.generatedCandidates)) {
    rejected.push({ reason: "candidates가 배열이 아님" });
  }

  const valid: ValidatedBlankCandidate[] = [];
  const usedPositions = new Set<string>();
  const usedLemmas = new Set<string>();
  const perSentence = new Map<string, number>();

  for (const raw of list) {
    const row = raw as Record<string, unknown>;
    const sentenceId = String(row.sentenceId ?? "").trim();
    const answerText = String(row.answerText ?? "").trim();
    const lemma = String(row.lemma ?? "").trim().toLowerCase();
    const meaningKo = String(row.meaningKo ?? "").trim();
    const selectionReasonKo = String(row.selectionReasonKo ?? "").trim();
    const partOfSpeech = String(row.partOfSpeech ?? "").trim() as BlankPartOfSpeech;
    const occurrenceIndex = Number(row.occurrenceIndex);
    const priority = Number(row.priority);
    const id = String(row.id ?? "").trim() || `auto-${valid.length + 1}`;

    if (!sentenceId || !byId.has(sentenceId)) {
      rejected.push({ reason: `sentenceId 없음: ${sentenceId}`, raw });
      continue;
    }
    if (!answerText || !/^[A-Za-z]+(?:'[A-Za-z]+)?$/.test(answerText)) {
      rejected.push({ reason: `answerText 단일어 아님: ${answerText}`, raw });
      continue;
    }
    if (!lemma) {
      rejected.push({ reason: "lemma 비어 있음", raw });
      continue;
    }
    if (!meaningKo) {
      rejected.push({ reason: "meaningKo 비어 있음", raw });
      continue;
    }
    if (!POS_OK.has(partOfSpeech)) {
      rejected.push({ reason: `품사 불가: ${partOfSpeech}`, raw });
      continue;
    }
    if (!Number.isInteger(occurrenceIndex) || occurrenceIndex < 0) {
      rejected.push({ reason: `occurrenceIndex 오류: ${occurrenceIndex}`, raw });
      continue;
    }
    if (!Number.isInteger(priority) || priority < 1 || priority > 5) {
      rejected.push({ reason: `priority 오류: ${priority}`, raw });
      continue;
    }
    if (isExcludedBlankWord(answerText)) {
      rejected.push({ reason: `제외 어휘: ${answerText}`, raw });
      continue;
    }

    const sentence = byId.get(sentenceId)!;
    const hits = findExactWordOccurrences(sentence.english, answerText);
    if (!hits[occurrenceIndex]) {
      rejected.push({
        reason: `occurrence 없음: ${answerText}#${occurrenceIndex}`,
        raw,
      });
      continue;
    }
    const hit = hits[occurrenceIndex]!;
    const posKey = `${sentenceId}:${hit.start}:${hit.end}`;
    if (usedPositions.has(posKey)) {
      rejected.push({ reason: `위치 중복: ${posKey}`, raw });
      continue;
    }
    if (usedLemmas.has(lemma)) {
      rejected.push({ reason: `표제어 중복: ${lemma}`, raw });
      continue;
    }
    const maxForSentence = getMaxBlanksForSentence(
      sentenceWordCounts.get(sentenceId) ?? 0,
      density
    );
    const sc = perSentence.get(sentenceId) ?? 0;
    if (sc >= maxForSentence) {
      rejected.push({ reason: `문장당 초과: ${sentenceId}`, raw });
      continue;
    }

    usedPositions.add(posKey);
    usedLemmas.add(lemma);
    perSentence.set(sentenceId, sc + 1);
    const base = sentenceOffsets.get(sentenceId) ?? 0;
    valid.push({
      id,
      sentenceId,
      answerText: hit.text,
      occurrenceIndex,
      lemma,
      partOfSpeech,
      meaningKo,
      selectionReasonKo: selectionReasonKo || "핵심 어휘",
      priority,
      start: hit.start,
      end: hit.end,
      wordIndex: hit.wordIndex,
      globalWordIndex: base + hit.wordIndex,
      conceptScore: computeConceptScore({
        lemma,
        partOfSpeech,
        priority,
        vocabLemmas: input.vocabLemmas,
        titleText: input.titleText,
      }),
    });
  }

  return { valid, rejected };
}

export type SelectBlankResult = {
  selected: ValidatedBlankCandidate[];
  shortfallReason: string | null;
};

/** Pick up to recommendedCount with distribution / spacing constraints. */
export function selectBlankCandidates(
  valid: ValidatedBlankCandidate[],
  recommendedCount: number,
  options?: {
    density?: BlankDensity;
    sentenceWordCounts?: Map<string, number>;
  }
): SelectBlankResult {
  const density = options?.density ?? "standard";
  const target = Math.max(1, recommendedCount);
  const minGapPreferred = density === "high" ? 4 : 5;
  const sorted = [...valid].sort((a, b) => {
    if (b.conceptScore !== a.conceptScore) return b.conceptScore - a.conceptScore;
    if (b.priority !== a.priority) return b.priority - a.priority;
    return a.globalWordIndex - b.globalWordIndex;
  });

  const picked: ValidatedBlankCandidate[] = [];
  const lemma = new Set<string>();
  const perSentence = new Map<string, number>();
  let hitSentenceCap = false;
  let hitGapCap = false;

  const maxFor = (sentenceId: string) =>
    getMaxBlanksForSentence(
      options?.sentenceWordCounts?.get(sentenceId) ?? 20,
      density
    );

  const tryPick = (c: ValidatedBlankCandidate, minGap: number): boolean => {
    if (picked.length >= target) return false;
    if (lemma.has(c.lemma)) return false;
    const maxS = maxFor(c.sentenceId);
    if ((perSentence.get(c.sentenceId) ?? 0) >= maxS) {
      hitSentenceCap = true;
      return false;
    }
    for (const p of picked) {
      if (conflictsWithNearSynonym(c, p)) return false;
      if (Math.abs(p.globalWordIndex - c.globalWordIndex) < minGap) {
        hitGapCap = true;
        return false;
      }
      if (Math.abs(p.globalWordIndex - c.globalWordIndex) < 2) return false;
    }
    picked.push(c);
    lemma.add(c.lemma);
    perSentence.set(c.sentenceId, (perSentence.get(c.sentenceId) ?? 0) + 1);
    return true;
  };

  for (const gap of [minGapPreferred, 3, 2]) {
    for (const c of sorted) {
      if (picked.some((p) => p.sentenceId === c.sentenceId && p.start === c.start))
        continue;
      tryPick(c, gap);
    }
    if (picked.length >= Math.min(target, valid.length)) break;
  }

  if (picked.length > 0 && sorted.length > picked.length) {
    const maxGlobal = Math.max(...valid.map((v) => v.globalWordIndex), 1);
    const hasLate = picked.some((p) => p.globalWordIndex >= maxGlobal * 0.6);
    if (!hasLate) {
      const late = sorted.find(
        (c) =>
          c.globalWordIndex >= maxGlobal * 0.6 &&
          !picked.some(
            (p) => p.start === c.start && p.sentenceId === c.sentenceId
          ) &&
          !lemma.has(c.lemma)
      );
      if (late && picked.length >= target) {
        picked.sort(
          (a, b) => a.priority - b.priority || a.globalWordIndex - b.globalWordIndex
        );
        const drop = picked[0];
        if (drop && drop.priority <= late.priority) {
          lemma.delete(drop.lemma);
          perSentence.set(
            drop.sentenceId,
            Math.max(0, (perSentence.get(drop.sentenceId) ?? 1) - 1)
          );
          picked.shift();
          tryPick(late, 2);
        }
      } else if (late) {
        tryPick(late, 2);
      }
    }
  }

  const selected = picked.sort((a, b) => {
    if (a.sentenceId !== b.sentenceId) {
      return a.sentenceId.localeCompare(b.sentenceId, undefined, {
        numeric: true,
      });
    }
    return a.start - b.start;
  });

  let shortfallReason: string | null = null;
  if (selected.length < target) {
    if (valid.length < target) {
      shortfallReason = "중복되지 않는 핵심 어휘 후보 부족";
    } else if (hitSentenceCap) {
      shortfallReason = "문장별 최대 빈칸 제한 적용";
    } else if (hitGapCap) {
      shortfallReason = "인접 빈칸 방지 규칙 적용";
    } else {
      shortfallReason = "중복되지 않는 핵심 어휘 후보 부족";
    }
  }

  return { selected, shortfallReason };
}
