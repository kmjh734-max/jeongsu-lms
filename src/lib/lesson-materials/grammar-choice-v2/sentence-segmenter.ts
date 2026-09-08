import type { ExactSentence } from "@/lib/lesson-materials/grammar-choice-v2/types";
import { joinWorkbookPassageLines } from "@/lib/lesson-materials/workbook-types";

function splitLoose(text: string): string[] {
  const parts = text
    .split(/(?<=[.!?])\s+(?=[A-Z“"'])/g)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [text.trim()].filter(Boolean);
}

export function segmentPassage(
  sourcePassage: string,
  given?: Array<{ id: string; english: string }>
): ExactSentence[] {
  const source = sourcePassage;
  if (given && given.length > 0) {
    const out: ExactSentence[] = [];
    let cursor = 0;
    for (const row of given) {
      const text = row.english.trim();
      if (!text) continue;
      let start = source.indexOf(text, cursor);
      if (start < 0) start = source.indexOf(text);
      if (start < 0) {
        out.push({
          sentenceId: row.id,
          text,
          passageStart: -1,
          passageEnd: -1,
        });
        continue;
      }
      out.push({
        sentenceId: row.id,
        text: source.slice(start, start + text.length),
        passageStart: start,
        passageEnd: start + text.length,
      });
      cursor = start + text.length;
    }
    return out;
  }

  const chunks = splitLoose(source);
  const out: ExactSentence[] = [];
  let cursor = 0;
  chunks.forEach((chunk, i) => {
    const start = source.indexOf(chunk, cursor);
    const passageStart = start >= 0 ? start : cursor;
    out.push({
      sentenceId: `s${i + 1}`,
      text: chunk,
      passageStart,
      passageEnd: passageStart + chunk.length,
    });
    cursor = passageStart + chunk.length;
  });
  return out;
}

export function joinSourceLines(lines: string[]): string {
  return joinWorkbookPassageLines(lines.filter((l) => l.trim()));
}
