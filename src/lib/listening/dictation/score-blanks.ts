import { normalizeDictationText } from "@/lib/listening/dictation/normalize-text";
import { textSimilarityPercent } from "@/lib/listening/dictation/similarity";
import type {
  DictationBlankItem,
  DictationBlankScoreResult,
  DictationSubmitResult,
} from "@/lib/listening/dictation/types";

function coreWord(text: string): string {
  return normalizeDictationText(text).replace(/[^a-z0-9']/g, "");
}

/** 학생 입력에서 정답 단어 추출 (여러 단어 입력 시 정답 포함 여부) */
function studentWordForBlank(studentRaw: string, correct: string): string {
  const trimmed = studentRaw.trim();
  if (!trimmed) return "";
  const normC = coreWord(correct);
  const tokens = trimmed.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) ?? [];
  if (tokens.length <= 1) return trimmed;
  for (const t of tokens) {
    if (coreWord(t) === normC) return t;
  }
  return trimmed;
}

function scoreSingleBlank(
  correct: string,
  studentRaw: string
): { blankScore: number; isCorrect: boolean; feedback: string } {
  const student = studentWordForBlank(studentRaw, correct).trim();
  if (!student) {
    return { blankScore: 0, isCorrect: false, feedback: "빈칸" };
  }

  // 대소문자·구두점 무시 (Library === library)
  const normC = normalizeDictationText(correct);
  const normS = normalizeDictationText(student);

  if (/[가-힣]/.test(normS) && !/[a-z]/.test(normS)) {
    return { blankScore: 0, isCorrect: false, feedback: "영어로 입력하세요" };
  }

  if (normS === normC || coreWord(student) === coreWord(correct)) {
    return { blankScore: 100, isCorrect: true, feedback: "정답" };
  }

  if (normC.length >= 3) {
    const sim = textSimilarityPercent(normC, normS);
    if (sim >= 88) {
      return { blankScore: 100, isCorrect: true, feedback: "정답" };
    }
    if (sim >= 75) {
      return { blankScore: 90, isCorrect: true, feedback: "정답 (철자 약간 다름)" };
    }
  }

  return { blankScore: 0, isCorrect: false, feedback: "오답" };
}

export function scoreDictationAttempt(
  blankItems: DictationBlankItem[],
  studentAnswers: Record<string, string>,
  passScore: number
): DictationSubmitResult {
  const results: DictationBlankScoreResult[] = blankItems.map((item) => {
    const studentAnswer = (studentAnswers[item.id] ?? "").trim();
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
