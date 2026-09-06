import type { LessonPackVocabItem } from "@/lib/lesson-materials/generate-lesson-pack";
import {
  findExactWordOccurrences,
  isExcludedBlankWord,
  tokenizeWords,
} from "@/lib/lesson-materials/validate-workbook-blank";
import {
  computeBlankFinalScore,
  inferGradeFromScores,
  isSoftEasyWord,
  normalizeWordFamily,
  synthesizeScoresForLemma,
} from "@/lib/lesson-materials/blank-concept-score";
import type { BlankPartOfSpeech } from "@/lib/lesson-materials/workbook-types";

/**
 * Last-resort: pick content words from the passage itself (no OpenAI).
 * Prefer longer / less-common looking tokens; skip function words & easy fillers.
 */
export function buildHeuristicBlankCandidates(input: {
  sentences: Array<{ id: string; english: string }>;
  titleText?: string;
  maxCandidates?: number;
}): unknown[] {
  const max = input.maxCandidates ?? 24;
  const out: unknown[] = [];
  const usedLemma = new Set<string>();

  type Hit = {
    sentenceId: string;
    answerText: string;
    occurrenceIndex: number;
    lemma: string;
    score: number;
  };
  const hits: Hit[] = [];

  for (const s of input.sentences) {
    const tokens = tokenizeWords(s.english);
    for (const tok of tokens) {
      const lemma = tok.text.toLowerCase();
      if (usedLemma.has(lemma)) continue;
      if (isExcludedBlankWord(tok.text) || isSoftEasyWord(lemma)) continue;
      if (lemma.length < 4) continue;
      const occs = findExactWordOccurrences(s.english, tok.text);
      const occurrenceIndex = occs.findIndex(
        (h) => h.start === tok.start && h.end === tok.end
      );
      if (occurrenceIndex < 0) continue;
      let score = lemma.length;
      if (lemma.length >= 7) score += 3;
      if (input.titleText?.toLowerCase().includes(lemma)) score += 4;
      hits.push({
        sentenceId: s.id,
        answerText: tok.text,
        occurrenceIndex,
        lemma,
        score,
      });
      usedLemma.add(lemma);
    }
  }

  hits.sort((a, b) => b.score - a.score);

  for (let i = 0; i < hits.length && out.length < max; i++) {
    const h = hits[i]!;
    const scores = synthesizeScoresForLemma({
      lemma: h.lemma,
      partOfSpeech: "noun",
      titleText: input.titleText,
      semanticRole: "academic",
    });
    const grade = inferGradeFromScores(scores);
    if (grade === "C") continue;
    out.push({
      candidateId: `heur-${i + 1}`,
      sentenceId: h.sentenceId,
      answerText: h.answerText,
      occurrenceIndex: h.occurrenceIndex,
      lemma: h.lemma,
      wordFamily: normalizeWordFamily(h.lemma),
      partOfSpeech: "noun" as BlankPartOfSpeech,
      meaningKo: h.lemma,
      grade,
      semanticRole: "academic",
      competitionGroup: null,
      scores,
      reasonKo: "지문 내용어 폴백",
      priority: 3,
    });
  }

  return out;
}

export function buildBlankCandidatesFromVocab(input: {
  sentences: Array<{ id: string; english: string }>;
  vocab: LessonPackVocabItem[];
  titleText?: string;
  maxCandidates?: number;
}): unknown[] {
  const max = input.maxCandidates ?? 24;
  const vocabLemmas = new Set(
    input.vocab.map((v) => v.word.toLowerCase().trim()).filter(Boolean)
  );
  const out: unknown[] = [];
  const usedLemma = new Set<string>();

  type Hit = {
    sentenceId: string;
    answerText: string;
    occurrenceIndex: number;
    lemma: string;
    partOfSpeech: BlankPartOfSpeech;
    meaningKo: string;
  };
  const hits: Hit[] = [];

  for (const v of input.vocab) {
    const lemma = v.word.trim().toLowerCase();
    if (!lemma || usedLemma.has(lemma) || isExcludedBlankWord(lemma)) continue;
    const meaning = v.meaning.trim();
    const posMatch = /^(n|v|a|ad|adj|adv|명|동|형|부)\.?/i.exec(meaning);
    const pos: BlankPartOfSpeech = /^ad|^adv|^부/i.test(posMatch?.[1] ?? "")
      ? "adverb"
      : /^a|^adj|^형/i.test(posMatch?.[1] ?? "")
        ? "adjective"
        : /^v|^동/i.test(posMatch?.[1] ?? "")
          ? "verb"
          : "noun";
    const meaningKo =
      meaning.replace(/^(n|v|a|ad|adj|adv|명|동|형|부)\.?\s*/i, "").trim() ||
      lemma;

    for (const s of input.sentences) {
      const tokens = tokenizeWords(s.english);
      for (const tok of tokens) {
        const lower = tok.text.toLowerCase();
        const match =
          lower === lemma ||
          (lemma.length >= 4 &&
            (lower.startsWith(lemma) ||
              lemma.startsWith(lower.replace(/(?:ing|ed|es|s)$/, ""))));
        if (!match) continue;
        const occs = findExactWordOccurrences(s.english, tok.text);
        const occurrenceIndex = occs.findIndex(
          (h) => h.start === tok.start && h.end === tok.end
        );
        if (occurrenceIndex < 0) continue;
        hits.push({
          sentenceId: s.id,
          answerText: tok.text,
          occurrenceIndex,
          lemma,
          partOfSpeech: pos,
          meaningKo,
        });
        usedLemma.add(lemma);
        break;
      }
      if (usedLemma.has(lemma)) break;
    }
  }

  const ranked = hits
    .map((h) => {
      const scores = synthesizeScoresForLemma({
        lemma: h.lemma,
        partOfSpeech: h.partOfSpeech,
        vocabLemmas,
        titleText: input.titleText,
      });
      return { h, scores };
    })
    .sort((a, b) => computeBlankFinalScore(b.scores) - computeBlankFinalScore(a.scores));

  for (let i = 0; i < ranked.length && out.length < max; i++) {
    const { h, scores } = ranked[i]!;
    const grade = inferGradeFromScores(scores);
    if (grade === "C") continue;
    out.push({
      candidateId: `vocab-${i + 1}`,
      id: `vocab-${i + 1}`,
      sentenceId: h.sentenceId,
      answerText: h.answerText,
      occurrenceIndex: h.occurrenceIndex,
      lemma: h.lemma,
      wordFamily: normalizeWordFamily(h.lemma),
      partOfSpeech: h.partOfSpeech,
      meaningKo: h.meaningKo,
      grade,
      semanticRole: "academic",
      competitionGroup: null,
      scores,
      reasonKo: "수업용자료 핵심 어휘(폴백)",
      selectionReasonKo: "수업용자료 핵심 어휘(폴백)",
      priority: 4,
    });
  }

  return out;
}
