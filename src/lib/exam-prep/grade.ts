import type { ExamGradingStatus } from "@/lib/exam-prep/types";

export type GradeResult = {
  isCorrect: boolean | null;
  score: number;
  gradingStatus: ExamGradingStatus;
  normalizedAnswer?: unknown;
  feedback?: string;
};

function normalizeText(
  raw: string,
  opts?: { ignoreCase?: boolean; ignoreEndPunct?: boolean }
): string {
  let s = raw.trim().replace(/\s+/g, " ");
  if (opts?.ignoreCase !== false) s = s.toLowerCase();
  if (opts?.ignoreEndPunct !== false) {
    s = s.replace(/[.!?]+$/g, "").trim();
  }
  return s;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

export function gradeChoiceAnswer(
  studentOptionId: string | null | undefined,
  correctAnswer: unknown,
  points: number
): GradeResult {
  let correct: string | null = null;
  if (typeof correctAnswer === "object" && correctAnswer !== null) {
    const o = correctAnswer as Record<string, unknown>;
    if ("optionId" in o && o.optionId != null) correct = String(o.optionId);
    else if ("choiceNumber" in o && o.choiceNumber != null)
      correct = String(o.choiceNumber);
  } else if (typeof correctAnswer === "string" || typeof correctAnswer === "number") {
    correct = String(correctAnswer);
  }
  const ok = !!studentOptionId && !!correct && studentOptionId === correct;
  return {
    isCorrect: ok,
    score: ok ? points : 0,
    gradingStatus: ok ? "auto_correct" : "auto_incorrect",
    normalizedAnswer: { optionId: studentOptionId ?? null },
  };
}

export function gradeShortAnswer(
  studentText: string | null | undefined,
  correctAnswer: unknown,
  acceptableAnswers: unknown,
  points: number
): GradeResult {
  const student = normalizeText(studentText ?? "");
  const answers = [
    ...(typeof correctAnswer === "string" ? [correctAnswer] : []),
    ...(typeof correctAnswer === "object" &&
    correctAnswer !== null &&
    "text" in correctAnswer
      ? [String((correctAnswer as { text: unknown }).text)]
      : []),
    ...asStringArray(acceptableAnswers),
    ...(typeof correctAnswer === "object" &&
    correctAnswer !== null &&
    "acceptableAnswers" in correctAnswer
      ? asStringArray(
          (correctAnswer as { acceptableAnswers: unknown }).acceptableAnswers
        )
      : []),
  ].map((a) => normalizeText(a));

  const ok = student.length > 0 && answers.some((a) => a === student);
  return {
    isCorrect: ok,
    score: ok ? points : 0,
    gradingStatus: ok ? "auto_correct" : "auto_incorrect",
    normalizedAnswer: { text: student },
  };
}

export function gradeBlanks(
  studentBlanks: Record<string, string> | null | undefined,
  questionData: Record<string, unknown>,
  correctAnswer: unknown,
  points: number
): GradeResult {
  type BlankSpec = {
    id: string;
    answer?: string;
    acceptableAnswers?: string[];
  };
  const blanksFromData = questionData.blanks as BlankSpec[] | undefined;
  const blanksFromAnswer =
    typeof correctAnswer === "object" &&
    correctAnswer !== null &&
    "blanks" in correctAnswer
      ? ((correctAnswer as { blanks: BlankSpec[] }).blanks ?? [])
      : [];
  const blanks: BlankSpec[] = blanksFromData ?? blanksFromAnswer;

  if (blanks.length === 0) {
    return {
      isCorrect: false,
      score: 0,
      gradingStatus: "auto_incorrect",
    };
  }

  let correctCount = 0;
  const detail: Record<string, boolean> = {};
  for (const b of blanks) {
    const student = normalizeText(studentBlanks?.[b.id] ?? "");
    const accepts = [
      b.answer ?? "",
      ...(b.acceptableAnswers ?? []),
    ].map((a) => normalizeText(a));
    const ok = student.length > 0 && accepts.includes(student);
    detail[b.id] = ok;
    if (ok) correctCount += 1;
  }

  const ratio = correctCount / blanks.length;
  const score = Math.round(points * ratio * 100) / 100;
  const allOk = correctCount === blanks.length;
  return {
    isCorrect: allOk,
    score,
    gradingStatus: allOk
      ? "auto_correct"
      : correctCount > 0
        ? "auto_incorrect"
        : "auto_incorrect",
    normalizedAnswer: { blanks: studentBlanks ?? {}, detail },
  };
}

export function gradeOrder(
  studentOrder: string[] | null | undefined,
  correctOrder: string[],
  points: number
): GradeResult {
  const student = studentOrder ?? [];
  const ok =
    student.length === correctOrder.length &&
    student.every((id, i) => id === correctOrder[i]);
  return {
    isCorrect: ok,
    score: ok ? points : 0,
    gradingStatus: ok ? "auto_correct" : "auto_incorrect",
    normalizedAnswer: { order: student },
  };
}

/** 서술형: 정규화 일치면 정답, 아니면 needs_review */
export function gradeWriting(
  studentText: string | null | undefined,
  correctAnswer: unknown,
  acceptableAnswers: unknown,
  points: number
): GradeResult {
  const student = normalizeText(studentText ?? "");
  const answers = [
    ...(typeof correctAnswer === "string" ? [correctAnswer] : []),
    ...(typeof correctAnswer === "object" &&
    correctAnswer !== null &&
    "text" in correctAnswer
      ? [String((correctAnswer as { text: unknown }).text)]
      : []),
    ...asStringArray(acceptableAnswers),
  ].map((a) => normalizeText(a));

  if (student.length === 0) {
    return {
      isCorrect: false,
      score: 0,
      gradingStatus: "auto_incorrect",
      normalizedAnswer: { text: "" },
    };
  }

  if (answers.some((a) => a === student)) {
    return {
      isCorrect: true,
      score: points,
      gradingStatus: "auto_correct",
      normalizedAnswer: { text: student },
    };
  }

  return {
    isCorrect: null,
    score: 0,
    gradingStatus: "needs_review",
    normalizedAnswer: { text: student },
    feedback: "강사 확인이 필요합니다.",
  };
}

export function gradeComprehensionCheck(
  confirmed: boolean | null | undefined,
  points: number
): GradeResult {
  const ok = confirmed === true;
  return {
    isCorrect: ok,
    score: ok ? points : 0,
    gradingStatus: ok ? "auto_correct" : "auto_incorrect",
    normalizedAnswer: { confirmed: !!confirmed },
  };
}
