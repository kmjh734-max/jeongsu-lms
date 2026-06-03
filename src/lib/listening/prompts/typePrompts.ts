import { getType1PromptBlockForExam } from "@/lib/listening/prompts/type1DescribePrompt";
import { getType2PromptBlockForExam } from "@/lib/listening/prompts/type2PurchasePrompt";
import { getType3PromptBlockForExam } from "@/lib/listening/prompts/type3WeatherPrompt";
import { getType4PromptBlockForExam } from "@/lib/listening/prompts/type4IntentionPrompt";
import { getType5PromptBlockForExam } from "@/lib/listening/prompts/type5UnmentionedPrompt";
import { getType6PromptBlockForExam } from "@/lib/listening/prompts/type6TimePrompt";
import { getType7PromptBlockForExam } from "@/lib/listening/prompts/type7CareerPrompt";
import { getType8PromptBlockForExam } from "@/lib/listening/prompts/type8EmotionPrompt";
import { getType9PromptBlockForExam } from "@/lib/listening/prompts/type9ImmediateActionPrompt";
import { getType10PromptBlockForExam } from "@/lib/listening/prompts/type10MainContentPrompt";
import { getType11PromptBlockForExam } from "@/lib/listening/prompts/type11TransportPrompt";
import { getType12PromptBlockForExam } from "@/lib/listening/prompts/type12ReasonPrompt";
import { getType13PromptBlockForExam } from "@/lib/listening/prompts/type13PlacePrompt";
import { getType14PromptBlockForExam } from "@/lib/listening/prompts/type14TablePrompt";
import { getType15PromptBlockForExam } from "@/lib/listening/prompts/type15RequestPrompt";
import { getType16PromptBlockForExam } from "@/lib/listening/prompts/type16SuggestionPrompt";
import { getType17PromptBlockForExam } from "@/lib/listening/prompts/type17SchedulePrompt";
import { getType18PromptBlockForExam } from "@/lib/listening/prompts/type18JobPrompt";
import { getType19PromptBlockForExam } from "@/lib/listening/prompts/type19ResponsePrompt";
import { getType20PromptBlockForExam } from "@/lib/listening/prompts/type20ResponsePrompt";

/**
 * 중1 영어듣기평가 20유형별 생성 프롬프트
 * (기출 문장 복사 금지 — 유형·구조만 참고)
 */

export interface TypePromptSpec {
  id: number;
  question_type: string;
  instruction: string;
  body: string;
}

