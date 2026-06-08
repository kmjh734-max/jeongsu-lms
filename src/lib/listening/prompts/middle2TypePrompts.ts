import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
import {
  getCopyrightBlock,
  getJsonOutputSchema,
  getCommonPrompt,
} from "@/lib/listening/prompts/commonPrompt";
import { buildType2OnlyGenerationPrompt } from "@/lib/listening/prompts/type2PurchasePrompt";
import { buildType3OnlyGenerationPrompt } from "@/lib/listening/prompts/type3WeatherPrompt";
import { buildType4OnlyGenerationPrompt } from "@/lib/listening/prompts/type4IntentionPrompt";
import { buildType5OnlyGenerationPrompt } from "@/lib/listening/prompts/type5UnmentionedPrompt";
import { buildType8OnlyGenerationPrompt } from "@/lib/listening/prompts/type8EmotionPrompt";
import { buildType9OnlyGenerationPrompt } from "@/lib/listening/prompts/type9ImmediateActionPrompt";
import { buildType12OnlyGenerationPrompt } from "@/lib/listening/prompts/type12ReasonPrompt";
import { buildType13OnlyGenerationPrompt } from "@/lib/listening/prompts/type13PlacePrompt";
import { buildType14OnlyGenerationPrompt } from "@/lib/listening/prompts/type14TablePrompt";
import { buildType15OnlyGenerationPrompt } from "@/lib/listening/prompts/type15RequestPrompt";
import {
  buildType17OnlyGenerationPrompt,
  getType17PromptBlockForExam,
} from "@/lib/listening/prompts/type17SchedulePrompt";
import { buildType19OnlyGenerationPrompt } from "@/lib/listening/prompts/type19ResponsePrompt";
import { buildType20OnlyGenerationPrompt } from "@/lib/listening/prompts/type20ResponsePrompt";
import { QUALITY_CHECK_CRITERIA } from "@/lib/listening/prompts/qualityCheckPrompt";

const GRADE: ListeningGradeLevel = "middle2";

const MIDDLE2_HARDER_NOTE = `
[중2 난이도 — 2025·2026 전국 기출보다 약간 어렵게]
- 문장당 9~16단어, 대화 7~10턴, 대본 75~115단어
- 아래 유형 규칙에 "중1"이 있으면 중2 기준으로 해석한다.
`.trim();

/** M1 전용 프롬프트를 중2로 래핑 (order_index만 교체 지시) */
function wrapMiddle1TypePrompt(typeId: number, inner: string): string {
  return `
${MIDDLE2_HARDER_NOTE}

이번 문항 order_index는 반드시 ${typeId}이다.
question_type·instruction은 중2 ${typeId}번 유형에 맞게 출력한다.

${inner}
`.trim();
}

const TYPE4_PAST_ACTION = `
==================================================
중2 4번: 과거에 한 일 파악 (이 번호만 생성)
==================================================
지시문: 대화를 듣고, ○○가 (오늘 아침/어제/지난 주말)에 한 일로 가장 적절한 것을 고르시오.
- instruction에 시간 표현(오늘 아침, 어제, 지난 주말)을 명시한다.
- target_person, immediate_action(정답), mentioned_actions(오답 후보)
- M/W 7~10턴. 과거 시제·명확한 시간 단서
- choices: 한글 ~하기 5개
`.trim();

const TYPE7_ITEM = `
==================================================
중2 7번: 구입/가져올 물품 파악
==================================================
지시문: 대화를 듣고, ○○가 구입할/가져올 물건으로 가장 적절한 것을 고르시오.
- 기념품·연극 소품·준비물 등
- needs_image_choices: 상황에 따라 true 가능
- choices: 한글 명사 5개 또는 영어 물품명
`.trim();

const TYPE10_MONOLOGUE = `
==================================================
중2 10번: 담화 내용 파악
==================================================
지시문: 다음을 듣고, ○○가 하는 말의 내용으로 가장 적절한 것을 고르시오.
- M 또는 W 단독 담화 6~8문장 (대화 아님)
- 수업 안내, 대회 안내, 안전 교육, 행사 안내 등
- main_content = 정답 선택지
- choices: 한글 핵심 내용 명사구 5개
`.trim();

const TYPE13_CHANGE = `
==================================================
중2 13번: 거스름돈 파악
==================================================
지시문: 대화를 듣고, ○○가 받을 거스름돈으로 가장 적절한 것을 고르시오.
- 카페·서점·보관소 등에서 가격·합계·지불액을 명확히 말한다.
- 계산: total과 paid가 대본에 분명히 나와야 한다.
- final_time 필드에 정답 금액 문자열 (예: "$4")
- mentioned_times: 가격 단서 배열
- choices: 영어 금액 5개 ($2, $4 등). 정답 하나만
- 오답은 산술상 가능해도 대본 숫자와 맞지 않게
`.trim();

const TYPE14_RELATIONSHIP = `
==================================================
중2 14번: 관계 파악
==================================================
지시문: 대화를 듣고, 두 사람의 관계로 가장 적절한 것을 고르시오.
- 직업·역할을 대본에 직접 말하지 않는다.
- target_job = 정답 관계 (예: "잡지기자―패션디자이너")
- job_clues 2개 이상, distractor_jobs 4개
- choices: 한글 "A―B" 형식 5개
`.trim();

/** 중2 17번 = 중1 17번과 동일 (그림 대화 유형 아님) */
function buildMiddle2Type17Prompt(previousProblems?: string[]): string {
  return `
${MIDDLE2_HARDER_NOTE}

[중2 17번 = 중1 17번과 100% 동일]
- 유형: 특정 시점에 할 일 파악
- 금지: 그림 상황 설명, "Look at the picture", 영어 대화 미니스크립트 선택지
- 필수: M/W 일정 대화 6~8턴, choices 한글 활동(~하기) 5개, question_text ""

${buildType17OnlyGenerationPrompt(previousProblems)}
`.trim();
}

