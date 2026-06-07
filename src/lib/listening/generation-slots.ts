import type { ExamTypeTemplate } from "@/lib/listening/exam-types";

export interface ListeningGenerationSlot {
  typeId: number;
  slotIndex: number;
}

export type ListeningGenerationPlanMode = "random" | "custom";

function clampQuestionCount(questionCount: number): number {
  return Math.min(Math.max(questionCount, 1), 20);
}

/** 랜덤 생성: 1번 유형부터 문항 수만큼 순서대로 배정 (5→1~5, 20→1~20) */
export function planRandomGenerationSlots(opts: {
  questionCount: number;
  examTypes: ExamTypeTemplate[];
}): ListeningGenerationSlot[] {
  return planCustomGenerationSlots({
    questionCount: opts.questionCount,
    selectedTypeIds: [],
    examTypes: opts.examTypes,
  });
}

/** 유형 선택: 비우면 1~N번 순서, 1개만 고르면 같은 유형 N문항, 여러 개면 선택 순서대로(최대 N) */
export function planCustomGenerationSlots(opts: {
  questionCount: number;
  selectedTypeIds: number[];
  examTypes: ExamTypeTemplate[];
}): ListeningGenerationSlot[] {
  const { questionCount, selectedTypeIds, examTypes } = opts;
  const count = clampQuestionCount(questionCount);

  if (selectedTypeIds.length === 1) {
    const typeId = selectedTypeIds[0]!;
    return Array.from({ length: count }, (_, i) => ({
      typeId,
      slotIndex: i + 1,
    }));
  }

  let typeIds: number[];
  if (selectedTypeIds.length > 0) {
    if (selectedTypeIds.length >= count) {
      typeIds = selectedTypeIds.slice(0, count);
    } else {
      typeIds = Array.from(
        { length: count },
        (_, i) => selectedTypeIds[i % selectedTypeIds.length]!
      );
    }
  } else {
    typeIds = examTypes.slice(0, count).map((t) => t.id);
  }

  return typeIds.map((typeId, i) => ({
    typeId,
    slotIndex: i + 1,
  }));
}

/** @deprecated planCustomGenerationSlots / planRandomGenerationSlots 사용 */
export function planGenerationSlots(opts: {
  questionCount: number;
  selectedTypeIds: number[];
  examTypes: ExamTypeTemplate[];
}): ListeningGenerationSlot[] {
  return planCustomGenerationSlots(opts);
}
