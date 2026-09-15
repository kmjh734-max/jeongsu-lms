import {
  buildUpperMiddleTypeOnlyGenerationPrompt,
  getAllUpperMiddleTypePromptBlocks,
  getUpperMiddleTypePromptBlockForExam,
  UPPER_MIDDLE_LEVEL_NOTE,
} from "@/lib/listening/prompts/upperMiddleTypePrompts";

/** 중2 배치(2026 공식 형식) 안내 — 번호와 유형은 중1과 다르다 */
export const MIDDLE2_HARDER_NOTE = UPPER_MIDDLE_LEVEL_NOTE.middle2;

/** 중2 단일 유형 1문항 (typeId = 유형 모듈 번호) */
export function buildMiddle2TypeOnlyGenerationPrompt(
  typeId: number,
  previousProblems?: string[]
): string {
  return buildUpperMiddleTypeOnlyGenerationPrompt("middle2", typeId, previousProblems);
}

/** 일괄 생성용 유형 블록 1개 (typeId = 유형 모듈 번호) */
export function getMiddle2TypePromptBlockForExam(typeId: number): string {
  return getUpperMiddleTypePromptBlockForExam("middle2", typeId);
}

export function getAllMiddle2TypePromptBlocks(typeIds: number[]): string {
  return getAllUpperMiddleTypePromptBlocks("middle2", typeIds);
}