function buildCustomMiddle2Prompt(
  typeId: number,
  rules: string,
  previousProblems?: string[]
): string {
  const avoid =
    previousProblems && previousProblems.length > 0
      ? `\n피할 문제:\n${previousProblems.map((p) => `- ${p}`).join("\n")}\n`
      : "";
  return `
${getCommonPrompt(GRADE)}

${getCopyrightBlock(GRADE)}
${MIDDLE2_HARDER_NOTE}
${avoid}
${rules}

order_index = ${typeId}.

${QUALITY_CHECK_CRITERIA}

${getJsonOutputSchema(GRADE)}
`.trim();
}

/** 중2 단일 유형 1문항 생성 프롬프트 */
export function buildMiddle2TypeOnlyGenerationPrompt(
  typeId: number,
  previousProblems?: string[]
): string {
  switch (typeId) {
    case 1:
      return wrapMiddle1TypePrompt(1, buildType3OnlyGenerationPrompt(previousProblems));
    case 2:
      return wrapMiddle1TypePrompt(2, buildType2OnlyGenerationPrompt(previousProblems));
    case 3:
      return wrapMiddle1TypePrompt(3, buildType8OnlyGenerationPrompt(previousProblems));
    case 4:
      return buildCustomMiddle2Prompt(4, TYPE4_PAST_ACTION, previousProblems);
    case 5:
      return wrapMiddle1TypePrompt(5, buildType13OnlyGenerationPrompt(previousProblems));
    case 6:
      return wrapMiddle1TypePrompt(6, buildType4OnlyGenerationPrompt(previousProblems));
    case 7:
      return buildCustomMiddle2Prompt(7, TYPE7_ITEM, previousProblems);
    case 8:
      return wrapMiddle1TypePrompt(8, buildType9OnlyGenerationPrompt(previousProblems));
    case 9:
      return wrapMiddle1TypePrompt(9, buildType5OnlyGenerationPrompt(previousProblems));
    case 10:
      return buildCustomMiddle2Prompt(10, TYPE10_MONOLOGUE, previousProblems);
    case 11:
      return wrapMiddle1TypePrompt(11, buildType14OnlyGenerationPrompt(previousProblems));
    case 12:
      return wrapMiddle1TypePrompt(12, buildType12OnlyGenerationPrompt(previousProblems));
    case 13:
      return buildCustomMiddle2Prompt(13, TYPE13_CHANGE, previousProblems);
    case 14:
      return buildCustomMiddle2Prompt(14, TYPE14_RELATIONSHIP, previousProblems);
    case 15:
      return wrapMiddle1TypePrompt(15, buildType15OnlyGenerationPrompt(previousProblems));
    case 16:
      return wrapMiddle1TypePrompt(16, buildType12OnlyGenerationPrompt(previousProblems));
    case 17:
      return buildMiddle2Type17Prompt(previousProblems);
    case 18:
      return wrapMiddle1TypePrompt(18, buildType5OnlyGenerationPrompt(previousProblems));
    case 19:
      return wrapMiddle1TypePrompt(19, buildType19OnlyGenerationPrompt(previousProblems));
    case 20:
      return wrapMiddle1TypePrompt(20, buildType20OnlyGenerationPrompt(previousProblems));
    default:
      throw new Error(`중2 유형 ${typeId}을 찾을 수 없습니다.`);
  }
}

const MIDDLE2_TYPE_SUMMARIES: Record<number, string> = {
  1: "날씨 파악 — 지역 날씨 담화, weather_target_*",
  2: "구입/주문 — 이미지 선택지, needs_image_choices",
  3: "심정 파악 — target_emotion, emotion_clues",
  4: "과거에 한 일 — 시간 표현 + immediate_action",
  5: "대화 장소 — place_clues, target_place",
  6: "마지막 말 의도 — target_intention",
  7: "구입/가져올 물건",
  8: "대화 직후 할 일 — immediate_action",
  9: "언급하지 않은 것 — mention_plan, 행사명",
  10: "담화 내용 — monologue, main_content",
  11: "표 정보 불일치 — table_data",
  12: "목적 파악 — reason_for_going (~하려고)",
  13: "거스름돈 — final_time에 $금액",
  14: "관계 파악 — target_job에 A―B",
  15: "부탁한 일 — requester, requested_action",
  16: "이유 파악 — reason_for_going",
  17: "특정 시점 할 일 — target_time, planned_action, 한글 ~하기 보기",
  18: "담화 언급하지 않은 것 — mention_plan",
  19: "응답 고르기 — 여자 마지막 → Man: ______",
  20: "응답 고르기 — 남자 마지막 → Woman: ______",
};

export function getMiddle2TypePromptBlockForExam(typeId: number): string {
  if (typeId === 17) {
    return `
### 중2 유형 17 (= 중1 17번과 동일)
${getType17PromptBlockForExam()}
${MIDDLE2_HARDER_NOTE}
`.trim();
  }
  const summary = MIDDLE2_TYPE_SUMMARIES[typeId];
  if (!summary) return "";
  return `
### 중2 유형 ${typeId}
${summary}
${MIDDLE2_HARDER_NOTE}
`.trim();
}

export function getAllMiddle2TypePromptBlocks(typeIds: number[]): string {
  return typeIds.map((id) => getMiddle2TypePromptBlockForExam(id)).filter(Boolean).join("\n\n");
}
