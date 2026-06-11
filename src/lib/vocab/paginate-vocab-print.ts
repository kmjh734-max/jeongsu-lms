export type VocabPrintMode = "workbook" | "example" | "test";

export function itemsPerVocabPrintPage(mode: VocabPrintMode): number {
  switch (mode) {
    case "example":
      return 14;
    case "test":
      return 18;
    default:
      return 22;
  }
}

export function paginateVocabItems<T>(items: T[], perPage: number): T[][] {
  if (items.length === 0) return [[]];
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += perPage) {
    pages.push(items.slice(i, i + perPage));
  }
  return pages;
}

export function parseVocabPrintMode(raw: string | undefined): VocabPrintMode {
  if (raw === "example" || raw === "test") return raw;
  return "workbook";
}
