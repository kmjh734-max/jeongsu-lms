import type { LessonPackVocabItem } from "@/lib/lesson-materials/generate-lesson-pack";
import {
  findExactWordOccurrences,
  isExcludedBlankWord,
  tokenizeWords,
} from "@/lib/lesson-materials/validate-workbook-blank";
import { computeConceptScore } from "@/lib/lesson-materials/blank-concept-score";
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
  return meaning
    .replace(/^(n|v|a|ad|adj|adv|명|동|형|부)\.?\s*/i, "")
    .trim() || meaning.trim();
}

/**
 * Locate vocab lemmas (and close surface forms) in passage sentences.
 * Pure code path — no OpenAI.
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
    priority: number;
    conceptScore: number;
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
        const priority = 5;
        const conceptScore = computeConceptScore({
          lemma,
          partOfSpeech: pos,
          priority,
          vocabLemmas,
          titleText: input.titleText,
        });
        hits.push({
          sentenceId: s.id,
          answerText: tok.text,
          occurrenceIndex,
          lemma,
          partOfSpeech: pos,
          meaningKo,
          priority,
          conceptScore,
        });
        usedLemma.add(lemma);
        break;
      }
      if (usedLemma.has(lemma)) break;
    }
  }

  hits.sort((a, b) => b.conceptScore - a.conceptScore || b.priority - a.priority);

  for (let i = 0; i < hits.length && out.length < max; i++) {
    const h = hits[i]!;
    out.push({
      id: `vocab-${i + 1}`,
      sentenceId: h.sentenceId,
      answerText: h.answerText,
      occurrenceIndex: h.occurrenceIndex,
      lemma: h.lemma,
      partOfSpeech: h.partOfSpeech,
      meaningKo: h.meaningKo,
      selectionReasonKo: "수업용자료 핵심 어휘",
      priority: h.priority,
    });
  }

  return out;
}
