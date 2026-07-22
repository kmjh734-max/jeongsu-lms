import type { ReactNode } from "react";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Stem for matching inflections (occasion/occasions, mature/matured, circumstance/circumstances). */
function inflectionStem(word: string): string {
  const w = word.toLowerCase().trim();
  if (w.length < 4) return w;
  const stripped = w.replace(/(?:ies|ied|ing|ers|est|es|ed|s|e)$/i, "");
  return stripped.length >= 3 ? stripped : w;
}

/**
 * 예문(여러 줄·복수형 포함) 안의 단어를 모두 강조.
 * 기존처럼 첫 번째 일치만 칠하면 2번 예문·복수형(circumstances 등)이 빠짐.
 */
export function highlightWordInSentence(
  sentence: string,
  word: string
): ReactNode {
  const trimmed = word.trim();
  if (!trimmed || !sentence) return sentence;

  const stem = inflectionStem(trimmed);
  const re = new RegExp(`\\b${escapeRegExp(stem)}[a-zA-Z']*`, "gi");

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = re.exec(sentence)) !== null) {
    const start = match.index;
    const matched = match[0];
    if (start > lastIndex) {
      nodes.push(sentence.slice(lastIndex, start));
    }
    nodes.push(
      <mark key={`h-${key++}`} className="vocab-print-highlight">
        {matched}
      </mark>
    );
    lastIndex = start + matched.length;
    // Avoid zero-length loops
    if (matched.length === 0) re.lastIndex += 1;
  }

  if (lastIndex === 0) return sentence;
  if (lastIndex < sentence.length) {
    nodes.push(sentence.slice(lastIndex));
  }
  return <>{nodes}</>;
}
