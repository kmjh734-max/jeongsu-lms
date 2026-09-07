import { createHash } from "node:crypto";
import type { ExtractedAnalysisPoint } from "@/lib/lesson-materials/grammar-choice-analysis-extract";
import { locateAnalysisTargetSpan } from "@/lib/lesson-materials/grammar-choice-analysis-extract";
import type { GrammarChoiceCandidate } from "@/lib/lesson-materials/workbook-types";
import { tokenizeForWordOrder } from "@/lib/lesson-materials/word-order-tokenize";
import { findTokenSpan } from "@/lib/lesson-materials/grammar-choice-repair";
import {
  minimizeAndRelocateCandidate,
  minimizeChoicePair,
  findCharSpanInSource,
} from "@/lib/lesson-materials/grammar-choice-minimize";

/**
 * Prefer a short, testable span inside the analysis example based on grammar title.
 */
function preferTestSpan(
  sentenceText: string,
  targetExpression: string,
  title: string,
  bookTerm: string
): { start: number; end: number; text: string } | null {
  const hay = `${title} ${bookTerm}`.toLowerCase();
  const target = targetExpression.trim();

  // Always prefer the analysis example itself when it appears in the sentence
  if (target) {
    const direct = findCharSpanInSource(sentenceText, target, 0);
    if (direct) {
      // For repeated "what …", prefer last match when example is "what you want"
      if (/what you want/i.test(target)) {
        const last = sentenceText.toLowerCase().lastIndexOf(target.toLowerCase());
        if (last >= 0) {
          return {
            start: last,
            end: last + target.length,
            text: sentenceText.slice(last, last + target.length),
          };
        }
      }
      return direct;
    }
    const parts = target.split(/\s+/).filter(Boolean);
    for (let n = Math.min(4, parts.length); n >= 1; n--) {
      const sub = parts.slice(-n).join(" ");
      const hit = findCharSpanInSource(sentenceText, sub, 0);
      if (hit) return hit;
    }
  }

  const tryNeedles = (needles: string[]) => {
    for (const n of needles) {
      const anywhere = findCharSpanInSource(sentenceText, n, 0);
      if (anywhere) return anywhere;
    }
    return null;
  };

  if (/관계대명사|관계부사|관계사|계속적/.test(hay) && !/what/.test(hay)) {
    const hit = tryNeedles(["which", "that", "who", "whom", "whose"]);
    if (hit) return hit;
  }
  if (/what|선행사.*포함|복합관계/.test(hay)) {
    const hit = tryNeedles(["what you want", "what", "whatever"]);
    if (hit) return hit;
  }
  if (/간접의문|의문사/.test(hay)) {
    const hit = tryNeedles([
      "what limiting beliefs",
      "how to socialize",
      "how to",
      "what",
      "how",
    ]);
    if (hit) return hit;
  }
  if (/동명사|전치사.*동명사|gerund/.test(hay)) {
    const hit = tryNeedles(["focusing", "moving", "attracting"]);
    if (hit) return hit;
  }
  if (/allow O|meant to|made to|to부정사|목적격보어/.test(hay)) {
    const hit = tryNeedles([
      "to participate",
      "to socialize",
      "to have",
      "to live",
      "to move",
      "to manifest",
    ]);
    if (hit) return hit;
  }
  if (/help O|병렬/.test(hay)) {
    const hit = tryNeedles(["learn", "communicate", "create", "become"]);
    if (hit) return hit;
  }
  if (/수동|진행형.*수동|능동/.test(hay)) {
    const hit = tryNeedles(["are being held", "being held"]);
    if (hit) return hit;
  }
  if (/수\s*일치|agreement/.test(hay)) {
    const hit = tryNeedles(["contradict", "contradicts", "states"]);
    if (hit) return hit;
  }
  if (/가주어|진주어|형식주어/.test(hay)) {
    const hit = tryNeedles(["It"]);
    if (hit) return hit;
  }
  if (/유사분열|pseudo/.test(hay)) {
    const hit = tryNeedles(["think", "visualize"]);
    if (hit) return hit;
  }

  return null;
}

