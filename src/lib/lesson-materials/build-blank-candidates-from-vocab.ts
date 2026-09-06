import type { LessonPackVocabItem } from "@/lib/lesson-materials/generate-lesson-pack";
import {
  findExactWordOccurrences,
  isExcludedBlankWord,
  tokenizeWords,
} from "@/lib/lesson-materials/validate-workbook-blank";
import {
  normalizeWordFamily,
  synthesizeScoresForLemma,
} from "@/lib/lesson-materials/blank-concept-score";
import type { BlankPartOfSpeech } from "@/lib/lesson-materials/workbook-types";

function parsePosFromMeaning(meaning: string): BlankPartOfSpeech {
  const m = meaning.trim().toLowerCase();
  if (/^ad\b|^adv\b|^부/.test(m)) return "adverb";
  if (/^a\b|^adj\b|^형/.test(m)) return "adjective";
  if (/^v\b|^동/.test(m)) return "verb";
  if (/^n\b|^명/.test(m)) return "noun";
  return "noun";
}

function meaningKoOnly(meaning: string): string {
  return (
    meaning.replace(/^(n|v|a|ad|adj|adv|명|동|형|부)\.?\s*/i, "").trim() ||
    meaning.trim()
  );
}

/**
 * Locate vocab lemmas in passage — fallback only when OpenAI fails.
 * Emits score fields so v3 selection can rank them.
 */
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
    const pos = parsePosFromMeaning(v.meaning);
    const meaningKo = meaningKoOnly(v.meaning);
    if (!meaningKo) continue;

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
    .sort((a, b) => {
      const fa =
        a.scores.centrality * 4 +
        a.scores.learningValue * 3 -
        a.scores.commonnessPenalty * 3;
      const fb =
        b.scores.centrality * 4 +
        b.scores.learningValue * 3 -
        b.scores.commonnessPenalty * 3;
      return fb - fa;
    });

  for (let i = 0; i < ranked.length && out.length < max; i++) {
    const { h, scores } = ranked[i]!;
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
