import { buildType1OnlyGenerationPrompt } from "@/lib/listening/prompts/type1DescribePrompt";
import { buildType2OnlyGenerationPrompt } from "@/lib/listening/prompts/type2PurchasePrompt";
import { buildType3OnlyGenerationPrompt } from "@/lib/listening/prompts/type3WeatherPrompt";
import { buildType4OnlyGenerationPrompt } from "@/lib/listening/prompts/type4IntentionPrompt";
import { buildType5OnlyGenerationPrompt } from "@/lib/listening/prompts/type5UnmentionedPrompt";
import { buildType6OnlyGenerationPrompt } from "@/lib/listening/prompts/type6TimePrompt";
import { buildType7OnlyGenerationPrompt } from "@/lib/listening/prompts/type7CareerPrompt";
import { buildType8OnlyGenerationPrompt } from "@/lib/listening/prompts/type8EmotionPrompt";
import { buildType9OnlyGenerationPrompt } from "@/lib/listening/prompts/type9ImmediateActionPrompt";
import { buildType10OnlyGenerationPrompt } from "@/lib/listening/prompts/type10MainContentPrompt";
import { buildType11OnlyGenerationPrompt } from "@/lib/listening/prompts/type11TransportPrompt";
import { buildType12OnlyGenerationPrompt } from "@/lib/listening/prompts/type12ReasonPrompt";
import { buildType13OnlyGenerationPrompt } from "@/lib/listening/prompts/type13PlacePrompt";
import { buildType14OnlyGenerationPrompt } from "@/lib/listening/prompts/type14TablePrompt";
import { buildType15OnlyGenerationPrompt } from "@/lib/listening/prompts/type15RequestPrompt";
import { buildType16OnlyGenerationPrompt } from "@/lib/listening/prompts/type16SuggestionPrompt";
import { buildType17OnlyGenerationPrompt } from "@/lib/listening/prompts/type17SchedulePrompt";
import { buildType18OnlyGenerationPrompt } from "@/lib/listening/prompts/type18JobPrompt";
import { buildType19OnlyGenerationPrompt } from "@/lib/listening/prompts/type19ResponsePrompt";
import { buildType20OnlyGenerationPrompt } from "@/lib/listening/prompts/type20ResponsePrompt";
import {
  getAllTypePromptBlocks,
  getTypePromptBlock,
} from "@/lib/listening/prompts/typePrompts";

export const MIDDLE2_HARDER_NOTE = `
[중2 — 중1과 동일 유형, 난이도만 약간 상향]
- 유형 번호 1~20은 중1 전국 영어듣기평가와 동일한 유형·지시문·출제 형식이다.
- 문장당 9~16단어, 대화 7~10턴, 대본 75~115단어 목표.
`.trim();

const TYPE_BUILDERS: Record<
  number,
  (previousProblems?: string[]) => string
> = {
  1: buildType1OnlyGenerationPrompt,
  2: buildType2OnlyGenerationPrompt,
  3: buildType3OnlyGenerationPrompt,
  4: buildType4OnlyGenerationPrompt,
  5: buildType5OnlyGenerationPrompt,
  6: buildType6OnlyGenerationPrompt,
  7: buildType7OnlyGenerationPrompt,
  8: buildType8OnlyGenerationPrompt,
  9: buildType9OnlyGenerationPrompt,
  10: buildType10OnlyGenerationPrompt,
  11: buildType11OnlyGenerationPrompt,
  12: buildType12OnlyGenerationPrompt,
  13: buildType13OnlyGenerationPrompt,
  14: buildType14OnlyGenerationPrompt,
  15: buildType15OnlyGenerationPrompt,
  16: buildType16OnlyGenerationPrompt,
  17: buildType17OnlyGenerationPrompt,
  18: buildType18OnlyGenerationPrompt,
  19: buildType19OnlyGenerationPrompt,
  20: buildType20OnlyGenerationPrompt,
};

/** 중2 단일 유형 1문항 — 중1과 동일 프롬프트 + 난이도 안내 */
export function buildMiddle2TypeOnlyGenerationPrompt(
  typeId: number,
  previousProblems?: string[]
): string {
  const build = TYPE_BUILDERS[typeId];
  if (!build) {
    throw new Error(`중2 유형 ${typeId}을 찾을 수 없습니다.`);
  }
  return `
${MIDDLE2_HARDER_NOTE}

${build(previousProblems)}
`.trim();
}

/** 일괄 생성용 — 중1 상세 유형 블록 + 중2 난이도 */
export function getMiddle2TypePromptBlockForExam(typeId: number): string {
  const block = getTypePromptBlock(typeId);
  if (!block) return "";
  return `
### 중2 유형 ${typeId} (= 중1 ${typeId}번과 동일)
${block}
${MIDDLE2_HARDER_NOTE}
`.trim();
}

export function getAllMiddle2TypePromptBlocks(typeIds: number[]): string {
  const unique = [...new Set(typeIds)];
  const blocks = getAllTypePromptBlocks(unique);
  if (!blocks) return "";
  return `${blocks}\n\n${MIDDLE2_HARDER_NOTE}`;
}