function guessIncorrect(
  correct: string,
  title: string,
  bookTerm: string
): string | null {
  const hay = `${title} ${bookTerm}`.toLowerCase();
  const c = correct.trim();

  if (/^which$/i.test(c) && /관계|계속/.test(hay)) return "that";
  if (/^that$/i.test(c) && /관계|what|선행사/.test(hay)) return "what";
  if (/^what$/i.test(c) && /관계|간접|what/.test(hay)) return "which";
  if (/^what you want$/i.test(c)) return "which you want";
  if (/^who$/i.test(c)) return "which";
  if (/^whom$/i.test(c)) return "who";
  if (/^states$/i.test(c)) return "state";
  if (/^which states$/i.test(c)) return "which state";
  if (/^focusing$/i.test(c)) return "focused";
  if (/^moving$/i.test(c)) return "move";
  if (/^attracting$/i.test(c)) return "attracted";
  if (/^contradict$/i.test(c)) return "contradicts";
  if (/^contradicts$/i.test(c)) return "contradict";
  if (/^attracts$/i.test(c)) return "attract";
  if (/^are being held$/i.test(c)) return "are holding";
  if (/^being held$/i.test(c)) return "holding";
  if (/^to participate$/i.test(c)) return "participating";
  if (/^to socialize$/i.test(c)) return "socializing";
  if (/^how to socialize$/i.test(c)) return "how socializing";
  if (/^to have$/i.test(c)) return "having";
  if (/^to live$/i.test(c)) return "living";
  if (/^to move$/i.test(c)) return "moving";
  if (/^to manifest$/i.test(c)) return "manifesting";
  if (/^visualize$/i.test(c)) return "visualizing";
  if (/^think$/i.test(c) && /유사분열|보어/.test(hay)) return "thinking";
  if (/^learn$/i.test(c) && /help|병렬|원형/.test(hay)) return "to learn";
  if (/^were made$/i.test(c)) return "made";
  if (/^are meant$/i.test(c)) return "are meaning";
  if (/^were never meant$/i.test(c)) return "never meant";
  if (/^It$/i.test(c) && /가주어/.test(hay)) return "There";
  if (/^It is$/i.test(c)) return "There is";
  if (/^that are$/i.test(c)) return "what are";
  if (/ing$/i.test(c) && /동명사|분사|전치사/.test(hay)) {
    return c.replace(/ing$/i, "ed");
  }
  if (/^to\s+\w+/i.test(c)) {
    const base = c.replace(/^to\s+/i, "");
    if (/e$/i.test(base)) return `${base.slice(0, -1)}ing`;
    return `${base}ing`;
  }
  if (c.trim().split(/\s+/).length === 1 && /ed$/i.test(c) && /분사|수동/.test(hay)) {
    return c.replace(/ed$/i, "ing");
  }
  return null;
}

/**
 * Align a report wrongForm to the chosen correct span so options stay parallel.
 */
function alignIncorrectToCorrect(
  correct: string,
  wrongForm: string
): string | null {
  const c = correct.trim();
  const w = wrongForm.replace(/[.,;:!?]+$/g, "").trim();
  if (!w || w === c) return null;

  const minimized = minimizeChoicePair(c, w);
  if (
    minimized &&
    minimized.correctText.toLowerCase() === c.toLowerCase() &&
    minimized.incorrectText !== minimized.correctText &&
    Math.abs(
      minimized.incorrectText.split(/\s+/).length - c.split(/\s+/).length
    ) <= 1
  ) {
    return minimized.incorrectText;
  }

  // Single-token correct: take first differing token of wrong form if WH/rel
  const cToks = c.split(/\s+/);
  const wToks = w.split(/\s+/);
  if (cToks.length === 1 && wToks.length >= 1) {
    if (wToks[0]!.toLowerCase() !== cToks[0]!.toLowerCase()) {
      return wToks[0]!;
    }
    // same first token → use minimized verb contrast if any
    if (minimized && minimized.incorrectText) return minimized.incorrectText;
  }

  // Same token count → use wrong form as-is (then minimize later)
  if (cToks.length === wToks.length) return w;

  return null;
}

function isBlockedBothOk(correct: string, incorrect: string): boolean {
  const pairKey = `${correct.toLowerCase()}|${incorrect.toLowerCase()}`;
  return (
    pairKey === "is think|is to think" ||
    pairKey === "is to think|is think" ||
    /begin to .*\|begin \w+ing/.test(pairKey)
  );
}

