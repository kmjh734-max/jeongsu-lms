import { createHash } from "node:crypto";
import type { GrammarBlueprintPoint } from "@/lib/lesson-materials/grammar-blueprint-types";
import { buildIncorrectForTarget } from "@/lib/lesson-materials/grammar-blueprint-contrast";
import { isBlockedLowQualityPair } from "@/lib/lesson-materials/grammar-choice-quality-block";
import { minimizeAndRelocateCandidate } from "@/lib/lesson-materials/grammar-choice-minimize";
import { findTokenSpan } from "@/lib/lesson-materials/grammar-choice-repair";
import { tokenizeForWordOrder } from "@/lib/lesson-materials/word-order-tokenize";
import type { GrammarChoiceCandidate } from "@/lib/lesson-materials/workbook-types";

/**
 * Convert a blueprint grammar point into a choice candidate.
 * correctText MUST come from targetText (never invented by AI).
 */
export function convertBlueprintPointToCandidate(input: {
  passageId: string;
  sentenceId: string;
  sentenceText: string;
  point: GrammarBlueprintPoint;
}): GrammarChoiceCandidate | null {
  const p = input.point;
  if (!p.convertibleToChoice || p.exclusionReason !== "NONE") return null;
  // Must-include or strong optional (worthiness >= 4)
  if (p.testWorthiness < 4) return null;

  const target = p.targetText.trim();
  if (!target) return null;
  if (
    p.targetStartCharIndex < 0 ||
    input.sentenceText.slice(p.targetStartCharIndex, p.targetEndCharIndex) !==
      target
  ) {
    const idx = input.sentenceText.indexOf(target);
    if (idx < 0) return null;
  }

  const pair = buildIncorrectForTarget(target, p.contrastType);
  if (!pair) return null;

  const blocked = isBlockedLowQualityPair(pair.correctText, pair.incorrectText);
  if (blocked.blocked) return null;

  const correct = pair.correctText;
  if (!input.sentenceText.includes(correct)) return null;

  const tokens = tokenizeForWordOrder(input.sentenceText).map((t) => t.surface);
  const found = findTokenSpan(tokens, correct);
  if (!found) return null;

  const raw: GrammarChoiceCandidate = {
    choiceId: `bp-${p.grammarPointId}`,
    passageId: input.passageId,
    sentenceId: input.sentenceId,
    startTokenIndex: found.start,
    endTokenIndex: found.end,
    originalText: found.text.replace(/[.,;:!?]+$/g, ""),
    correctText: found.text.replace(/[.,;:!?]+$/g, ""),
    incorrectText: pair.incorrectText,
    grammarCategoryId: p.grammarCategoryId,
    grammarCategoryName: p.grammarCategoryName,
    bookTerm: p.bookTerm,
    explanationKo: p.explanationKo || p.structure,
    incorrectReasonKo: `${pair.incorrectText}는 ${p.bookTerm} 구조에 맞지 않는다.`,
    difficulty: p.importance === "high" ? 4 : 3,
    learningValue: Math.min(5, Math.max(3, p.testWorthiness)) as 1 | 2 | 3 | 4 | 5,
    ambiguityRisk: "low",
    sourceType:
      p.analysisOrigin === "formal_report"
        ? "analysis_required"
        : "ai_supplement",
    analysisPointId: p.sourceAnalysisPointId || p.grammarPointId,
  };

  const minimized = minimizeAndRelocateCandidate(raw, input.sentenceText);
  if (!minimized) return null;

  const blocked2 = isBlockedLowQualityPair(
    minimized.correctText,
    minimized.incorrectText
  );
  if (blocked2.blocked) return null;

  if (!input.sentenceText.includes(minimized.correctText)) return null;

  return {
    ...minimized,
    sourceType: raw.sourceType,
    analysisPointId: raw.analysisPointId,
    bookTerm: p.bookTerm,
    grammarCategoryName: p.grammarCategoryName,
    explanationKo: raw.explanationKo,
    incorrectReasonKo: raw.incorrectReasonKo,
    choiceId: `bp-${createHash("sha1").update(p.grammarPointId).digest("hex").slice(0, 10)}`,
    learningValue: raw.learningValue,
    difficulty: raw.difficulty,
    ambiguityRisk: "low",
  };
}

/** Must-include: high importance + testWorthiness>=4 + convertible */
export function isMustIncludeBlueprintPoint(p: GrammarBlueprintPoint): boolean {
  return (
    p.convertibleToChoice &&
    p.importance === "high" &&
    p.testWorthiness >= 4 &&
    p.exclusionReason === "NONE"
  );
}
