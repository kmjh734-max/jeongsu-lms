import {
  COMMON_PROMPT_HIGH3,
  HIGH3_COPYRIGHT_BLOCK,
  HIGH3_JSON_OUTPUT_SCHEMA,
} from "@/lib/listening/prompts/commonPromptHigh3";
import {
  getAllHigh1TypePromptBlocks,
  getHigh1TypePromptBlock,
} from "@/lib/listening/prompts/high1TypePrompts";

export const HIGH3_HARDER_NOTE = `
[고3 — 고1·고2와 동일 17유형, 대본 밀도·추론만 상향]
- 유형 번호·지시문·출제 형식은 고1 수능형과 동일하다.
- 2025·2026 고3 전국연합 듣기 대본처럼 고2보다 근거·조건·예시를 더 촘촘히 넣는다.
- 목적/의견/요지는 단순 주장만이 아니라 짧은 이유·반례·연구/상식 한 줄이 자연스럽게 붙는다.
`.trim();

export function getHigh3TypePromptBlock(typeId: number): string {
  const block = getHigh1TypePromptBlock(typeId);
  if (!block) return "";
  return `${block}\n${HIGH3_HARDER_NOTE}`;
}

export function getAllHigh3TypePromptBlocks(typeIds: number[]): string {
  const base = getAllHigh1TypePromptBlocks(typeIds);
  if (!base) return "";
  return `${base}\n\n${HIGH3_HARDER_NOTE}`;
}

export function buildHigh3TypeOnlyGenerationPrompt(
  typeId: number,
  previousProblems?: string[]
): string {
  const block = getHigh3TypePromptBlock(typeId);
  if (!block) {
    throw new Error(`고3 유형 ${typeId}을 찾을 수 없습니다.`);
  }
  const avoid =
    previousProblems && previousProblems.length > 0
      ? `\n이전 문항과 소재·표현 중복 금지:\n- ${previousProblems.slice(0, 8).join("\n- ")}`
      : "";

  return `
${COMMON_PROMPT_HIGH3}

${HIGH3_COPYRIGHT_BLOCK}

${HIGH3_HARDER_NOTE}

이번 요청: 고3 듣기 유형 ${typeId}번만 1문항 생성. order_index=${typeId}.
고1과 동일 유형 형식, 대본만 고3 밀도. 다른 번호 유형 금지.
${avoid}

${block}

${HIGH3_JSON_OUTPUT_SCHEMA}
`.trim();
}