export function convertAnalysisPointLocally(input: {
  passageId: string;
  point: ExtractedAnalysisPoint;
}): GrammarChoiceCandidate | null {
  // Strategy A: full example + wrongForm → minimize
  const full = locateAnalysisTargetSpan(input.point);
  if (full && input.point.wrongForms[0]) {
    const correctFull = full.text.replace(/[.,;:!?]+$/g, "");
    const wrongFull = input.point.wrongForms[0]!.replace(/[.,;:!?]+$/g, "");
    if (correctFull && wrongFull && correctFull !== wrongFull) {
      const tokens = tokenizeForWordOrder(input.point.sentenceText).map(
        (t) => t.surface
      );
      const found = findTokenSpan(tokens, correctFull);
      if (found && !isBlockedBothOk(correctFull, wrongFull)) {
        const raw: GrammarChoiceCandidate = {
          choiceId: `an-${input.point.analysisPointId}`,
          passageId: input.passageId,
          sentenceId: input.point.sentenceId,
          startTokenIndex: found.start,
          endTokenIndex: found.end,
          originalText: found.text.replace(/[.,;:!?]+$/g, ""),
          correctText: found.text.replace(/[.,;:!?]+$/g, ""),
          incorrectText: wrongFull,
          grammarCategoryId: input.point.categoryId,
          grammarCategoryName:
            input.point.categoryName || input.point.title,
          bookTerm: input.point.bookTerm,
          explanationKo:
            input.point.explanationKo ||
            `${input.point.bookTerm} 구조상 ${correctFull}가 적절하다.`,
          incorrectReasonKo:
            input.point.wrongReasons[0] ||
            `이 문맥의 ${input.point.bookTerm || input.point.title} 구조에 맞지 않는다.`,
          difficulty: input.point.importance === "core" ? 4 : 3,
          learningValue: input.point.importance === "core" ? 5 : 4,
          ambiguityRisk: "low",
          sourceType: "analysis_required",
          analysisPointId: input.point.analysisPointId,
        };
        const minimized = minimizeAndRelocateCandidate(
          raw,
          input.point.sentenceText
        );
        if (minimized) {
          return {
            ...minimized,
            sourceType: "analysis_required",
            analysisPointId: input.point.analysisPointId,
            grammarCategoryName:
              input.point.categoryName || input.point.title,
            bookTerm: input.point.bookTerm,
            explanationKo: raw.explanationKo,
            incorrectReasonKo: raw.incorrectReasonKo,
            choiceId: `an-${createHash("sha1")
              .update(input.point.analysisPointId)
              .digest("hex")
              .slice(0, 10)}`,
          };
        }
      }
    }
  }

  // Strategy B: preferred short span + aligned / guessed incorrect
  const span = preferTestSpan(
    input.point.sentenceText,
    input.point.targetExpression,
    input.point.title,
    input.point.bookTerm
  );
  if (!span) return null;

  let correct = span.text.replace(/[.,;:!?]+$/g, "");
  if (!correct || correct.length > 60) return null;

  let incorrect: string | null = null;
  let incorrectReason =
    `${input.point.wrongReasons[0] || ""}`.trim() ||
    `이 문맥의 ${input.point.bookTerm || input.point.title} 구조에 맞지 않는다.`;

  for (const wf of input.point.wrongForms) {
    incorrect = alignIncorrectToCorrect(correct, wf);
    if (incorrect) break;
  }
  if (!incorrect) {
    incorrect = guessIncorrect(
      correct,
      input.point.title,
      input.point.bookTerm
    );
  }
  if (!incorrect || incorrect === correct) return null;
  if (isBlockedBothOk(correct, incorrect)) return null;

  const tokens = tokenizeForWordOrder(input.point.sentenceText).map(
    (t) => t.surface
  );
  const found = findTokenSpan(tokens, correct);
  if (!found) return null;

  correct = found.text.replace(/[.,;:!?]+$/g, "");

  const raw: GrammarChoiceCandidate = {
    choiceId: `an-${input.point.analysisPointId}`,
    passageId: input.passageId,
    sentenceId: input.point.sentenceId,
    startTokenIndex: found.start,
    endTokenIndex: found.end,
    originalText: correct,
    correctText: correct,
    incorrectText: incorrect,
    grammarCategoryId: input.point.categoryId,
    grammarCategoryName: input.point.categoryName || input.point.title,
    bookTerm: input.point.bookTerm,
    explanationKo:
      input.point.explanationKo ||
      `${input.point.bookTerm} 구조상 ${correct}가 적절하다.`,
    incorrectReasonKo: incorrectReason,
    difficulty: input.point.importance === "core" ? 4 : 3,
    learningValue: input.point.importance === "core" ? 5 : 4,
    ambiguityRisk: "low",
    sourceType: "analysis_required",
    analysisPointId: input.point.analysisPointId,
  };

  const minimized = minimizeAndRelocateCandidate(raw, input.point.sentenceText);
  if (!minimized) return null;
  return {
    ...minimized,
    sourceType: "analysis_required",
    analysisPointId: input.point.analysisPointId,
    grammarCategoryName: input.point.categoryName || input.point.title,
    bookTerm: input.point.bookTerm,
    explanationKo: raw.explanationKo,
    incorrectReasonKo: raw.incorrectReasonKo,
    choiceId: `an-${createHash("sha1")
      .update(input.point.analysisPointId)
      .digest("hex")
      .slice(0, 10)}`,
  };
}
