import { findOccurrences } from "@/lib/lesson-materials/grammar-choice-v2/span-resolver";
import type {
  ExactSentence,
  GrammarPointCode,
  LocalMandatoryHint,
} from "@/lib/lesson-materials/grammar-choice-v2/types";

function push(
  hints: LocalMandatoryHint[],
  sentence: ExactSentence,
  pointCode: GrammarPointCode,
  sourceSpan: string
) {
  const hits = findOccurrences(sentence.text, sourceSpan);
  hints.push({
    sentenceId: sentence.sentenceId,
    pointCode,
    sourceSpan,
    occurrenceIndex: Math.max(0, hits.indexOf(sentence.text.indexOf(sourceSpan))),
  });
}

/** Fail-closed hints: conditionals and clear inversion only. */
export function scanLocalMandatory(
  sentences: ExactSentence[]
): LocalMandatoryHint[] {
  const hints: LocalMandatoryHint[] = [];
  for (const sentence of sentences) {
    const text = sentence.text;
    if (/\bif\b/i.test(text) && /\b(had|were)\b/i.test(text) && /\b(would|could|might)\b/i.test(text)) {
      const had = text.match(/\bif\b[^.]{0,80}\bhad\b/i);
      if (had) push(hints, sentence, "CONDITIONAL_SECOND", had[0]);
      const were = text.match(/\bif\s+there\s+were\b/i);
      if (were) push(hints, sentence, "CONDITIONAL_SECOND", were[0]);
    }
    if (/\bif\b/i.test(text) && /\bhad\s+\w+(?:ed|en)\b/i.test(text) && /\bwould\s+have\b/i.test(text)) {
      const third = text.match(/\bif\b[^.]{0,40}\bhad\s+\w+/i);
      if (third) push(hints, sentence, "CONDITIONAL_THIRD", third[0]);
    }
    if (/^Were\s+\w+/.test(text)) push(hints, sentence, "CONDITIONAL_INVERTED_WERE", text.match(/^Were\s+\w+/)![0]);
    if (/^Had\s+\w+/.test(text)) push(hints, sentence, "CONDITIONAL_INVERTED_HAD", text.match(/^Had\s+\w+\s+\w+/)![0]);
    if (/\bOnly\s+(?:then|after|when|by)\b/.test(text)) {
      const only = text.match(/\bOnly\s+(?:then|after|when|by)\b/)!;
      push(hints, sentence, "INVERSION_ONLY", only[0]);
    }
    if (/\b(?:Never|Rarely|Hardly)\b/.test(text) && /\b(?:have|has|had|did|do|does)\b/.test(text)) {
      const neg = text.match(/\b(?:Never|Rarely|Hardly)\b/)!;
      push(hints, sentence, "INVERSION_NEGATIVE", neg[0]);
    }
  }
  const seen = new Set<string>();
  return hints.filter((h) => {
    const key = `${h.sentenceId}|${h.pointCode}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
