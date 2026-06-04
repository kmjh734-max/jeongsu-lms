import type { ExamTypeTemplate } from "@/lib/listening/exam-types";

export interface ListeningGenerationSlot {
  typeId: number;
  slotIndex: number;
}

export type ListeningGenerationPlanMode = "random" | "custom";

function clampQuestionCount(questionCount: number): number {
  return Math.min(Math.max(questionCount, 1), 20);
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/** 랜덤: 학년 유형 풀에서 문항 수만큼 유형을 무작위 배정 (슬롯 1~N) */
export function planRandomGenerationSlots(opts: {
  questionCount: number;
  examTypes: ExamTypeTemplate[];
}): ListeningGenerationSlot[] {
  const count = clampQuestionCount(opts.questionCount);
  const pool = opts.examTypes.map((t) => t.id);
  if (pool.length === 0) return [];

  const shuffled = shuffleInPlace([...pool]);
  return Array.from({ length: count }, (_, i) => ({
    typeId: shuffled[i % shuffled.length]!,
    slotIndex: i + 1,
  }));
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
