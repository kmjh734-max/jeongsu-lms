import type { ExamTypeTemplate } from "@/lib/listening/exam-type-template";
import {
  HIGH1_LISTENING_EXAM_TYPES,
  withScriptTarget,
} from "@/lib/listening/exam-types-high1";

/**
 * 고2 전국연합학력평가 영어 듣기 1~17번
 * — 유형·지시문·형식은 고1(수능형)과 동일. 난이도만 고2 기출 대본 수준.
 */
export const HIGH2_LISTENING_EXAM_TYPES: ExamTypeTemplate[] =
  HIGH1_LISTENING_EXAM_TYPES.map((t) => {
    return {
      ...withScriptTarget(t, "high2"),
      format_guide: `${t.format_guide} Match 고2 전국연합 script density (slightly longer sentences, more supporting detail than 고1).`,
    };
  });

export function getHigh2ExamTypeById(id: number): ExamTypeTemplate | undefined {
  return HIGH2_LISTENING_EXAM_TYPES.find((t) => t.id === id);
}
