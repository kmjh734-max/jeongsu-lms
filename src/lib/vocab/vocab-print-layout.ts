/** 단어장/예문 인쇄용 글자·줄간격 (시험지는 exam_spacing 별도) */

export type VocabPrintFontScale = "sm" | "md" | "lg";
export type VocabPrintLineSpacing = "tight" | "normal" | "relaxed";

export const VOCAB_PRINT_FONT_LABELS: Record<VocabPrintFontScale, string> = {
  sm: "작게",
  md: "보통",
  lg: "크게",
};

export const VOCAB_PRINT_SPACING_LABELS: Record<VocabPrintLineSpacing, string> = {
  tight: "좁게",
  normal: "보통",
  relaxed: "넓게",
};

export function parseVocabPrintFontScale(
  raw: string | undefined | null
): VocabPrintFontScale {
  if (raw === "sm" || raw === "lg") return raw;
  return "md";
}

export function parseVocabPrintLineSpacing(
  raw: string | undefined | null
): VocabPrintLineSpacing {
  if (raw === "tight" || raw === "relaxed") return raw;
  return "normal";
}

/** 제본용 왼쪽 여백 — 기본 ON (bind=0 이면 OFF) */
export function parseVocabPrintBinding(
  raw: string | undefined | null
): boolean {
  if (raw == null || raw === "") return true;
  return raw === "1" || raw === "true";
}

/** 글자·줄간격에 따른 페이지당 행 수 보정 */
export function vocabPrintRowsDelta(
  font: VocabPrintFontScale,
  spacing: VocabPrintLineSpacing
): number {
  const fontDelta = font === "sm" ? 2 : font === "lg" ? -1 : 0;
  const spacingDelta =
    spacing === "tight" ? 2 : spacing === "relaxed" ? -1 : 0;
  return fontDelta + spacingDelta;
}
