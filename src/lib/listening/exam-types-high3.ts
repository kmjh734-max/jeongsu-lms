import type { ExamTypeTemplate } from "@/lib/listening/exam-type-template";
import {
  HIGH1_LISTENING_EXAM_TYPES,
  withScriptTarget,
} from "@/lib/listening/exam-types-high1";

/**
 * 고3 전국연합학력평가 영어 듣기 1~17번
 * — 유형·지시문·형식은 고1(수능형)과 동일. 난이도만 고3 기출 대본 수준.
 */
export const HIGH3_LISTENING_EXAM_TYPES: ExamTypeTemplate[] =
  HIGH1_LISTENING_EXAM_TYPES.map((t) => {
    return {
      ...withScriptTarget(t, "high3"),
      format_guide: `${t.format_guide} Match 고3 전국연합 / CSAT-prep listening density (longer supporting reasons, clearer multi-step filters than 고2).`,
    };
  });

export function getHigh3ExamTypeById(id: number): ExamTypeTemplate | undefined {
  return HIGH3_LISTENING_EXAM_TYPES.find((t) => t.id === id);
}
