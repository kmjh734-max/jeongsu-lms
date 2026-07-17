import {
  COMMON_PROMPT_HIGH2,
  HIGH2_COPYRIGHT_BLOCK,
  HIGH2_JSON_OUTPUT_SCHEMA,
} from "@/lib/listening/prompts/commonPromptHigh2";
import {
  getAllHigh1TypePromptBlocks,
  getHigh1TypePromptBlock,
} from "@/lib/listening/prompts/high1TypePrompts";

export const HIGH2_HARDER_NOTE = `
[고2 — 고1과 동일 17유형, 대본 밀도만 상향]
- 유형 번호·지시문·출제 형식은 고1 수능형과 동일하다.
- 문장·정보량을 2025 고2 전국연합 듣기 대본에 맞게 고1보다 약간 더 길고 밀도 있게 작성한다.
- 원인·결과·조건·세부 사실을 자연스럽게 1~2문장 더 포함한다.
`.trim();

export function getHigh2TypePromptBlock(typeId: number): string {
  const block = getHigh1TypePromptBlock(typeId);
  if (!block) return "";
  return `${block}\n${HIGH2_HARDER_NOTE}`;
}

export function getAllHigh2TypePromptBlocks(typeIds: number[]): string {
  const base = getAllHigh1TypePromptBlocks(typeIds);
  if (!base) return "";
  return `${base}\n\n${HIGH2_HARDER_NOTE}`;
}

export function buildHigh2TypeOnlyGenerationPrompt(
  typeId: number,
  previousProblems?: string[]
): string {
  const block = getHigh2TypePromptBlock(typeId);
  if (!block) {
    throw new Error(`고2 유형 ${typeId}을 찾을 수 없습니다.`);
  }
  const avoid =
    previousProblems && previousProblems.length > 0
      ? `\n이전 문항과 소재·표현 중복 금지:\n- ${previousProblems.slice(0, 8).join("\n- ")}`
      : "";

  return `
${COMMON_PROMPT_HIGH2}

${HIGH2_COPYRIGHT_BLOCK}

${HIGH2_HARDER_NOTE}

이번 요청: 고2 듣기 유형 ${typeId}번만 1문항 생성. order_index=${typeId}.
고1과 동일 유형 형식, 대본만 고2 밀도. 다른 번호 유형 금지.
${avoid}

${block}

${HIGH2_JSON_OUTPUT_SCHEMA}
`.trim();
}
