import type { ExamTypeTemplate } from "@/lib/listening/exam-type-template";
import { MIDDLE1_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-middle1";

/**
 * 중3 = 중1·중2와 동일 20유형 (번호별 question_type·instruction·형식 동일).
 * 난이도는 COMMON_PROMPT_MIDDLE3 · MIDDLE3_DIFFICULTY_RULES에서 처리.
 */
export const MIDDLE3_LISTENING_EXAM_TYPES: ExamTypeTemplate[] =
  MIDDLE1_LISTENING_EXAM_TYPES.map((t) => ({ ...t }));

export function getMiddle3ExamTypeById(id: number): ExamTypeTemplate | undefined {
  return MIDDLE3_LISTENING_EXAM_TYPES.find((t) => t.id === id);
}
