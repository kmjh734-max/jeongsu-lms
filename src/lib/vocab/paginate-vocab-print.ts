export type VocabPrintMode =
  | "workbook"
  | "test"
  | "example-middle"
  | "example-high"
  | "companion";

export const VOCAB_PRINT_MODE_LABELS: Record<VocabPrintMode, string> = {
  workbook: "단어장 (단어·뜻)",
  test: "뜻 쓰기 (단어만)",
  "example-middle": "예문 (중등)",
  "example-high": "예문 (고등)",
  companion: "동반의어",
};

export function parseVocabPrintMode(raw: string | undefined): VocabPrintMode {
  if (
    raw === "test" ||
    raw === "example-middle" ||
    raw === "example-high" ||
    raw === "companion" ||
    raw === "example"
  ) {
    if (raw === "example") return "example-middle";
    return raw;
  }
  return "workbook";
}

export function modeNeedsEnrichment(mode: VocabPrintMode): boolean {
  return (
    mode === "example-middle" ||
    mode === "example-high" ||
    mode === "companion"
  );
}

export function itemsPerVocabPrintPage(mode: VocabPrintMode): number {
  switch (mode) {
    case "example-middle":
    case "example-high":
      return 14;
    case "companion":
      return 18;
    case "test":
      return 18;
    default:
      return 22;
  }
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
