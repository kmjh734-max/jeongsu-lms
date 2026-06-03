import { normalizeDictationText } from "@/lib/listening/dictation/normalize-text";
import { textSimilarityPercent } from "@/lib/listening/dictation/similarity";
import type {
  DictationBlankItem,
  DictationBlankScoreResult,
  DictationSubmitResult,
} from "@/lib/listening/dictation/types";

function scoreSingleBlank(
  correct: string,
  studentRaw: string
): { blankScore: number; isCorrect: boolean; feedback: string } {
  const student = studentRaw.trim();
  if (!student) {
    return { blankScore: 0, isCorrect: false, feedback: "빈칸" };
  }

  const sim = textSimilarityPercent(correct, student);
  const isPhrase = correct.includes(" ");

  if (sim >= 98) {
    return { blankScore: 100, isCorrect: true, feedback: "정답" };
  }
  if (sim >= 90) {
    return { blankScore: 90, isCorrect: true, feedback: "정답 (사소한 오타)" };
  }
  if (sim >= 85) {
    return { blankScore: 85, isCorrect: true, feedback: "정답 (철자 약간 다름)" };
  }
  if (isPhrase && sim >= 75) {
    return { blankScore: 80, isCorrect: true, feedback: "정답 (핵심 표현 일치)" };
  }
  if (sim >= 70) {
    return { blankScore: 70, isCorrect: false, feedback: "부분 정답" };
  }
  if (sim >= 50) {
    return { blankScore: 50, isCorrect: false, feedback: "비슷하지만 오답" };
  }

  const normS = normalizeDictationText(student);
  const normC = normalizeDictationText(correct);
  if (/[가-힣]/.test(normS) && !/[a-z]/.test(normS)) {
    return { blankScore: 0, isCorrect: false, feedback: "영어로 입력하세요" };
  }
  if (normS === normC) {
    return { blankScore: 100, isCorrect: true, feedback: "정답" };
  }

  return { blankScore: 0, isCorrect: false, feedback: "오답" };
}

export function scoreDictationAttempt(
  blankItems: DictationBlankItem[],
  studentAnswers: Record<string, string>,
  passScore: number
): DictationSubmitResult {
  const results: DictationBlankScoreResult[] = blankItems.map((item) => {
    const studentAnswer = studentAnswers[item.id] ?? "";
    const scored = scoreSingleBlank(item.answer, studentAnswer);
    return {
      id: item.id,
      studentAnswer,
      correctAnswer: item.answer,
      blankScore: scored.blankScore,
      isCorrect: scored.isCorrect,
      feedback: scored.feedback,
    };
  });

  const score =
    results.length === 0
      ? 0
      : Math.round(
          results.reduce((sum, r) => sum + r.blankScore, 0) / results.length
        );

  return {
    score,
    passed: score >= passScore,
    passScore,
    results,
  };
}
