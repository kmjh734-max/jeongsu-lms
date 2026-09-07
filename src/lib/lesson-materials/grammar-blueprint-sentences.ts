import { createHash } from "node:crypto";
import {
  formatWorkbookPassage,
  joinWorkbookPassageLines,
} from "@/lib/lesson-materials/workbook-types";
import type { PassageSentenceSpan } from "@/lib/lesson-materials/grammar-blueprint-types";

/**
 * Build sentence spans from lesson-material items without rewriting text.
 * sourcePassage = joinWorkbookPassageLines(formatted sentences).
 */
export function buildPassageSentenceSpans(
  sentences: Array<{ id: string; english: string }>
): { sourcePassage: string; spans: PassageSentenceSpan[] } {
  const formatted = sentences.map((s) => ({
    id: s.id,
    english: formatWorkbookPassage(s.english),
  }));
  const sourcePassage = joinWorkbookPassageLines(
    formatted.map((s) => s.english)
  );
  const spans: PassageSentenceSpan[] = [];
  let cursor = 0;
  for (let i = 0; i < formatted.length; i++) {
    const row = formatted[i]!;
    const text = row.english;
    if (!text) {
      spans.push({
        sentenceId: row.id,
        sentenceIndex: i,
        originalText: "",
        startCharIndex: cursor,
        endCharIndex: cursor,
      });
      continue;
    }
    let idx = sourcePassage.indexOf(text, cursor);
    if (idx < 0) {
      idx = sourcePassage.indexOf(text);
    }
    if (idx < 0) {
      // Should not happen if join is consistent; fall back to cursor append length
      idx = cursor;
    }
    const start = idx;
    const end = idx + text.length;
    if (sourcePassage.slice(start, end) !== text) {
      throw new Error(
        `문장 원문 슬라이스 불일치: sentenceId=${row.id}`
      );
    }
    spans.push({
      sentenceId: row.id,
      sentenceIndex: i,
      originalText: text,
      startCharIndex: start,
      endCharIndex: end,
    });
    cursor = end;
  }

  // Reconstruct: join originalTexts with single spaces matching joinWorkbookPassageLines
  const reconstructed = joinWorkbookPassageLines(
    spans.map((s) => s.originalText)
  );
  if (reconstructed !== sourcePassage) {
    throw new Error("문장 재결합 결과가 원문과 일치하지 않습니다.");
  }

  return { sourcePassage, spans };
}

export function hashSourcePassage(sourcePassage: string): string {
  return createHash("sha256").update(sourcePassage).digest("hex").slice(0, 16);
}

export function findTargetInSentence(
  sentenceText: string,
  targetText: string,
  preferFrom = 0
): { start: number; end: number; text: string } | null {
  const needle = targetText.trim();
  if (!needle || !sentenceText) return null;
  let idx = sentenceText.indexOf(needle, preferFrom);
  if (idx < 0) idx = sentenceText.indexOf(needle);
  if (idx < 0) {
    // try last N tokens
    const parts = needle.split(/\s+/).filter(Boolean);
    for (let n = Math.min(4, parts.length); n >= 1; n--) {
      const sub = parts.slice(-n).join(" ");
      idx = sentenceText.indexOf(sub, preferFrom);
      if (idx < 0) idx = sentenceText.indexOf(sub);
      if (idx >= 0) {
        return {
          start: idx,
          end: idx + sub.length,
          text: sentenceText.slice(idx, idx + sub.length),
        };
      }
    }
    return null;
  }
  return {
    start: idx,
    end: idx + needle.length,
    text: sentenceText.slice(idx, idx + needle.length),
  };
}
