export type VocabPrintSize = "a4" | "b5";

export const VOCAB_PRINT_SIZE_LABELS: Record<VocabPrintSize, string> = {
  a4: "A4",
  b5: "B5 (JIS)",
};

export function parseVocabPrintSize(raw: string | undefined): VocabPrintSize {
  return raw === "b5" ? "b5" : "a4";
}

/** B5 = JIS B5 (182×257mm) — Chrome 인쇄 용지와 동일 */
export const VOCAB_PRINT_PAGE_DIMENSIONS: Record<
  VocabPrintSize,
  { width: string; height: string }
> = {
  a4: { width: "210mm", height: "297mm" },
  b5: { width: "182mm", height: "257mm" },
};
