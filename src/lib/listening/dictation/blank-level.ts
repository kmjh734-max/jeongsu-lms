import type { DictationBlankLevel } from "@/lib/listening/dictation/types";

export function blankCountRange(
  level: DictationBlankLevel,
  sentenceCount: number
): { min: number; max: number } {
  switch (level) {
    case "few":
      return { min: 2, max: Math.min(4, Math.max(2, sentenceCount)) };
    case "normal":
      return { min: 4, max: Math.min(5, Math.max(3, sentenceCount)) };
    case "many":
      return { min: 5, max: Math.min(6, Math.max(4, sentenceCount)) };
    default:
      if (sentenceCount <= 2) return { min: 2, max: 4 };
      if (sentenceCount <= 4) return { min: 3, max: 5 };
      return { min: 3, max: 6 };
  }
}
