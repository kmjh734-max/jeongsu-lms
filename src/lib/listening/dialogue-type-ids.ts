import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
import { MIDDLE1_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types";
import { MIDDLE2_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-middle2";

/** 담화·단독 화자 유형 (M/W 교대 불필요) */
export function getMonologueTypeIds(gradeLevel?: ListeningGradeLevel): Set<number> {
  if (gradeLevel === "middle2") {
    return new Set([1, 10, 18, 17]);
  }
  if (gradeLevel === "middle1") {
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
    gradeLevel === "middle2"
      ? MIDDLE2_LISTENING_EXAM_TYPES
      : gradeLevel === "middle1"
        ? MIDDLE1_LISTENING_EXAM_TYPES
        : [...MIDDLE2_LISTENING_EXAM_TYPES, ...MIDDLE1_LISTENING_EXAM_TYPES];

  const t = types.find((x) => x.id === typeId);
  if (t?.segment_guide?.includes("M/W")) return true;
  if (t?.segment_guide?.toLowerCase().includes("monologue")) return false;
  if (instruction && /대화/.test(instruction)) return true;
  if (t?.instruction?.includes("대화")) return true;
  return false;
}

/** 중1 전용 type fix (같은 번호가 중2에서는 다른 유형) */
export function isMiddle1OnlyTypeFix(
  fixForTypeId: number,
  gradeLevel?: ListeningGradeLevel
): boolean {
  if (gradeLevel !== "middle2") return false;
  return fixForTypeId === 3 || fixForTypeId === 5 || fixForTypeId === 14;
}
