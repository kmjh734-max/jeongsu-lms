import { MIDDLE1_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types";
import { MIDDLE2_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-middle2";
import { MIDDLE3_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-middle3";
import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

function typesForGrade(grade?: ListeningGradeLevel) {
  if (grade === "middle3") return MIDDLE3_LISTENING_EXAM_TYPES;
  if (grade === "middle2") return MIDDLE2_LISTENING_EXAM_TYPES;
  if (grade === "middle1") return MIDDLE1_LISTENING_EXAM_TYPES;
  return [...MIDDLE3_LISTENING_EXAM_TYPES, ...MIDDLE2_LISTENING_EXAM_TYPES, ...MIDDLE1_LISTENING_EXAM_TYPES];
}

/**
 * order_index(슬롯 번호)가 아니라 실제 기출 유형 ID로 fix를 적용하기 위함.
 * 같은 유형 5문항 생성 시 order_index=5가 5번(담화) fix로 잘못 처리되던 문제 방지.
 */
export function inferExamTypeIdForFixes(
  q: Pick<GeneratedListeningQuestion, "question_type" | "instruction" | "order_index">,
  gradeLevel?: ListeningGradeLevel
): number {
  const qt = q.question_type?.trim();
  const types = typesForGrade(gradeLevel);

  if (qt) {
    const matches = types.filter((t) => t.question_type === qt);
    if (matches.length === 1) return matches[0]!.id;
    if (matches.length > 1) {
      const bySlot = matches.find((t) => t.id === q.order_index);
      if (bySlot) return bySlot.id;
      return matches[0]!.id;
    }

    const loose = types.find(
      (t) => qt.includes(t.question_type) || t.question_type.includes(qt)
    );
    if (loose) return loose.id;
  }

  const fromOrder = types.find((t) => t.id === q.order_index);
  if (fromOrder) return fromOrder.id;

  return q.order_index;
}
