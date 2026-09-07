import type {
  GrammarBlueprintPoint,
  GrammarBlueprintSentence,
} from "@/lib/lesson-materials/grammar-blueprint-types";

function spansOverlap(
  a: { start: number; end: number },
  b: { start: number; end: number }
): boolean {
  return !(a.end <= b.start || b.end <= a.start);
}

/**
 * Formal report points win over internal AI on same sentence + overlapping span + same category.
 * AI only supplements missing points.
 */
export function mergeBlueprintSentences(
  formal: GrammarBlueprintSentence[],
  aiSupplement: GrammarBlueprintSentence[]
): GrammarBlueprintSentence[] {
  const aiById = new Map(aiSupplement.map((s) => [s.sentenceId, s] as const));

  return formal.map((fs) => {
    const ai = aiById.get(fs.sentenceId);
    if (!ai) return fs;

    // If formal has no points at all for this sentence, take AI analysis wholesale
    // but keep formal char indices / originalText
    if (fs.grammarPoints.length === 0 && ai.grammarPoints.length > 0) {
      return {
        ...fs,
        structureSummary: fs.structureSummary || ai.structureSummary,
        sentencePattern: fs.sentencePattern || ai.sentencePattern,
        hasGrammarPoints: ai.hasGrammarPoints,
        hasTestableGrammarPoint: ai.hasTestableGrammarPoint,
        noTestablePointReason: ai.noTestablePointReason,
        grammarPoints: ai.grammarPoints,
      };
    }

    const merged: GrammarBlueprintPoint[] = [...fs.grammarPoints];
    for (const ap of ai.grammarPoints) {
      const dup = merged.some(
        (fp) =>
          fp.grammarCategoryId === ap.grammarCategoryId &&
          fp.targetStartCharIndex >= 0 &&
          ap.targetStartCharIndex >= 0 &&
          spansOverlap(
            {
              start: fp.targetStartCharIndex,
              end: fp.targetEndCharIndex,
            },
            {
              start: ap.targetStartCharIndex,
              end: ap.targetEndCharIndex,
            }
          )
      );
      if (dup) continue;
      // also skip same target text
      if (
        merged.some(
          (fp) =>
            fp.targetText.toLowerCase() === ap.targetText.toLowerCase()
        )
      ) {
        continue;
      }
      merged.push(ap);
    }

    const testable = merged.filter((p) => p.convertibleToChoice);
    return {
      ...fs,
      structureSummary: fs.structureSummary || ai.structureSummary,
      sentencePattern: fs.sentencePattern || ai.sentencePattern,
      hasGrammarPoints: merged.length > 0,
      hasTestableGrammarPoint: testable.length > 0,
      noTestablePointReason:
        testable.length > 0
          ? "NONE"
          : fs.noTestablePointReason !== "NONE"
            ? fs.noTestablePointReason
            : ai.noTestablePointReason,
      grammarPoints: merged,
    };
  });
}
