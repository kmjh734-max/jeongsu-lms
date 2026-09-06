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
  computeBlankFinalScore,
  conflictsWithNearSynonym,
  DEGREE_ADVERBS,
  isSoftEasyWord,
  normalizeBlankScores,
  normalizeWordFamily,
  sameWordFamily,
  synthesizeScoresForLemma,
  type BlankCandidateScore,
  type BlankSemanticRole,
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

const SEMANTIC_OK = new Set<BlankSemanticRole>([
  "theme",
  "main_claim",
  "logic",
  "academic",
  "context",
  "collocation",
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
  finalScore: number;
  wordFamily: string;
  semanticRole: BlankSemanticRole | null;
  competitionGroup: string | null;
  scores: BlankCandidateScore;
};

function parseScores(row: Record<string, unknown>): BlankCandidateScore | null {
  const nested = row.scores;
  if (nested && typeof nested === "object") {
    return normalizeBlankScores(nested as Partial<BlankCandidateScore>);
  }
  // Flat fields (legacy / vocab)
  if (
    row.centrality != null ||
    row.learningValue != null ||
    row.priority != null
  ) {
    return null;
  }
  return null;
}

export function validateBlankCandidates(input: {
  passageId: string;
  responsePassageId: string;
  sentences: BlankSourceSentence[];
  generatedCandidates: unknown;
  recommendedCount: number;
  density?: BlankDensity;
  vocabLemmas?: Set<string>;
  titleText?: string;
  coreSentenceIds?: string[];
}): {
  valid: ValidatedBlankCandidate[];
  rejected: Array<{ reason: string; raw?: unknown }>;
  coreSentenceIds: string[];
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

  const coreSentenceIds = (input.coreSentenceIds ?? []).filter((id) =>
    byId.has(id)
  );

  const valid: ValidatedBlankCandidate[] = [];
  const usedPositions = new Set<string>();

  for (const raw of list) {
    const row = raw as Record<string, unknown>;
    const sentenceId = String(row.sentenceId ?? "").trim();
    const answerText = String(row.answerText ?? "").trim();
    const lemma = String(row.lemma ?? "").trim().toLowerCase();
    const meaningKo = String(row.meaningKo ?? "").trim();
    const selectionReasonKo = String(
      row.reasonKo ?? row.selectionReasonKo ?? ""
    ).trim();
    const partOfSpeech = String(
      row.partOfSpeech ?? ""
    ).trim() as BlankPartOfSpeech;
    const occurrenceIndex = Number(row.occurrenceIndex);
    const id =
      String(row.candidateId ?? row.id ?? "").trim() ||
      `auto-${valid.length + 1}`;
    const wordFamily = normalizeWordFamily(
      lemma,
      String(row.wordFamily ?? "").trim() || null
    );
    const semanticRaw = String(row.semanticRole ?? "").trim() as BlankSemanticRole;
    const semanticRole = SEMANTIC_OK.has(semanticRaw) ? semanticRaw : null;
    const competitionGroupRaw = row.competitionGroup;
    const competitionGroup =
      competitionGroupRaw == null ||
      competitionGroupRaw === "" ||
      competitionGroupRaw === "null"
        ? null
        : String(competitionGroupRaw).trim();

    let priority = Number(row.priority);
    if (!Number.isInteger(priority) || priority < 1 || priority > 5) {
      priority = 3;
    }

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
    if (isExcludedBlankWord(answerText)) {
      rejected.push({ reason: `제외 어휘: ${answerText}`, raw });
      continue;
    }

    let scores = parseScores(row);
    if (!scores) {
      scores = synthesizeScoresForLemma({
        lemma,
        partOfSpeech,
        vocabLemmas: input.vocabLemmas,
        titleText: input.titleText,
        semanticRole,
      });
    }

    // Soft-exclude easy words unless high centrality / main claim
    if (
      isSoftEasyWord(lemma) &&
      scores.centrality < 4 &&
      semanticRole !== "main_claim" &&
      semanticRole !== "theme"
    ) {
      rejected.push({ reason: `쉬운 어휘 후순위 제외: ${answerText}`, raw });
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

    usedPositions.add(posKey);
    const base = sentenceOffsets.get(sentenceId) ?? 0;
    const finalScore = computeBlankFinalScore(scores);
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
      conceptScore: finalScore,
      finalScore,
      wordFamily,
      semanticRole,
      competitionGroup,
      scores,
    });
  }

  return { valid, rejected, coreSentenceIds };
}

export type SelectBlankResult = {
  selected: ValidatedBlankCandidate[];
  shortfallReason: string | null;
};

/**
 * Final blank selection in code (AI order is not used as-is).
 * 1 validate positions already done
 * 2–10: score, core sentences, word family, competition, adjacency, caps, distribution
 */
