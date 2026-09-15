import type { ExamTypeTemplate } from "@/lib/listening/exam-type-template";
import { templatesFromBlueprint } from "@/lib/listening/grade-exam-types";

/**
 * 중2 20유형 — 2026 시·도교육청 공식 형식(17 양식 빈칸, 18 표현의 의미).
 * 예전에는 중1 배치를 그대로 복사해 20자리 중 16자리가 실제 시험과 달랐다.
 * 배치는 grade-blueprints.ts, 유형 문구는 type-catalog.ts.
 */
export const MIDDLE2_LISTENING_EXAM_TYPES: ExamTypeTemplate[] = templatesFromBlueprint("middle2");

export function getMiddle2ExamTypeById(id: number): ExamTypeTemplate | undefined {
  return MIDDLE2_LISTENING_EXAM_TYPES.find((t) => t.id === id);
}
