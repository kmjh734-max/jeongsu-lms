import type { ListeningDifficultyTier } from "@/lib/listening/exam-difficulty";
import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
import type { ExamTypeTemplate } from "@/lib/listening/exam-type-template";
import { HIGH1_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-high1";
import { MIDDLE1_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-middle1";
import { MIDDLE2_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-middle2";
import { MIDDLE3_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-middle3";

export type { ExamTypeTemplate } from "@/lib/listening/exam-type-template";
export { HIGH1_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-high1";
export { MIDDLE1_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-middle1";
export { MIDDLE2_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-middle2";
export { MIDDLE3_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-middle3";

export function getExamTypesForGrade(grade: ListeningGradeLevel): ExamTypeTemplate[] {
  if (grade === "high1") return HIGH1_LISTENING_EXAM_TYPES;
  if (grade === "middle3") return MIDDLE3_LISTENING_EXAM_TYPES;
  if (grade === "middle2") return MIDDLE2_LISTENING_EXAM_TYPES;
  return MIDDLE1_LISTENING_EXAM_TYPES;
}

export function getExamTypeById(
  id: number,
  grade: ListeningGradeLevel = "middle1"
): ExamTypeTemplate | undefined {
  return getExamTypesForGrade(grade).find((t) => t.id === id);
}

/** 5→1~5, 10→1~10, 20→1~20 고정 순서 */
export function resolveExamTypesForGeneration(
  count: number,
  selectedTypeIds?: number[],
  grade: ListeningGradeLevel = "middle1"
): ExamTypeTemplate[] {
  const allTypes = getExamTypesForGrade(grade);
  if (selectedTypeIds && selectedTypeIds.length > 0) {
    const picked = selectedTypeIds
      .map((id) => getExamTypeById(id, grade))
      .filter((t): t is ExamTypeTemplate => t !== undefined)
      .sort((a, b) => a.id - b.id);
    const maxN = allTypes.length;
    if (picked.length === 0) {
      return allTypes.slice(0, Math.min(count, maxN));
    }
    if (picked.length >= count) {
      return picked.slice(0, count);
    }
    const result = [...picked];
    for (const t of allTypes) {
      if (result.length >= count) break;
      if (!result.some((r) => r.id === t.id)) result.push(t);
    }
    return result.slice(0, count);
  }
  return allTypes.slice(0, Math.min(count, allTypes.length));
}

export function tierLabel(tier: ListeningDifficultyTier): string {
  const map: Record<ListeningDifficultyTier, string> = {
    foundation: "기초",
    standard: "보통",
    applied: "심화",
    advanced: "고난도",
  };
  return map[tier];
}
