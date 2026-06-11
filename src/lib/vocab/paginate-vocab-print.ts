import type { VocabPrintSize } from "@/lib/vocab/vocab-print-size";

export type VocabPrintMode = "workbook" | "test" | "full";

export const VOCAB_PRINT_MODE_LABELS: Record<VocabPrintMode, string> = {
  workbook: "단어장 (단어·뜻)",
  test: "뜻 쓰기 (단어만)",
  full: "예문·동의어·반의어",
};

export function parseVocabPrintMode(raw: string | undefined): VocabPrintMode {
  if (
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
    return raw;
  }
  return "workbook";
}

export function itemsPerVocabPrintPage(
  mode: VocabPrintMode,
  size: VocabPrintSize = "a4"
): number {
  const compact = size === "b5";
  switch (mode) {
    case "full":
      return compact ? 4 : 5;
    case "test":
      return compact ? 8 : 10;
    default:
      return compact ? 7 : 8;
  }
}

export function tableHeadLabel(mode: VocabPrintMode): string {
  if (mode === "test") return "뜻 쓰기";
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
