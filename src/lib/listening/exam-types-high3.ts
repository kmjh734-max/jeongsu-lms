import type { ExamTypeTemplate } from "@/lib/listening/exam-type-template";
import { HIGH1_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-high1";

/**
 * 고3 전국연합학력평가 영어 듣기 1~17번
 * — 유형·지시문·형식은 고1(수능형)과 동일. 난이도만 고3 기출 대본 수준.
 */
export const HIGH3_LISTENING_EXAM_TYPES: ExamTypeTemplate[] =
  HIGH1_LISTENING_EXAM_TYPES.map((t) => {
    const bump =
      t.id <= 5
        ? " Total script target 100~155 words (고3: denser than 고2)."
        : t.id <= 10
          ? " Total script target 115~175 words (고3)."
          : t.id <= 15
            ? " Total script target 90~185 words (고3 pragmatic + academic tone)."
            : " Total script target 130~195 words (고3 topical list monologue).";
    return {
      ...t,
      segment_guide: `${t.segment_guide}${bump}`,
      format_guide: `${t.format_guide} Match 고3 전국연합 / CSAT-prep listening density (longer supporting reasons, clearer multi-step filters than 고2).`,
    };
  });

export function getHigh3ExamTypeById(id: number): ExamTypeTemplate | undefined {
  return HIGH3_LISTENING_EXAM_TYPES.find((t) => t.id === id);
}
