import { createHash } from "node:crypto";
import { circledNumber } from "@/lib/lesson-materials/grammar-choice-constants";
import { assignDisplaySides } from "@/lib/lesson-materials/grammar-choice-display";
import type { GrammarChoiceCandidate } from "@/lib/lesson-materials/workbook-types";
import type { ResolvedCandidate } from "@/lib/lesson-materials/grammar-choice-v2/types";

export function passageHash(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

export function renderChoices(input: {
  originalPassage: string;
  items: Array<
    ResolvedCandidate & {
      leftText: string;
      rightText: string;
      number: number;
    }
  >;
}): { rendered: string; questionCount: number } {
  const ordered = [...input.items].sort((a, b) => b.passageStart - a.passageStart);
  let text = input.originalPassage;
  for (const item of ordered) {
    const marker = `${circledNumber(item.number)}[${item.leftText} / ${item.rightText}]`;
    text =
      text.slice(0, item.passageStart) +
      marker +
      text.slice(item.passageEnd);
  }
  return { rendered: text, questionCount: input.items.length };
}

export function restoreCorrectAnswers(
  rendered: string,
  answers: Array<{ number: number; correctText: string }>
): string {
  let text = rendered;
  const ordered = [...answers].sort((a, b) => b.number - a.number);
  for (const answer of ordered) {
    const mark = circledNumber(answer.number);
    const token = `${mark}[`;
    const start = text.indexOf(token);
    if (start < 0) continue;
    const end = text.indexOf("]", start);
    if (end < 0) continue;
    const inside = text.slice(start + token.length, end);
    const parts = inside.split(" / ");
    if (!parts.includes(answer.correctText)) continue;
    text = text.slice(0, start) + answer.correctText + text.slice(end + 1);
  }
  return text;
}

export function assignSeededSides(
  items: ResolvedCandidate[],
  seedKey: string
): Array<{ leftText: string; rightText: string; correctSide: "left" | "right" }> {
  const asCandidates: GrammarChoiceCandidate[] = items.map((item) => ({
    choiceId: item.candidateId,
    passageId: "",
    sentenceId: item.sentenceId,
    startTokenIndex: 0,
    endTokenIndex: 0,
    originalText: item.correctAnswer,
    correctText: item.correctAnswer,
    incorrectText: item.distractors[0] ?? "",
    grammarCategoryId: item.pointCode,
    grammarCategoryName: item.pointCode,
    bookTerm: item.pointCode,
    explanationKo: "",
    incorrectReasonKo: "",
    difficulty: 3,
    learningValue: 3,
    ambiguityRisk: "low",
  }));
  return assignDisplaySides(asCandidates, seedKey);
}
