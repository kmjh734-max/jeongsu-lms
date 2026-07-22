/**
 * Multiple example sentences are stored in the existing text columns as
 * numbered lines (1. … / 2. …). Learning/blank activities use the first line.
 */

export type ExamplePair = {
  example_sentence: string;
  example_meaning: string;
};

export function stripExampleNumberPrefix(line: string): string {
  return line.trim().replace(/^\d+[\.\)]\s*/, "").trim();
}

/** First English example line (for blank / quiz). */
export function pickPrimaryExampleSentence(
  raw: string | null | undefined
): string {
  const t = (raw ?? "").trim();
  if (!t) return "";
  const first =
    t
      .split(/\r?\n/)
      .map((s) => s.trim())
      .find(Boolean) ?? "";
  return stripExampleNumberPrefix(first);
}

export function pickPrimaryExampleMeaning(
  raw: string | null | undefined
): string {
  return pickPrimaryExampleSentence(raw);
}

/** Join AI-generated pairs into DB text fields. */
export function joinExamplePairs(pairs: ExamplePair[]): ExamplePair {
  const cleaned = pairs
    .map((p) => ({
      example_sentence: p.example_sentence?.trim() ?? "",
      example_meaning: p.example_meaning?.trim() ?? "",
    }))
    .filter((p) => p.example_sentence);

  if (cleaned.length === 0) {
    return { example_sentence: "", example_meaning: "" };
  }
  if (cleaned.length === 1) {
    return cleaned[0]!;
  }

  return {
    example_sentence: cleaned
      .map((p, i) => `${i + 1}. ${p.example_sentence}`)
      .join("\n"),
    example_meaning: cleaned
      .map((p, i) => `${i + 1}. ${p.example_meaning || "(번역 없음)"}`)
      .join("\n"),
  };
}
