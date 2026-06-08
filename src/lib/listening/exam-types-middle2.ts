import {
  MIDDLE1_LISTENING_EXAM_TYPES,
  type ExamTypeTemplate,
} from "@/lib/listening/exam-types";

/**
 * 중2 = 중1과 동일 20유형 (번호별 question_type·instruction·형식 동일).
 * 난이도 상향은 COMMON_PROMPT_MIDDLE2 · MIDDLE2_DIFFICULTY_RULES에서 처리.
 */
export const MIDDLE2_LISTENING_EXAM_TYPES: ExamTypeTemplate[] =
  MIDDLE1_LISTENING_EXAM_TYPES.map((t) => ({ ...t }));

export function getMiddle2ExamTypeById(id: number): ExamTypeTemplate | undefined {
  return MIDDLE2_LISTENING_EXAM_TYPES.find((t) => t.id === id);
}
