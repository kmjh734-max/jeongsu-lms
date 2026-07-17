import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
import { isHighSchoolListeningGrade } from "@/lib/listening/grade-level";
import { HIGH1_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-high1";
import { HIGH2_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-high2";
import { MIDDLE1_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types";
import { MIDDLE2_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-middle2";
import { MIDDLE3_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-middle3";

/** 담화·단독 화자 유형 (M/W 교대 불필요) */
export function getMonologueTypeIds(gradeLevel?: ListeningGradeLevel): Set<number> {
  if (isHighSchoolListeningGrade(gradeLevel)) {
    return new Set([1, 3, 9, 15, 16, 17]);
  }
  if (
    gradeLevel === "middle3" ||
    gradeLevel === "middle2" ||
    gradeLevel === "middle1"
  ) {
    return new Set([1, 3, 5, 14]);
  }
  return new Set([1, 3, 5, 10, 14, 17, 18]);
}

export function isDialogueExamType(
  typeId: number,
  gradeLevel?: ListeningGradeLevel,
  instruction?: string
): boolean {
  if (getMonologueTypeIds(gradeLevel).has(typeId)) return false;

  const types =
    gradeLevel === "high2"
      ? HIGH2_LISTENING_EXAM_TYPES
      : gradeLevel === "high1"
        ? HIGH1_LISTENING_EXAM_TYPES
        : gradeLevel === "middle2"
          ? MIDDLE2_LISTENING_EXAM_TYPES
          : gradeLevel === "middle3"
            ? MIDDLE3_LISTENING_EXAM_TYPES
            : gradeLevel === "middle1"
              ? MIDDLE1_LISTENING_EXAM_TYPES
              : [
                  ...HIGH2_LISTENING_EXAM_TYPES,
                  ...HIGH1_LISTENING_EXAM_TYPES,
                  ...MIDDLE2_LISTENING_EXAM_TYPES,
                  ...MIDDLE1_LISTENING_EXAM_TYPES,
                ];

  const t = types.find((x) => x.id === typeId);
  if (t?.segment_guide?.includes("M/W")) return true;
  if (t?.segment_guide?.toLowerCase().includes("monologue")) return false;
  if (instruction && /대화/.test(instruction)) return true;
  if (t?.instruction?.includes("대화")) return true;
  return false;
}

/** @deprecated */
export function isMiddle1OnlyTypeFix(
  _fixForTypeId: number,
  _gradeLevel?: ListeningGradeLevel
): boolean {
  return false;
}
