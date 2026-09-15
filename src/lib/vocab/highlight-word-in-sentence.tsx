import type { ReactNode } from "react";
import { findWordFormRanges } from "@/lib/vocab/word-form-match";

/**
 * 예문(여러 줄·복수형 포함) 안의 단어를 모두 강조.
 * 단어 경계를 지키고 흔한 변화형만 칠한다(state → states O, statistics X).
 */
export function highlightWordInSentence(
  sentence: string,
  word: string
): ReactNode {
  const trimmed = word.trim();
  if (!trimmed || !sentence) return sentence;

  const ranges = findWordFormRanges(sentence, trimmed);
  if (ranges.length === 0) return sentence;

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  ranges.forEach((r, key) => {
    if (r.start > lastIndex) nodes.push(sentence.slice(lastIndex, r.start));
    nodes.push(
      <mark key={`h-${key}`} className="vocab-print-highlight">
        {sentence.slice(r.start, r.end)}
      </mark>
    );
    lastIndex = r.end;
  });
  if (lastIndex < sentence.length) nodes.push(sentence.slice(lastIndex));
  return <>{nodes}</>;
}
