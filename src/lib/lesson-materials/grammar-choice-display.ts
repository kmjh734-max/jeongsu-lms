import { createHash } from "node:crypto";
import type {
  GrammarChoiceCandidate,
  GrammarChoiceRenderSegment,
  WorkbookGrammarChoiceItem,
} from "@/lib/lesson-materials/workbook-types";
import { tokenizeForWordOrder } from "@/lib/lesson-materials/word-order-tokenize";

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

/**
 * Deterministic left/right placement.
 * - left/right correct counts differ by at most 1
 * - no 3 identical correctSide in a row
 */
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

    let side: "left" | "right";
    if (prefer) side = prefer;
    else side = rand() < 0.5 ? "left" : "right";

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
  seedKey: string
): WorkbookGrammarChoiceItem[] {
  const displays = assignDisplaySides(candidates, seedKey);
  return candidates.map((c, i) => {
    const d = displays[i]!;
    return {
      number: i + 1,
      choiceId: c.choiceId,
      sentenceId: c.sentenceId,
      startTokenIndex: c.startTokenIndex,
      endTokenIndex: c.endTokenIndex,
      originalText: c.originalText,
      correctText: c.correctText,
      incorrectText: c.incorrectText,
      leftText: d.leftText,
      rightText: d.rightText,
      correctSide: d.correctSide,
      grammarCategoryId: c.grammarCategoryId,
      grammarCategoryName: c.grammarCategoryName,
      bookTerm: c.bookTerm,
      explanationKo: c.explanationKo,
      incorrectReasonKo: c.incorrectReasonKo,
      difficulty: c.difficulty,
      learningValue: c.learningValue,
    };
  });
}

export function buildPassageSegments(
  sentences: Array<{ id: string; english: string }>,
  items: WorkbookGrammarChoiceItem[]
): GrammarChoiceRenderSegment[] {
  const bySentence = new Map<string, WorkbookGrammarChoiceItem[]>();
  for (const it of items) {
    const list = bySentence.get(it.sentenceId) ?? [];
    list.push(it);
    bySentence.set(it.sentenceId, list);
  }
  for (const list of bySentence.values()) {
    list.sort((a, b) => a.startTokenIndex - b.startTokenIndex);
  }

  const segments: GrammarChoiceRenderSegment[] = [];
  sentences.forEach((s, si) => {
    if (si > 0) segments.push({ type: "text", text: " " });
    const tokens = tokenizeForWordOrder(s.english).map((t) => t.surface);
    const choices = bySentence.get(s.id) ?? [];
    let cursor = 0;
    for (const ch of choices) {
      if (ch.startTokenIndex > cursor) {
        const before = tokens.slice(cursor, ch.startTokenIndex).join(" ");
        segments.push({ type: "text", text: `${before} ` });
      }
      segments.push({
        type: "choice",
        number: ch.number,
        leftText: ch.leftText,
        rightText: ch.rightText,
      });
      cursor = ch.endTokenIndex + 1;
      if (cursor < tokens.length) {
        segments.push({ type: "text", text: " " });
      }
    }
    if (cursor < tokens.length) {
      segments.push({
        type: "text",
        text: tokens.slice(cursor).join(" "),
      });
    }
  });

  return segments;
}
