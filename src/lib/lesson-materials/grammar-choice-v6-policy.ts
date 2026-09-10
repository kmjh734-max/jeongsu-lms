import { countEnglishWords } from "@/lib/lesson-materials/workbook-types";

export function sentenceChoiceCap(wordCount: number): number {
  if (wordCount <= 0) return 0;
  return wordCount >= 35 ? 3 : 2;
}

/** Target item count. Quality may yield fewer; never pad with rejects. */
export function computeDesiredCount(
  wordCount: number,
  sentences: Array<{ english: string }>
): number {
  const baseDesiredCount = Math.min(
    18,
    Math.max(10, Math.round(wordCount / 11))
  );
  const sentenceCap = sentences.reduce(
    (sum, s) => sum + sentenceChoiceCap(countEnglishWords(s.english)),
    0
  );
  return Math.min(baseDesiredCount, Math.max(0, sentenceCap));
}

export function candidateBudget(desiredCount: number): number {
  return Math.min(Math.max(desiredCount, 1) * 3, 54);
}

export function topUpCandidateBudget(missingCount: number): number {
  return Math.max(0, missingCount) * 3;
}

export function scoreReviewedItem(input: {
  onlyOneAnswerPossible: boolean;
  incorrectSentenceIsUngrammatical: boolean;
  correctMatchesOriginal: boolean;
  highSchoolGrammarValue: number;
  distractorPlausibility: number;
  difficulty: number;
}): number {
  const uniqueness =
    input.onlyOneAnswerPossible &&
    input.incorrectSentenceIsUngrammatical &&
    input.correctMatchesOriginal
      ? 30
      : 0;
  const hs = (Math.min(5, Math.max(1, input.highSchoolGrammarValue)) / 5) * 25;
  const pl = (Math.min(5, Math.max(1, input.distractorPlausibility)) / 5) * 20;
  const diff = (Math.min(5, Math.max(1, input.difficulty)) / 5) * 15;
  return uniqueness + hs + pl + diff;
}

export const FINAL_SCORE_MIN = 80;
