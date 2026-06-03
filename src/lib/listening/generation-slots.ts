import type { ExamTypeTemplate } from "@/lib/listening/exam-types";

export interface ListeningGenerationSlot {
  typeId: number;
  slotIndex: number;
}

/** 문항 수·유형 선택에 따른 생성 계획 */
export function planGenerationSlots(opts: {
  questionCount: number;
  selectedTypeIds: number[];
  examTypes: ExamTypeTemplate[];
}): ListeningGenerationSlot[] {
  const { questionCount, selectedTypeIds, examTypes } = opts;
  const count = Math.min(Math.max(questionCount, 1), 20);

  if (selectedTypeIds.length === 1) {
    const typeId = selectedTypeIds[0]!;
    return Array.from({ length: count }, (_, i) => ({
      typeId,
      slotIndex: i + 1,
    }));
  }

  const typeIds =
    selectedTypeIds.length > 0
      ? selectedTypeIds.slice(0, count)
      : examTypes.slice(0, count).map((t) => t.id);

  return typeIds.map((typeId, i) => ({
    typeId,
    slotIndex: i + 1,
  }));
}
