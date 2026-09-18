import type { VocabPrintSize } from "@/lib/vocab/vocab-print-size";
import {
  vocabPrintRowsDelta,
  type VocabPrintFontScale,
  type VocabPrintLineSpacing,
} from "@/lib/vocab/vocab-print-layout";

export type VocabPrintMode = "workbook" | "exam" | "full";

export const VOCAB_PRINT_MODE_LABELS: Record<VocabPrintMode, string> = {
  workbook: "단어장 (단어·뜻)",
  exam: "시험지",
  full: "예문·동의어·반의어",
};

export function parseVocabPrintMode(raw: string | undefined): VocabPrintMode {
  if (
    raw === "exam" ||
    raw === "test" ||
    raw === "full" ||
    raw === "example" ||
    raw === "synonyms" ||
    raw === "antonyms" ||
    raw === "example-middle" ||
    raw === "example-high" ||
    raw === "companion"
  ) {
    if (
      raw === "example" ||
      raw === "synonyms" ||
      raw === "antonyms" ||
      raw === "example-middle" ||
      raw === "example-high" ||
      raw === "companion"
    ) {
      return "full";
    }
    if (raw === "test") return "exam";
    return raw;
  }
  return "workbook";
}

export function itemsPerVocabPrintPage(
  mode: VocabPrintMode,
  size: VocabPrintSize = "a4",
  font: VocabPrintFontScale = "md",
  spacing: VocabPrintLineSpacing = "normal"
): number {
  // 단어장은 한 줄짜리 표(한 쪽 20단어), 예문형은 칸이 커서 적게
  const delta = vocabPrintRowsDelta(font, spacing);
  if (mode === "full") {
    const base = size === "b5" ? 5 : 6;
    return Math.min(size === "b5" ? 8 : 10, Math.max(3, base + delta));
  }
  const base = size === "b5" ? 16 : 20;
  return Math.min(size === "b5" ? 22 : 26, Math.max(10, base + delta * 2));
}

export function tableHeadLabel(mode: VocabPrintMode): string {
  if (mode === "full") return "MEANING / EXAMPLE";
  return "MEANING";
}

/** 항상 perPage칸을 채워 동일 행 간격 유지 (빈 칸은 null) */
export function paginateVocabItems<T>(items: T[], perPage: number): (T | null)[][] {
  if (items.length === 0) {
    return [Array.from({ length: perPage }, () => null)];
  }
  const pages: (T | null)[][] = [];
  for (let i = 0; i < items.length; i += perPage) {
    const chunk: (T | null)[] = [...items.slice(i, i + perPage)];
    while (chunk.length < perPage) chunk.push(null);
    pages.push(chunk);
  }
  return pages;
}
