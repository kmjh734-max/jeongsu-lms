import { formatReviewWordParentLine } from "@/lib/reports/format-lines";
import type { ReviewWordRow } from "@/lib/reports/types";

export function parseReviewWordDisplay(word: ReviewWordRow): {
  word: string;
  meaning: string;
  reason: string;
} {
  const line = formatReviewWordParentLine(word).replace(/^- /, "");
  const [wordPart, reason = ""] = line.includes(": ")
    ? line.split(": ")
    : [line, ""];
  const [w, meaning = ""] = wordPart.includes(" / ")
    ? wordPart.split(" / ")
    : [wordPart, ""];
  return { word: w.trim(), meaning: meaning.trim(), reason: reason.trim() };
}
