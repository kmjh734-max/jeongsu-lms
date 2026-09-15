import type { ListeningDifficultyTier } from "@/lib/listening/exam-difficulty";
import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
import type { ExamTypeTemplate } from "@/lib/listening/exam-type-template";
import { HIGH1_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-high1";
import { HIGH2_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-high2";
import { HIGH3_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-high3";
import { MIDDLE1_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-middle1";
import { MIDDLE2_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-middle2";
import { MIDDLE3_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-middle3";

import {
  templateFromCatalog,
  withTemplateVariant,
} from "@/lib/listening/grade-exam-types";
import {
  resolveQuestionTypeKey,
  variantOfStoredQuestion,
  type TypedQuestionLike,
} from "@/lib/listening/legacy-type-map";
import { isListeningTypeKey, type ListeningTypeKey } from "@/lib/listening/type-catalog";

export type { ExamTypeTemplate } from "@/lib/listening/exam-type-template";
export { examTypeCode } from "@/lib/listening/exam-type-template";
export { HIGH1_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-high1";
export { HIGH2_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-high2";
export { HIGH3_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-high3";
export { MIDDLE1_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-middle1";
export { MIDDLE2_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-middle2";
export { MIDDLE3_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-middle3";

export function getExamTypesForGrade(grade: ListeningGradeLevel): ExamTypeTemplate[] {
  if (grade === "high3") return HIGH3_LISTENING_EXAM_TYPES;
  if (grade === "high2") return HIGH2_LISTENING_EXAM_TYPES;
  if (grade === "high1") return HIGH1_LISTENING_EXAM_TYPES;
  if (grade === "middle3") return MIDDLE3_LISTENING_EXAM_TYPES;
  if (grade === "middle2") return MIDDLE2_LISTENING_EXAM_TYPES;
  return MIDDLE1_LISTENING_EXAM_TYPES;
}

/** 학년 배치표의 번호(문항 번호)로 유형 템플릿 — 번호 = 유형이 아니다(중2·중3) */
export function getExamTypeById(
  id: number,
  grade: ListeningGradeLevel = "middle1"
): ExamTypeTemplate | undefined {
  return getExamTypesForGrade(grade).find((t) => t.id === id);
}

/**
 * 유형 키로 템플릿 (지금 학년 배치표에 없는 유형도 — 예전 배치로 만든 문항을 다시 만들 때).
 * position은 새 템플릿의 번호(문항 번호).
 */
export function templateForKey(
  key: ListeningTypeKey,
  grade: ListeningGradeLevel,
  position: number
): ExamTypeTemplate {
  const inGrade = getExamTypesForGrade(grade).find((t) => t.key === key);
  if (inGrade) return { ...inGrade, id: position };
  return templateFromCatalog(key, position, { grade });
}

/**
 * 생성 슬롯 → 템플릿. typeKey가 있으면 그 유형(배치표 밖 유형 가능), 없으면 배치표 번호(typeId).
 * variant를 주면 지시문·모듈 번호에 반영한다.
 */
export function templateForSlot(
  slot: { typeId: number; slotIndex: number; typeKey?: ListeningTypeKey; variant?: string },
  grade: ListeningGradeLevel,
  variant?: string
): ExamTypeTemplate | undefined {
  // 요청 본문에서 온 슬롯일 수 있어 알 수 없는 키는 무시하고 번호로 찾는다
  const base =
    slot.typeKey && isListeningTypeKey(slot.typeKey)
      ? templateForKey(slot.typeKey, grade, slot.typeId)
      : getExamTypeById(slot.typeId, grade);
  if (!base) return undefined;
  return withTemplateVariant(base, variant ?? slot.variant, grade);
}

/**
 * 저장된 문항 → 유형 템플릿 (이름·지시문으로 유형을 정하고, 응답 방향 등 변형도 문항에서 읽는다).
 * 번호로 찾으면(getExamTypeById(order_index)) 중2·중3의 예전 세트(중1 배치)와 새 세트가 서로 다른 유형이 된다.
 */
export function templateForStoredQuestion(
  q: TypedQuestionLike & { order_index: number; choices?: string[] | null },
  grade: ListeningGradeLevel
): ExamTypeTemplate | undefined {
  const key = resolveQuestionTypeKey(q, grade);
  if (!key) return getExamTypeById(q.order_index, grade);
  return withTemplateVariant(templateForKey(key, grade, q.order_index), variantOfStoredQuestion(key, q), grade);
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
