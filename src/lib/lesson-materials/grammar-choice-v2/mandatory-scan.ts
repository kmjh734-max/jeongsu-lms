import { detectConditionalCh05 } from "@/lib/lesson-materials/grammar-choice-v2/conditional-ch05";
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
    for (const hit of detectConditionalCh05(text)) {
      if (hit.exclusionReason) continue;
      push(hints, sentence, hit.code, hit.sourceSpan);
    }
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
    const key = `${h.sentenceId}|${h.pointCode}|${h.sourceSpan.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
