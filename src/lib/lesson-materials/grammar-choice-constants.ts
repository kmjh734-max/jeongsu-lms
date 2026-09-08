export const GRAMMAR_BLUEPRINT_VERSION =
  "grammar-blueprint-v1-complete-sentence";

/** @deprecated legacy — not used by v5 pipeline */
export const GRAMMAR_CHOICE_PROMPT_VERSION_LEGACY =
  "grammar-choice-v4-blueprint-first";

export const GRAMMAR_CHOICE_GENERATOR_VERSION =
  "grammar-choice-generator-v8";
export const GRAMMAR_CHOICE_REVIEWER_VERSION =
  "grammar-choice-reviewer-v4";
/** Prompt/pipeline revision — invalidates final-item cache */
export const GRAMMAR_CHOICE_PIPELINE_REVISION = "grammar-points";

/** Active algorithm version stamped on workbook sections / final cache */
export const GRAMMAR_CHOICE_PROMPT_VERSION =
  `${GRAMMAR_CHOICE_GENERATOR_VERSION}+${GRAMMAR_CHOICE_REVIEWER_VERSION}+${GRAMMAR_CHOICE_PIPELINE_REVISION}`;

export const GRAMMAR_ANALYSIS_VERSION_NONE = "no-analysis";

export const CIRCLED_NUMBERS = [
  "①",
  "②",
  "③",
  "④",
  "⑤",
  "⑥",
  "⑦",
  "⑧",
  "⑨",
  "⑩",
  "⑪",
  "⑫",
  "⑬",
  "⑭",
  "⑮",
  "⑯",
  "⑰",
  "⑱",
  "⑲",
  "⑳",
] as const;

export function circledNumber(n: number): string {
  if (n >= 1 && n <= CIRCLED_NUMBERS.length) {
    return CIRCLED_NUMBERS[n - 1]!;
  }
  return `(${n})`;
}
