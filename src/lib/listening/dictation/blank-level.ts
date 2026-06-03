import type { DictationBlankLevel } from "@/lib/listening/dictation/types";

/** M/W 문장 수 — 문장마다 최소 1빈칸 기준으로 min/max 산정 */
export function blankCountRange(
  level: DictationBlankLevel,
  sentenceCount: number
): { min: number; max: number } {
  const lines = Math.max(1, sentenceCount);
  const min = lines;
  let extra: number;
  switch (level) {
    case "few":
      extra = 1;
      break;
    case "many":
      extra = 3;
      break;
    case "normal":
      extra = 2;
      break;
    default:
      extra = 2;
  }
  return {
    min,
    max: Math.min(lines + extra, Math.max(min, lines * 2)),
  };
}
