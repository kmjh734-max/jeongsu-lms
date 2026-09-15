/**
 * 중2·중3 유형 규칙 블록.
 * 중2·중3은 번호 배치가 중1과 달라(grade-blueprints.ts) "중1 N번과 동일"이 아니다.
 * 옛 모듈이 있는 유형(모듈 번호 1~20)은 중1 유형 블록에 학년별 차이를 덧붙이고,
 * 새 유형(21~)은 카탈로그 블록(catalogTypePrompts.ts)을 쓴다.
 */
import {
  buildCatalogTypeOnlyGenerationPrompt,
  getCatalogTypePromptBlock,
} from "@/lib/listening/prompts/catalogTypePrompts";
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
import { getTypePromptBlock } from "@/lib/listening/prompts/typePrompts";
import { getTypeDef, keyForCode } from "@/lib/listening/type-catalog";

type UpperMiddle = "middle2" | "middle3";

const LEGACY_BUILDERS: Record<number, (previousProblems?: string[]) => string> = {
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

export const UPPER_MIDDLE_LEVEL_NOTE: Record<UpperMiddle, string> = {
  middle2: `
[중2 — 2026 시·도교육청 중2 영어듣기평가 배치]
- 문항 번호와 유형은 중1과 다르다. 각 문항은 위 [문항 번호] 목록의 유형 이름·유형 블록만 따른다.
- 유형 블록 안의 "N번"·"order_index는 반드시 N"·"6~8턴" 같은 문구는 중1 기준이다 — order_index는 문항 번호, 분량·턴 수는 [유형별 분량·설계]를 따른다.
- 한 턴 1~2문장(문장당 5~8단어). 중2는 연습용으로 기출보다 턴·정보를 약간 더 넣는다(문장을 길게 늘이지 않는다).
- 중2 대화 문항(응답 제외)은 9~11턴이고 대부분의 턴을 두 문장(짧은 반응·질문 + 정보·이유)으로 채워 총 75단어 이상이어야 한다.
  6단어짜리 한 문장 턴 10개(약 60단어)는 분량 미달이다. 다 쓴 뒤 단어 수를 세어 확인한다.
`.trim(),
  middle3: `
[중3 — 2023~2026 시·도교육청 중3 영어듣기평가 배치(8회 모두 같은 20자리)]
- 문항 번호와 유형은 중1과 다르다. 각 문항은 위 [문항 번호] 목록의 유형 이름·유형 블록만 따른다.
- 유형 블록 안의 "N번"·"order_index는 반드시 N"·"6~8턴" 같은 문구는 중1 기준이다 — order_index는 문항 번호, 분량·턴 수는 [유형별 분량·설계]를 따른다.
- 한 턴 1~3문장(문장당 6~9단어). 전화·안내 방송·행사 설명·쇼핑·일정 조율·결제 계산 등 기출과 비슷한 정보량.
`.trim(),
};

/** 중2·중3 응답 문항 공통 (옛 19·20번 모듈의 "5~7턴"보다 우선) */
const UPPER_RESPONSE_RULE =
  "대화는 [유형별 분량·설계]의 턴·단어 수(중2 7~10턴, 중3 7~9턴)로 쓴다 — 유형 블록의 5~7턴보다 우선. 마지막 말은 평서문(소식·걱정·계획)이나 의문사 의문문으로 끝낸다(Can/Could you …? 부탁으로 끝내고 수락이 정답인 구조 금지). 오답 4개는 모두 대화 소재를 쓴 그럴듯한 영어 문장이다: 2개는 대본 단어를 빌렸지만 맥락이 어긋난 함정, 2개는 기능이 어긋난 응답(대화와 무관한 문장·황당한 문장 금지).";

/** 옛 모듈(중1 기준 규칙)을 중2·중3에 쓸 때 달라지는 점 */
const GRADE_NOTES: Record<UpperMiddle, Partial<Record<number, string>>> = {
  middle2: {
    2: "중2 그림 선택: 조건(속성) 2~3개를 하나씩 정하고 한 번 바꾼다. 지시문 변형(구입할/주문할/만든)이 배정되면 그 지시문.",
    3: "중2 날씨: 지역·시점 3~4개를 차례로 말하는 예보 담화.",
    12: "중2 이유: 장소에 가는 이유에 한정하지 않는다 — 지시문 「대화를 듣고, ○○가 ○○한(하는) 이유로 가장 적절한 것을 고르시오.」(예: 동아리 모임에 늦은 이유, 잠을 설친 이유). 장소가 없으면 target_place는 비워 둔다. 상대가 이유를 한 번 잘못 추측한 뒤 진짜 이유가 나온다. 마지막에 이유를 정리해 되풀이하지 않는다(\"So you came to …\" 금지).",
    13: "중2 장소: 장소 이름을 말하지 않고 서비스·물건 단서 2~3개로 추론.",
    19: `중2 응답: 19·20번 두 문항은 같은 방향(배정된 지시문)이다. ${UPPER_RESPONSE_RULE} 응답 선택지 4~8단어.`,
    20: `중2 응답: 19·20번 두 문항은 같은 방향(배정된 지시문)이다. ${UPPER_RESPONSE_RULE} 응답 선택지 4~8단어.`,
  },
  middle3: {
    2: "중3 그림 선택: 대화 7~9턴. 속성 3개(무늬·모양·글자·위치 등)를 하나씩 확정하고 한 번 번복, \"필요 없다\" 같은 부정 응답 함정 하나. 지시문 변형(구입할/주문할/만든)이 배정되면 그 지시문.",
    5: "중3 언급X(담화): 지시문 「다음을 듣고, ○○에 대해 언급되지 않은 것을 고르시오.」 ○○는 인물·행사·장소(영어 이름 그대로). 화자는 소개하는 사람 한 명.",
    6: "중3 시각: 후보 시각 2~3개가 오가고, 마지막 시각은 상대 계산 한 번으로 정한다(예: \"문 열기 10분 전\", \"수업 끝나고 30분 뒤\"). 계산으로 정한 시각을 마지막에 숫자로 다시 말하지 않는다(\"So, see you then.\" 정도). 지시문 변형(만나기로 한/시작하는/예약한 시각)이 배정되면 그 지시문.",
    9: "중3 직후 할 일: 할 일이 여러 개 나오고 \"지금\" 할 일은 하나. 나중에 할 일·상대가 할 일이 오답.",
    15: "중3 부탁: 앞에서 다른 부탁이 거절되거나 이미 해결된 뒤 진짜 부탁이 나온다.",
    19: `중3 응답: 지시문 「대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.」 형식(17번은 남→여, 18·19번은 여→남). ${UPPER_RESPONSE_RULE} 응답 선택지 4~9단어.`,
    20: `중3 응답: 지시문 「대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.」 형식. ${UPPER_RESPONSE_RULE} 응답 선택지 4~9단어.`,
  },
};

function newTypeKey(code: number) {
  return code > 20 ? keyForCode(code, "middle") : undefined;
}

/** 일괄 생성용 — 유형 블록 1개 (모듈 번호 기준) */
export function getUpperMiddleTypePromptBlockForExam(grade: UpperMiddle, code: number): string {
  const key = newTypeKey(code);
  if (key) return getCatalogTypePromptBlock(key);
  const block = getTypePromptBlock(code);
  if (!block) return "";
  const legacyKey = keyForCode(code, "middle");
  const label = legacyKey ? getTypeDef(legacyKey).label : "";
  const note = GRADE_NOTES[grade][code];
  return `
### ${label ? `${label} — ` : ""}유형 ${code} 규칙 (중1 모듈을 ${grade === "middle3" ? "중3" : "중2"} 수준으로)
${block}${note ? `\n${grade === "middle3" ? "[중3 차이]" : "[중2 차이]"} ${note}` : ""}
`.trim();
}

export function getAllUpperMiddleTypePromptBlocks(grade: UpperMiddle, codes: number[]): string {
  const unique = [...new Set(codes)];
  const blocks = unique.map((c) => getUpperMiddleTypePromptBlockForExam(grade, c)).filter(Boolean);
  if (blocks.length === 0) return "";
  return `${blocks.join("\n\n")}\n\n${UPPER_MIDDLE_LEVEL_NOTE[grade]}`;
}

/** 단일 유형 1문항 */
export function buildUpperMiddleTypeOnlyGenerationPrompt(
  grade: UpperMiddle,
  code: number,
  previousProblems?: string[]
): string {
  const key = newTypeKey(code);
  const note = GRADE_NOTES[grade][code];
  let core: string;
  if (key) {
    core = buildCatalogTypeOnlyGenerationPrompt(key, previousProblems);
  } else {
    const build = LEGACY_BUILDERS[code];
    if (!build) throw new Error(`${grade === "middle3" ? "중3" : "중2"} 유형 ${code}을 찾을 수 없습니다.`);
    core = build(previousProblems);
  }
  return `
${UPPER_MIDDLE_LEVEL_NOTE[grade]}${note ? `\n${note}` : ""}

${core}
`.trim();
}
