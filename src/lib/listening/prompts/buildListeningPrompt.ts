import {
  buildDifficultyPromptBlock,
  type ListeningDifficultyMode,
} from "@/lib/listening/exam-difficulty";
import type { ExamTypeTemplate } from "@/lib/listening/exam-types";
import {
  COMMON_PROMPT,
  COPYRIGHT_BLOCK,
  JSON_OUTPUT_SCHEMA,
} from "@/lib/listening/prompts/commonPrompt";
import { getAllTypePromptBlocks } from "@/lib/listening/prompts/typePrompts";
import { QUALITY_CHECK_CRITERIA } from "@/lib/listening/prompts/qualityCheckPrompt";

/**
 * 단일 유형 또는 여러 유형 시험 모드 최종 프롬프트
 */
export function buildListeningExamPrompt(
  types: ExamTypeTemplate[],
  difficultyMode: ListeningDifficultyMode
): string {
  const typeIds = types.map((t) => t.id);
  const difficultyBlock = buildDifficultyPromptBlock(types, difficultyMode);

  return `
${COMMON_PROMPT}

${COPYRIGHT_BLOCK}

이번 요청: 아래 ${types.length}개 유형을 순서대로 각 1문항씩 생성한다.
order_index는 유형 번호와 반드시 일치 (예: 1번 유형 → order_index 1).

난이도 (유형별):
${difficultyBlock}

${getAllTypePromptBlocks(typeIds)}

생성 후 스스로 검수:
${QUALITY_CHECK_CRITERIA}

${JSON_OUTPUT_SCHEMA}
`.trim();
}

/** 단일 유형 1문항 재생성 */
export function buildListeningSingleTypePrompt(
  type: ExamTypeTemplate,
  difficultyMode: ListeningDifficultyMode,
  previousProblems?: string[]
): string {
  const avoid =
    previousProblems && previousProblems.length > 0
      ? `\n이전 생성에서 발견된 문제(반드시 피할 것):\n${previousProblems.map((p) => `- ${p}`).join("\n")}\n같은 상황·문장·선택지 패턴을 반복하지 말 것.\n`
      : "";
  return `${buildListeningExamPrompt([type], difficultyMode)}${avoid}`;
}

/** 자유 생성 모드 (유형 미지정) */
export function buildListeningFreePrompt(count: number): string {
  return `
${COMMON_PROMPT}

${COPYRIGHT_BLOCK}

중1 듣기 문항 ${count}개를 자유 형식으로 생성한다.
각 문항은 서로 다른 일상 상황이어야 한다.
order_index는 1부터 순서대로.

${QUALITY_CHECK_CRITERIA}

${JSON_OUTPUT_SCHEMA}
`.trim();
}
