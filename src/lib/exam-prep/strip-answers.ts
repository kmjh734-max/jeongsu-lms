import type {
  ExamWorkbookQuestion,
  ExamWorkbookQuestionPublic,
} from "@/lib/exam-prep/types";

export function stripQuestionAnswers(
  q: ExamWorkbookQuestion
): ExamWorkbookQuestionPublic {
  const {
    correct_answer: _c,
    acceptable_answers: _a,
    ...rest
  } = q;
  return rest;
}

export function stripQuestions(
  list: ExamWorkbookQuestion[]
): ExamWorkbookQuestionPublic[] {
  return list.map(stripQuestionAnswers);
}

/** question_data에서 정답 힌트 제거 (배열 correctOrder 등) */
export function sanitizeQuestionDataForStudent(
  questionType: string,
  data: Record<string, unknown>
): Record<string, unknown> {
  const copy = { ...data };
  if (questionType === "sentence_order" || questionType === "paragraph_order") {
    delete copy.correctOrder;
    // items만 남기고 셔플은 서버/클라에서
  }
  if (questionType === "english_blank" || questionType === "korean_blank" || questionType === "verb_form") {
    const blanks = Array.isArray(copy.blanks) ? copy.blanks : [];
    copy.blanks = blanks.map((b: unknown) => {
      if (!b || typeof b !== "object") return b;
      const { answer: _ans, acceptableAnswers: _acc, ...rest } = b as Record<
        string,
        unknown
      >;
      return rest;
    });
  }
  if (questionType === "error_correction") {
    delete copy.errorWord;
  }
  return copy;
}
