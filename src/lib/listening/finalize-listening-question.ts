import { applyQuestionFixes } from "@/lib/listening/apply-question-fixes";
import { examTypeCode, type ExamTypeTemplate } from "@/lib/listening/exam-types";
import { isCriticalQualityCode } from "@/lib/listening/generic-quality-checks";
import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
import { inferExamTypeIdForFixes } from "@/lib/listening/infer-exam-type-id";
import { checkListeningQuestionQuality } from "@/lib/listening/quality-check";
import type { ValidatedListeningQuestion } from "@/lib/listening/run-question-validation";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

/** 규칙 점수가 이보다 낮으면 치명적 문제가 없어도 검토 표시 */
const REVIEW_SCORE_FLOOR = 50;

/**
 * 생성 직후: 규칙 보정 + 규칙 검수(무료)만 적용한다. 모델 검수는 부르지 않는다.
 * 예전에는 검수 없이 품질 100·정답 확인됨을 찍어 두어 틀린 문항도 확인된 것처럼 보였다.
 */
export function finalizeListeningQuestionFast(
  q: GeneratedListeningQuestion,
  typeHint?: ExamTypeTemplate,
  gradeLevel: ListeningGradeLevel = "middle1"
): ValidatedListeningQuestion {
  // 유형 번호 = 모듈 번호 (템플릿 id는 문항 번호라 중2·중3에서는 유형과 다르다)
  const typeId = typeHint ? examTypeCode(typeHint) : inferExamTypeIdForFixes(q, gradeLevel);
  const fixed = applyQuestionFixes(q, typeId, gradeLevel);
  const answer_clue = fixed.answer_clue?.trim() ?? "";

  const rule = checkListeningQuestionQuality(fixed, typeHint, gradeLevel);
  const critical = rule.issues.filter((i) => isCriticalQualityCode(i.code));
  const needs_review = critical.length > 0 || rule.quality_score < REVIEW_SCORE_FLOOR;
  const problems = critical.map((i) => i.message);
  const answer_clarity_score = critical.length > 0 ? 50 : answer_clue ? 85 : 60;

  return {
    ...fixed,
    answer_clue,
    needs_review,
    quality_issues: rule.issues,
    quality_score: rule.quality_score,
    answer_clarity_score,
    is_answer_clear: critical.length === 0,
    has_multiple_possible_answers: false,
    has_answer_clue: Boolean(answer_clue),
    problems,
    suggestions: [],
    answer_validation: {
      is_answer_clear: critical.length === 0,
      // 모델로 정답을 따로 확인하지 않았으므로 확인됨으로 표시하지 않는다
      correct_answer_verified: false,
      has_multiple_possible_answers: false,
      ambiguous_choices: [],
      answer_clue,
      problems,
      suggestions: [],
      answer_clarity_score,
    },
  };
}
