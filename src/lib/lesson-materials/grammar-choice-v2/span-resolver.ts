import type { ExactSentence } from "@/lib/lesson-materials/grammar-choice-v2/types";

function isWordChar(ch: string | undefined): boolean {
  if (!ch) return false;
  return /[A-Za-z0-9'’]/.test(ch);
}

export function findOccurrences(text: string, span: string): number[] {
  const needle = span.trim();
  if (!needle) return [];
  const hits: number[] = [];
  let from = 0;
  while (from <= text.length) {
    const at = text.indexOf(needle, from);
    if (at < 0) break;
    const end = at + needle.length;
    const leftOk = !isWordChar(text[at - 1]);
    const rightOk = !isWordChar(text[end]);
    if (leftOk && rightOk) hits.push(at);
    from = at + 1;
  }
  return hits;
}

export function resolveSpan(input: {
  sentence: ExactSentence;
  sourceSpan: string;
  occurrenceIndex: number;
}): { passageStart: number; passageEnd: number; resolvedText: string } | null {
  if (input.sentence.passageStart < 0) return null;
  const hits = findOccurrences(input.sentence.text, input.sourceSpan);
  const at = hits[input.occurrenceIndex];
  if (at == null) return null;
  const resolvedText = input.sentence.text.slice(at, at + input.sourceSpan.length);
  if (resolvedText !== input.sourceSpan) return null;
  return {
    passageStart: input.sentence.passageStart + at,
    passageEnd: input.sentence.passageStart + at + input.sourceSpan.length,
    resolvedText,
  };
}
