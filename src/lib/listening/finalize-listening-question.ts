import { applyQuestionFixes } from "@/lib/listening/apply-question-fixes";
import type { ExamTypeTemplate } from "@/lib/listening/exam-types";
import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
import type { ValidatedListeningQuestion } from "@/lib/listening/run-question-validation";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

/** 생성 직후: 규칙 보정만 적용 (AI 검수·자동 수정 없음, 검토 플래그 없음) */
export function finalizeListeningQuestionFast(
  q: GeneratedListeningQuestion,
  typeHint?: ExamTypeTemplate,
  gradeLevel: ListeningGradeLevel = "middle1"
): ValidatedListeningQuestion {
  const fixed = applyQuestionFixes(q, typeHint?.id, gradeLevel);
  const answer_clue = fixed.answer_clue?.trim() ?? "";

  return {
    ...fixed,
    answer_clue,
    needs_review: false,
    quality_issues: [],
    quality_score: 100,
    answer_clarity_score: 100,
    is_answer_clear: true,
    has_multiple_possible_answers: false,
    has_answer_clue: Boolean(answer_clue),
    problems: [],
    suggestions: [],
    answer_validation: {
      is_answer_clear: true,
      correct_answer_verified: true,
      has_multiple_possible_answers: false,
      ambiguous_choices: [],
      answer_clue,
      problems: [],
      suggestions: [],
      answer_clarity_score: 100,
    },
  };
}
