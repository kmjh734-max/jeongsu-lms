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
import { buildType1OnlyGenerationPrompt } from "@/lib/listening/prompts/type1DescribePrompt";
import { buildType2OnlyGenerationPrompt } from "@/lib/listening/prompts/type2PurchasePrompt";
import { buildType3OnlyGenerationPrompt } from "@/lib/listening/prompts/type3WeatherPrompt";
import { buildType4OnlyGenerationPrompt } from "@/lib/listening/prompts/type4IntentionPrompt";
import { buildType5OnlyGenerationPrompt } from "@/lib/listening/prompts/type5UnmentionedPrompt";
import { buildType6OnlyGenerationPrompt } from "@/lib/listening/prompts/type6TimePrompt";
import { buildType7OnlyGenerationPrompt } from "@/lib/listening/prompts/type7CareerPrompt";
import { buildType8OnlyGenerationPrompt } from "@/lib/listening/prompts/type8EmotionPrompt";
import { getAllTypePromptBlocks } from "@/lib/listening/prompts/typePrompts";
import { QUALITY_CHECK_CRITERIA } from "@/lib/listening/prompts/qualityCheckPrompt";

/**
 * 단일 유형 또는 여러 유형 시험 모드 최종 프롬프트
 */
export function buildListeningExamPrompt(
  types: ExamTypeTemplate[],
  difficultyMode: ListeningDifficultyMode
): string {
  if (types.length === 1 && types[0]!.id === 1) {
    return buildType1OnlyGenerationPrompt();
  }
  if (types.length === 1 && types[0]!.id === 2) {
    return buildType2OnlyGenerationPrompt();
  }
  if (types.length === 1 && types[0]!.id === 3) {
    return buildType3OnlyGenerationPrompt();
  }
  if (types.length === 1 && types[0]!.id === 4) {
    return buildType4OnlyGenerationPrompt();
  }
  if (types.length === 1 && types[0]!.id === 5) {
    return buildType5OnlyGenerationPrompt();
  }
  if (types.length === 1 && types[0]!.id === 6) {
    return buildType6OnlyGenerationPrompt();
  }
  if (types.length === 1 && types[0]!.id === 7) {
    return buildType7OnlyGenerationPrompt();
  }
  if (types.length === 1 && types[0]!.id === 8) {
    return buildType8OnlyGenerationPrompt();
  }

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
  if (type.id === 1) {
    return buildType1OnlyGenerationPrompt(previousProblems);
  }
  if (type.id === 2) {
    return buildType2OnlyGenerationPrompt(previousProblems);
  }
  if (type.id === 3) {
    return buildType3OnlyGenerationPrompt(previousProblems);
  }
  if (type.id === 4) {
    return buildType4OnlyGenerationPrompt(previousProblems);
  }
  if (type.id === 5) {
    return buildType5OnlyGenerationPrompt(previousProblems);
  }
  if (type.id === 6) {
    return buildType6OnlyGenerationPrompt(previousProblems);
  }
  if (type.id === 7) {
    return buildType7OnlyGenerationPrompt(previousProblems);
  }
  if (type.id === 8) {
    return buildType8OnlyGenerationPrompt(previousProblems);
  }
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
