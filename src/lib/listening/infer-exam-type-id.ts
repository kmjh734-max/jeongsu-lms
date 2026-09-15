import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
import { questionTypeCode } from "@/lib/listening/legacy-type-map";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

/**
 * 저장·생성된 문항의 유형 모듈 번호 (fix-typeN·검수·정답 풀이 쓰는 번호).
 * 번호(order_index)가 아니라 이름·지시문으로 정한다 — 중2·중3은 번호와 유형이 다르다.
 * 자세한 규칙은 legacy-type-map.ts.
 */
export function inferExamTypeIdForFixes(
  q: Pick<GeneratedListeningQuestion, "question_type" | "instruction" | "order_index"> &
    Partial<Pick<GeneratedListeningQuestion, "question_text" | "blank_speaker" | "segments">>,
  gradeLevel?: ListeningGradeLevel
): number {
  return questionTypeCode(q, gradeLevel);
}