const TYPE_PROMPTS: TypePromptSpec[] = [
  {
    id: 1,
    question_type: "묘사 듣고 대상 고르기",
    instruction: "다음을 듣고, 'I'가 무엇인지 가장 적절한 것을 고르시오.",
    body: "(1번 전용 상세 규칙은 type1DescribePrompt.ts — 일괄 생성 시 getType1PromptBlockForExam 사용)",
  },
  {
    id: 2,
    question_type: "구입/주문 정보 파악",
    instruction: "대화를 듣고, ○○가 구입한/주문한 것으로 가장 적절한 것을 고르시오.",
    body: "(2번 전용 상세 규칙은 type2PurchasePrompt.ts — 일괄 생성 시 getType2PromptBlockForExam 사용)",
  },
  {
    id: 3,
    question_type: "날씨 파악",
    instruction: "다음을 듣고, ○○의 오늘 오후/현재/내일 날씨로 가장 적절한 것을 고르시오.",
    body: "(3번 전용 상세 규칙은 type3WeatherPrompt.ts — 일괄 생성 시 getType3PromptBlockForExam 사용)",
  },
  {
    id: 4,
    question_type: "마지막 말의 의도 파악",
    instruction: "대화를 듣고, ○○가 한 마지막 말의 의도로 가장 적절한 것을 고르시오.",
    body: "(4번 전용 상세 규칙은 type4IntentionPrompt.ts — 일괄 생성 시 getType4PromptBlockForExam 사용)",
  },
  {
    id: 5,
    question_type: "언급하지 않은 것",
    instruction: "다음을 듣고, ○○가 ○○에 대해 언급하지 않은 것을 고르시오.",
    body: "(5번 전용 상세 규칙은 type5UnmentionedPrompt.ts — 일괄 생성 시 getType5PromptBlockForExam 사용)",
  },
  {
    id: 6,
    question_type: "시각 파악",
    instruction: "대화를 듣고, 두 사람이 만날 시각/수업이 시작하는 시각을 고르시오.",
    body: "(6번 전용 상세 규칙은 type6TimePrompt.ts — 일괄 생성 시 getType6PromptBlockForExam 사용)",
  },
  {
    id: 7,
    question_type: "장래 희망 파악",
    instruction: "대화를 듣고, ○○의 장래 희망으로 가장 적절한 것을 고르시오.",
    body: `
- 대화 6~8턴.
- 관심·활동·이유 후 장래 희망(직업)이 자연스럽게 드러남.
- instruction의 ○○는 남자 또는 여자.
- 선택지: 직업 5개 (한국어).`,
  },
  {
    id: 8,
    question_type: "심정 파악",
    instruction: "대화를 듣고, ○○의 심정으로 가장 적절한 것을 고르시오.",
    body: "(8번 전용 상세 규칙은 type8EmotionPrompt.ts — 일괄 생성 시 getType8PromptBlockForExam 사용)",
  },
  {
    id: 9,
    question_type: "대화 직후 할 일 파악",
    instruction: "대화를 듣고, ○○가 대화 직후에 할 일로 가장 적절한 것을 고르시오.",
    body: "(9번 전용 상세 규칙은 type9ImmediateActionPrompt.ts — 일괄 생성 시 getType9PromptBlockForExam 사용)",
  },
  {
    id: 10,
    question_type: "대화의 핵심 내용 파악",
    instruction: "대화를 듣고, 무엇에 관한 내용인지 가장 적절한 것을 고르시오.",
    body: "(10번 전용 상세 규칙은 type10MainContentPrompt.ts — 일괄 생성 시 getType10PromptBlockForExam 사용)",
  },
  {
    id: 11,
    question_type: "이동 방법 파악",
    instruction: "대화를 듣고, 두 사람이 함께 이동할 방법으로 가장 적절한 것을 고르시오.",
    body: "(11번 전용 상세 규칙은 type11TransportPrompt.ts — 일괄 생성 시 getType11PromptBlockForExam 사용)",
  },
  {
    id: 12,
    question_type: "이유 파악",
    instruction: "대화를 듣고, ○○가 ○○에 가는 이유로 가장 적절한 것을 고르시오.",
    body: "(12번 전용 상세 규칙은 type12ReasonPrompt.ts — 일괄 생성 시 getType12PromptBlockForExam 사용)",
  },
  {
    id: 13,
    question_type: "대화 장소 파악",
    instruction: "대화를 듣고, 두 사람이 대화하는 장소로 가장 적절한 곳을 고르시오.",
    body: "(13번 전용 상세 규칙은 type13PlacePrompt.ts — 일괄 생성 시 getType13PromptBlockForExam 사용)",
  },
  {
    id: 14,
    question_type: "표 정보 불일치",
    instruction: "○○에 관한 다음 내용을 듣고, 표의 내용과 일치하지 않는 것을 고르시오.",
    body: "(14번 전용 상세 규칙은 type14TablePrompt.ts — 일괄 생성 시 getType14PromptBlockForExam 사용)",
  },
  {
    id: 15,
    question_type: "부탁한 일 파악",
    instruction: "대화를 듣고, ○○가 ○○에게 부탁한 일로 가장 적절한 것을 고르시오.",
    body: "(15번 전용 상세 규칙은 type15RequestPrompt.ts — 일괄 생성 시 getType15PromptBlockForExam 사용)",
  },
  {
    id: 16,
    question_type: "제안한 것 파악",
    instruction: "대화를 듣고, ○○가 ○○에게 제안한 것으로 가장 적절한 것을 고르시오.",
    body: "(16번 전용 상세 규칙은 type16SuggestionPrompt.ts — 일괄 생성 시 getType16PromptBlockForExam 사용)",
  },
  {
    id: 17,
    question_type: "특정 시점에 할 일 파악",
    instruction: "대화를 듣고, ○○가 오늘 오후/이번 주말에 할 일로 가장 적절한 것을 고르시오.",
    body: "(17번 전용 상세 규칙은 type17SchedulePrompt.ts — 일괄 생성 시 getType17PromptBlockForExam 사용)",
  },
  {
    id: 18,
    question_type: "직업 파악",
    instruction: "대화를 듣고, ○○의 직업으로 가장 적절한 것을 고르시오.",
    body: "(18번 전용 상세 규칙은 type18JobPrompt.ts — 일괄 생성 시 getType18PromptBlockForExam 사용)",
  },
  {
    id: 19,
    question_type: "응답 고르기",
    instruction: "대화를 듣고, 여자의 마지막 말에 이어질 남자의 말로 가장 적절한 것을 고르시오.",
    body: "(19번 전용 상세 규칙은 type19ResponsePrompt.ts — 일괄 생성 시 getType19PromptBlockForExam 사용)",
  },
  {
    id: 20,
    question_type: "응답 고르기",
    instruction: "대화를 듣고, 남자의 마지막 말에 이어질 여자의 말로 가장 적절한 것을 고르시오.",
    body: "(20번 전용 상세 규칙은 type20ResponsePrompt.ts — 일괄 생성 시 getType20PromptBlockForExam 사용)",
  },
];

export function getTypePromptSpec(typeId: number): TypePromptSpec | undefined {
  return TYPE_PROMPTS.find((t) => t.id === typeId);
}

export function getTypePromptBlock(typeId: number): string {
  if (typeId === 1) return getType1PromptBlockForExam();
  if (typeId === 2) return getType2PromptBlockForExam();
  if (typeId === 3) return getType3PromptBlockForExam();
  if (typeId === 4) return getType4PromptBlockForExam();
  if (typeId === 5) return getType5PromptBlockForExam();
  if (typeId === 6) return getType6PromptBlockForExam();
  if (typeId === 7) return getType7PromptBlockForExam();
  if (typeId === 8) return getType8PromptBlockForExam();
  if (typeId === 9) return getType9PromptBlockForExam();
  if (typeId === 10) return getType10PromptBlockForExam();
  if (typeId === 11) return getType11PromptBlockForExam();
  if (typeId === 12) return getType12PromptBlockForExam();
  if (typeId === 13) return getType13PromptBlockForExam();
  if (typeId === 14) return getType14PromptBlockForExam();
  if (typeId === 15) return getType15PromptBlockForExam();
  if (typeId === 16) return getType16PromptBlockForExam();
  if (typeId === 17) return getType17PromptBlockForExam();
  if (typeId === 18) return getType18PromptBlockForExam();
  if (typeId === 19) return getType19PromptBlockForExam();
  if (typeId === 20) return getType20PromptBlockForExam();
  const spec = getTypePromptSpec(typeId);
  if (!spec) return "";
  return `
=== 유형 ${spec.id}: ${spec.question_type} (order_index MUST be ${spec.id}) ===
instruction (한국어, ○○만 채움): ${spec.instruction}
${spec.body.trim()}
`.trim();
}

export function getAllTypePromptBlocks(typeIds: number[]): string {
  return typeIds.map((id) => getTypePromptBlock(id)).filter(Boolean).join("\n\n");
}
