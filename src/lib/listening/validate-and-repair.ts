import { applyQuestionFixes } from "@/lib/listening/apply-question-fixes";
import type { ExamTypeTemplate } from "@/lib/listening/exam-types";
import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
import { repairListeningQuestionWithAi } from "@/lib/listening/repair-listening-question";
import {
  attachValidationToQuestion,
  type ValidatedListeningQuestion,
} from "@/lib/listening/run-question-validation";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

const MAX_REPAIR_ATTEMPTS = 1;

/** 심각한 오류만 AI 수정 (호출 수·시간 절약) */
function shouldAttemptRepair(v: ValidatedListeningQuestion): boolean {
  if (
    v.quality_issues?.some(
      (i) =>
        i.code.endsWith("_dialogue") ||
        i.message.includes("M과 W") ||
        i.message.includes("M/W")
    )
  ) {
    return true;
  }
  const score = v.quality_score ?? 100;
  const clarity = v.answer_clarity_score ?? 100;
  if (score < 55) return true;
  if (clarity < 55) return true;
  if (!v.answer_validation.correct_answer_verified) return true;
  if (v.answer_validation.has_multiple_possible_answers) return true;
  if (!v.is_answer_clear && clarity < 70) return true;
  return false;
}

/** 규칙·AI 검수 후 실패 시 상위 모델로 자동 수정·재검수 */
export async function validateAndRepairListeningQuestion(
  apiKey: string,
  q: GeneratedListeningQuestion,
  typeHint?: ExamTypeTemplate,
  gradeLevel: ListeningGradeLevel = "middle1"
): Promise<ValidatedListeningQuestion> {
  let current = applyQuestionFixes(
    q,
    typeHint?.id ?? undefined,
    gradeLevel
  );

  for (let attempt = 0; attempt <= MAX_REPAIR_ATTEMPTS; attempt++) {
    const validated = await attachValidationToQuestion(
      apiKey,
      current,
      typeHint,
      gradeLevel
    );
    if (!shouldAttemptRepair(validated) || attempt === MAX_REPAIR_ATTEMPTS) {
      return validated;
    }

    const repaired = await repairListeningQuestionWithAi(
      apiKey,
      validated,
      {
        quality_score: validated.quality_score ?? 0,
        answer_clarity_score: validated.answer_clarity_score ?? 0,
        is_answer_clear: validated.is_answer_clear ?? false,
        has_multiple_possible_answers:
          validated.has_multiple_possible_answers ?? false,
        has_answer_clue: validated.has_answer_clue ?? false,
        needs_review: validated.needs_review ?? true,
        problems: validated.problems ?? [],
        suggestions: validated.suggestions ?? [],
        quality_issues: validated.quality_issues ?? [],
        answer_validation: validated.answer_validation,
      },
      typeHint,
      gradeLevel
    );
    if (!repaired) return validated;
    current = repaired;
  }

  return attachValidationToQuestion(apiKey, current, typeHint, gradeLevel);
}
