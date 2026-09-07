import { createHash } from "node:crypto";
import type {
  GrammarChoiceCandidate,
  GrammarChoiceRenderSegment,
  WorkbookGrammarChoiceItem,
} from "@/lib/lesson-materials/workbook-types";
import {
  assignPassageCharIndices,
} from "@/lib/lesson-materials/grammar-choice-minimize";
import { surfacesEqual } from "@/lib/lesson-materials/grammar-choice-repair";

export type DisplayGrammarChoice = {
  leftText: string;
  rightText: string;
  correctSide: "left" | "right";
};

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromKey(key: string): number {
  const hex = createHash("sha256").update(key).digest("hex").slice(0, 8);
  return Number.parseInt(hex, 16) >>> 0;
}

export function assignDisplaySides(
  candidates: GrammarChoiceCandidate[],
  seedKey: string
): DisplayGrammarChoice[] {
  const rand = mulberry32(seedFromKey(seedKey));
  const out: DisplayGrammarChoice[] = [];
  let leftCorrect = 0;
  let rightCorrect = 0;
  const recent: Array<"left" | "right"> = [];

  for (const c of candidates) {
    let prefer: "left" | "right" | null = null;
    if (leftCorrect > rightCorrect) prefer = "right";
    else if (rightCorrect > leftCorrect) prefer = "left";

    if (
      recent.length >= 2 &&
      recent[recent.length - 1] === recent[recent.length - 2]
    ) {
      prefer = recent[recent.length - 1] === "left" ? "right" : "left";
    }

    const side: "left" | "right" = prefer ?? (rand() < 0.5 ? "left" : "right");

    if (side === "left") {
      leftCorrect += 1;
      out.push({
        leftText: c.correctText,
        rightText: c.incorrectText,
        correctSide: "left",
      });
    } else {
      rightCorrect += 1;
      out.push({
        leftText: c.incorrectText,
        rightText: c.correctText,
        correctSide: "right",
      });
    }
    recent.push(side);
    if (recent.length > 3) recent.shift();
  }

  return out;
}

export function buildGrammarChoiceItems(
  candidates: GrammarChoiceCandidate[],
  seedKey: string,
  sourcePassage: string,
  sentenceOrder: string[]
): WorkbookGrammarChoiceItem[] | null {
  const displays = assignDisplaySides(candidates, seedKey);
  const charSpans = assignPassageCharIndices(
    sourcePassage,
    candidates.map((c) => ({
      correctText: c.correctText,
      sentenceId: c.sentenceId,
    })),
    sentenceOrder
  );

  const items: WorkbookGrammarChoiceItem[] = [];
  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i]!;
    const d = displays[i]!;
    const span = charSpans[i];
    if (!span) return null;
    const exactCorrect = sourcePassage.slice(
      span.startCharIndex,
      span.endCharIndex
    );
    if (
      !surfacesEqual(exactCorrect, c.correctText) &&
      !surfacesEqual(exactCorrect, c.originalText)
    ) {
      return null;
    }
    items.push({
      number: i + 1,
      choiceId: c.choiceId,
      sentenceId: c.sentenceId,
      startTokenIndex: c.startTokenIndex,
      endTokenIndex: c.endTokenIndex,
      startCharIndex: span.startCharIndex,
      endCharIndex: span.endCharIndex,
      originalText: exactCorrect,
      correctText: exactCorrect,
      incorrectText: c.incorrectText,
      leftText:
        d.correctSide === "left" ? exactCorrect : c.incorrectText,
      rightText:
        d.correctSide === "right" ? exactCorrect : c.incorrectText,
      correctSide: d.correctSide,
      grammarCategoryId: c.grammarCategoryId,
      grammarCategoryName: c.grammarCategoryName,
      bookTerm: c.bookTerm,
      explanationKo: c.explanationKo,
      incorrectReasonKo: c.incorrectReasonKo,
      difficulty: c.difficulty,
      learningValue: c.learningValue,
      sourceType: c.sourceType,
      analysisPointId: c.analysisPointId ?? null,
    });
  }
  return items;
}

/**
 * Build render segments by slicing the original passage string.
 * Does NOT re-tokenize / re-join words (preserves spacing & punctuation).
 */
export function buildPassageSegmentsFromSource(
  sourcePassage: string,
  items: WorkbookGrammarChoiceItem[]
): GrammarChoiceRenderSegment[] | null {
  const ordered = [...items].sort(
    (a, b) => a.startCharIndex - b.startCharIndex
  );
  for (let i = 0; i < ordered.length; i++) {
    const it = ordered[i]!;
    if (it.startCharIndex < 0 || it.endCharIndex > sourcePassage.length) {
      return null;
    }
    if (it.startCharIndex >= it.endCharIndex) return null;
    const slice = sourcePassage.slice(it.startCharIndex, it.endCharIndex);
    if (slice !== it.correctText) return null;
    if (i > 0 && it.startCharIndex < ordered[i - 1]!.endCharIndex) return null;
  }

  const segments: GrammarChoiceRenderSegment[] = [];
  let cursor = 0;
  for (const it of ordered) {
    if (cursor < it.startCharIndex) {
      segments.push({
        type: "text",
        text: sourcePassage.slice(cursor, it.startCharIndex),
      });
    }
    segments.push({
      type: "choice",
      number: it.number,
      leftText: it.leftText,
      rightText: it.rightText,
    });
    cursor = it.endCharIndex;
  }
  if (cursor < sourcePassage.length) {
    segments.push({
      type: "text",
      text: sourcePassage.slice(cursor),
    });
  }
  return segments;
}
