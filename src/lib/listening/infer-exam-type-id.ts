import { HIGH1_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-high1";
import { HIGH2_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-high2";
import { HIGH3_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-high3";
import { MIDDLE1_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types";
import { MIDDLE2_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-middle2";
import { MIDDLE3_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-middle3";
import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

function typesForGrade(grade?: ListeningGradeLevel) {
  if (grade === "high3") return HIGH3_LISTENING_EXAM_TYPES;
  if (grade === "high2") return HIGH2_LISTENING_EXAM_TYPES;
  if (grade === "high1") return HIGH1_LISTENING_EXAM_TYPES;
  if (grade === "middle3") return MIDDLE3_LISTENING_EXAM_TYPES;
  if (grade === "middle2") return MIDDLE2_LISTENING_EXAM_TYPES;
  if (grade === "middle1") return MIDDLE1_LISTENING_EXAM_TYPES;
  return [
    ...HIGH3_LISTENING_EXAM_TYPES,
    ...HIGH2_LISTENING_EXAM_TYPES,
    ...HIGH1_LISTENING_EXAM_TYPES,
    ...MIDDLE3_LISTENING_EXAM_TYPES,
    ...MIDDLE2_LISTENING_EXAM_TYPES,
    ...MIDDLE1_LISTENING_EXAM_TYPES,
  ];
}

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