export function selectBlankCandidates(
  valid: ValidatedBlankCandidate[],
  recommendedCount: number,
  options?: {
    density?: BlankDensity;
    sentenceWordCounts?: Map<string, number>;
    coreSentenceIds?: string[];
    sentenceOrder?: string[];
  }
): SelectBlankResult {
  const density = options?.density ?? "standard";
  const target = Math.max(1, recommendedCount);
  const minGapPreferred = density === "high" ? 4 : 5;
  const coreSet = new Set(options?.coreSentenceIds ?? []);

  const sorted = [...valid].sort((a, b) => {
    if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
    if (b.priority !== a.priority) return b.priority - a.priority;
    return a.globalWordIndex - b.globalWordIndex;
  });

  const picked: ValidatedBlankCandidate[] = [];
  const usedFamilies = new Set<string>();
  const usedCompetition = new Set<string>();
  const usedLemmas = new Set<string>();
  const perSentence = new Map<string, number>();
  let hitSentenceCap = false;
  let hitGapCap = false;

  const maxFor = (sentenceId: string) =>
    getMaxBlanksForSentence(
      options?.sentenceWordCounts?.get(sentenceId) ?? 20,
      density
    );

  const conflicts = (
    c: ValidatedBlankCandidate,
    minGap: number
  ): "family" | "competition" | "gap" | "adjacent" | "cap" | "lemma" | null => {
    if (usedLemmas.has(c.lemma)) return "lemma";
    if (usedFamilies.has(c.wordFamily)) return "family";
    if (c.competitionGroup && usedCompetition.has(c.competitionGroup)) {
      return "competition";
    }
    if ((perSentence.get(c.sentenceId) ?? 0) >= maxFor(c.sentenceId)) {
      return "cap";
    }
    for (const p of picked) {
      if (conflictsWithNearSynonym(c, p)) return "competition";
      const dist = Math.abs(p.globalWordIndex - c.globalWordIndex);
      if (dist < 2) return "adjacent";
      if (dist < minGap) return "gap";
      // same sentence adjacent surface words
      if (
        p.sentenceId === c.sentenceId &&
        Math.abs(p.wordIndex - c.wordIndex) <= 1
      ) {
        return "adjacent";
      }
    }
    return null;
  };

  const tryPick = (
    c: ValidatedBlankCandidate,
    minGap: number,
    allowFamilyDup = false
  ): boolean => {
    if (picked.length >= target) return false;
    const reason = conflicts(c, minGap);
    if (reason === "cap") {
      hitSentenceCap = true;
      return false;
    }
    if (reason === "gap") {
      hitGapCap = true;
      return false;
    }
    if (reason === "family" && !allowFamilyDup) return false;
    if (reason && reason !== "family") return false;
    if (reason === "family" && allowFamilyDup) {
      // only when pool is thin
    } else if (reason) return false;

    picked.push(c);
    usedLemmas.add(c.lemma);
    usedFamilies.add(c.wordFamily);
    if (c.competitionGroup) usedCompetition.add(c.competitionGroup);
    perSentence.set(c.sentenceId, (perSentence.get(c.sentenceId) ?? 0) + 1);
    return true;
  };

  // 4. Ensure at least one blank from each core sentence (best candidate)
  for (const sid of coreSet) {
    if (picked.length >= target) break;
    if (picked.some((p) => p.sentenceId === sid)) continue;
    const best = sorted.find((c) => c.sentenceId === sid);
    if (best) tryPick(best, minGapPreferred);
  }

  // 5–10. Score order with tightening gaps
  for (const gap of [minGapPreferred, 3, 2]) {
    for (const c of sorted) {
      if (
        picked.some(
          (p) => p.sentenceId === c.sentenceId && p.start === c.start
        )
      ) {
        continue;
      }
      tryPick(c, gap);
    }
    if (picked.length >= Math.min(target, valid.length)) break;
  }

  // Distribution: prefer covering early / mid / late thirds if short
  if (picked.length > 0 && sorted.length > picked.length) {
    const maxGlobal = Math.max(...valid.map((v) => v.globalWordIndex), 1);
    const thirds = [
      { lo: 0, hi: maxGlobal * 0.33 },
      { lo: maxGlobal * 0.33, hi: maxGlobal * 0.66 },
      { lo: maxGlobal * 0.66, hi: maxGlobal + 1 },
    ];
    for (const band of thirds) {
      if (picked.length >= target) break;
      const has = picked.some(
        (p) => p.globalWordIndex >= band.lo && p.globalWordIndex < band.hi
      );
      if (has) continue;
      const cand = sorted.find(
        (c) =>
          c.globalWordIndex >= band.lo &&
          c.globalWordIndex < band.hi &&
          !picked.some(
            (p) => p.sentenceId === c.sentenceId && p.start === c.start
          )
      );
      if (cand) tryPick(cand, 2);
    }
  }

  // Do not pad with low-value easy words to hit target
  const selected = picked
    .filter((c) => {
      if (
        isSoftEasyWord(c.lemma) &&
        c.scores.centrality < 4 &&
        c.semanticRole !== "main_claim"
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (a.sentenceId !== b.sentenceId) {
        const order = options?.sentenceOrder;
        if (order) {
          const ia = order.indexOf(a.sentenceId);
          const ib = order.indexOf(b.sentenceId);
          if (ia >= 0 && ib >= 0 && ia !== ib) return ia - ib;
        }
        return a.sentenceId.localeCompare(b.sentenceId, undefined, {
          numeric: true,
        });
      }
      return a.start - b.start;
    });

  let shortfallReason: string | null = null;
  if (selected.length < target) {
    if (valid.length < target) {
      shortfallReason = "학습 가치 있는 핵심 어휘 후보 부족";
    } else if (hitSentenceCap) {
      shortfallReason = "문장별 최대 빈칸 제한 적용";
    } else if (hitGapCap) {
      shortfallReason = "인접 빈칸 방지 규칙 적용";
    } else {
      shortfallReason = "품질 기준을 충족하는 후보만 선정";
    }
  }

  return { selected, shortfallReason };
}
