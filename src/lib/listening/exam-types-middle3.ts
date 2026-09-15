import type { ExamTypeTemplate } from "@/lib/listening/exam-type-template";
import { templatesFromBlueprint } from "@/lib/listening/grade-exam-types";

/**
 * 중3 20유형 — 2023~2026 시·도교육청 공식 문제지 8회에서 20자리가 모두 같았던 배치.
 * 예전에는 중1 배치를 그대로 복사해 20자리 중 19자리가 실제 시험과 달랐다.
 * 배치는 grade-blueprints.ts, 유형 문구는 type-catalog.ts.
 */
export const MIDDLE3_LISTENING_EXAM_TYPES: ExamTypeTemplate[] = templatesFromBlueprint("middle3");

export function getMiddle3ExamTypeById(id: number): ExamTypeTemplate | undefined {
  return MIDDLE3_LISTENING_EXAM_TYPES.find((t) => t.id === id);
}
