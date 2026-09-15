import type { ExamTypeTemplate } from "@/lib/listening/exam-types";
import type { ListeningTypeKey } from "@/lib/listening/type-catalog";

export interface ListeningGenerationSlot {
  /** 학년 배치표의 번호 (유형 템플릿을 찾는 번호 — 모듈 번호가 아님) */
  typeId: number;
  /** 문항 번호 (order_index) */
  slotIndex: number;
  /**
   * 유형 키를 직접 지정 (지금 학년 배치표에 없는 유형도 가능 — 예전 배치로 만든 문항을 다시 만들 때).
   * 있으면 typeId 대신 이 유형으로 만든다.
   */
  typeKey?: ListeningTypeKey;
  /** 지시문 변형 id. 없으면 생성 때 학년 비율대로 고르고, ""이면 기본 지시문 그대로 */
  variant?: string;
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
