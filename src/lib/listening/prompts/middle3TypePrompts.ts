import {
  buildUpperMiddleTypeOnlyGenerationPrompt,
  getAllUpperMiddleTypePromptBlocks,
  getUpperMiddleTypePromptBlockForExam,
  UPPER_MIDDLE_LEVEL_NOTE,
} from "@/lib/listening/prompts/upperMiddleTypePrompts";

/** 중3 배치(2023~2026 공식 8회 동일) 안내 — 번호와 유형은 중1과 다르다 */
export const MIDDLE3_SCRIPT_LEVEL_NOTE = UPPER_MIDDLE_LEVEL_NOTE.middle3;

/** 중3 단일 유형 1문항 (typeId = 유형 모듈 번호) */
export function buildMiddle3TypeOnlyGenerationPrompt(
  typeId: number,
  previousProblems?: string[]
): string {
  return buildUpperMiddleTypeOnlyGenerationPrompt("middle3", typeId, previousProblems);
}

/** 일괄 생성용 유형 블록 1개 (typeId = 유형 모듈 번호) */
export function getMiddle3TypePromptBlockForExam(typeId: number): string {
  return getUpperMiddleTypePromptBlockForExam("middle3", typeId);
}

export function getAllMiddle3TypePromptBlocks(typeIds: number[]): string {
  return getAllUpperMiddleTypePromptBlocks("middle3", typeIds);
}
