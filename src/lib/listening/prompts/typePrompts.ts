import { getType1PromptBlockForExam } from "@/lib/listening/prompts/type1DescribePrompt";
import { getType2PromptBlockForExam } from "@/lib/listening/prompts/type2PurchasePrompt";
import { getType3PromptBlockForExam } from "@/lib/listening/prompts/type3WeatherPrompt";
import { getType4PromptBlockForExam } from "@/lib/listening/prompts/type4IntentionPrompt";
import { getType5PromptBlockForExam } from "@/lib/listening/prompts/type5UnmentionedPrompt";
import { getType6PromptBlockForExam } from "@/lib/listening/prompts/type6TimePrompt";
import { getType7PromptBlockForExam } from "@/lib/listening/prompts/type7CareerPrompt";
import { getType8PromptBlockForExam } from "@/lib/listening/prompts/type8EmotionPrompt";

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
    question_type: "대화 직후 할 일",
    instruction: "대화를 듣고, ○○가 대화 직후에 할 일로 가장 적절한 것을 고르시오.",
    body: `
- 대화 6~8턴.
- 마지막 부분에 바로 할 행동이 명확 (I'll ~ now 등).
- instruction의 ○○는 남자 또는 여자.
- 선택지: 행동 5개 (한국어).`,
  },
  {
    id: 10,
    question_type: "대화 주제 파악",
    instruction: "대화를 듣고, 무엇에 관한 내용인지 가장 적절한 것을 고르시오.",
    body: `
- 대화 6~8턴.
- 일상 문제·계획·물건 처리 등; 전체 주제가 정답.
- 선택지: 주제 5개 (한국어). 너무 세부적이면 안 됨.`,
  },
  {
    id: 11,
    question_type: "이동 방법",
    instruction: "대화를 듣고, 두 사람이 함께 이동할 방법으로 가장 적절한 것을 고르시오.",
    body: `
- 대화 6~8턴.
- 이동 수단 후보 제시 후 함께 결정한 하나가 정답.
- 선택지: 교통수단 5개 (한국어).`,
  },
  {
    id: 12,
    question_type: "이유 파악",
    instruction: "대화를 듣고, ○○가 ○○에 가는 이유로 가장 적절한 것을 고르시오.",
    body: `
- 대화 6~8턴.
- 특정 장소 방문 이유가 대본에 명확.
- instruction의 ○○는 인물·장소(한국어).
- 선택지: 이유 5개 (한국어, ~하려고 형식).`,
  },
  {
    id: 13,
    question_type: "장소 파악",
    instruction: "대화를 듣고, 두 사람이 대화하는 장소로 가장 적절한 곳을 고르시오.",
    body: `
- 대화 6~8턴.
- 장소명을 직접 말하지 말고 단서(물건·행동·서비스)로 추론.
- 선택지: 장소 5개 (한국어).`,
  },
  {
    id: 14,
    question_type: "표 정보 불일치",
    instruction: "○○에 관한 다음 내용을 듣고, 표에서 일치하지 않는 것을 고르시오.",
    body: `
- 행사·수업·프로그램 안내 담화(ANN 또는 M/W) 5~7문장.
- 대본에 5개 정보를 모두 언급한다.
- table_data 필수 (question_text는 비워 둔다).
- table_data.title: 행사/프로그램 영어 제목.
- table_data.rows: 정확히 5개 { no, label(한국어 항목명), value(영어 내용) }.
- 4개 row는 대본과 일치, 정확히 1개 row만 대본과 다르게 작성.
- table_data.mismatch_no: 불일치 row 번호(1~5).
- table_data.mismatch_reason: 불일치 이유(한국어).
- correct_answer는 mismatch_no와 같아야 한다.
- choices: 5개 한국어 항목명(표 label과 동일 순서) 또는 ①~⑤에 대응하는 짧은 표현.
- answer_clue에 불일치 근거를 명확히 적는다.`,
  },
  {
    id: 15,
    question_type: "부탁한 일",
    instruction: "대화를 듣고, ○○가 ○○에게 부탁한 일로 가장 적절한 것을 고르시오.",
    body: `
- 대화 6~8턴.
- Can you~? / Could you~? / Would you~? 부탁 표현.
- 실제 부탁한 일은 하나만 명확 (제안과 구분).
- 선택지: 행동 5개 (한국어).`,
  },
  {
    id: 16,
    question_type: "제안한 것",
    instruction: "대화를 듣고, ○○가 ○○에게 제안한 것으로 가장 적절한 것을 고르시오.",
    body: `
- 대화 6~8턴.
- Why don't we~? / How about~? / Let's~ 제안.
- 선택지: 제안·활동 5개 (한국어).`,
  },
  {
    id: 17,
    question_type: "특정 시점 할 일",
    instruction: "대화를 듣고, ○○가 오늘 오후/이번 주말에 할 일로 가장 적절한 것을 고르시오.",
    body: `
- 대화 6~8턴.
- 오늘 오후·이번 주말 등 시점 명확; 그 시점의 계획이 정답.
- instruction의 ○○는 남자 또는 여자.
- 선택지: 활동 5개 (한국어).`,
  },
  {
    id: 18,
    question_type: "직업 파악",
    instruction: "대화를 듣고, ○○의 직업으로 가장 적절한 것을 고르시오.",
    body: `
- 대화 6~8턴.
- 직업명 직접 언급 없이 하는 일·상황 단서 2개 이상.
- instruction의 ○○는 남자 또는 여자.
- 선택지: 직업 5개 (한국어).`,
  },
  {
    id: 19,
    question_type: "응답 고르기",
    instruction: "대화를 듣고, 여자의 마지막 말에 이어질 남자의 말로 가장 적절한 것을 고르시오.",
    body: `
- 대화 6~8턴. 마지막 segment 화자는 반드시 W(여자).
- 마지막에서 두 번째 발화는 상대(남자)의 반응을 유도하는 문장이어야 한다.
- 남자의 응답 대사는 segment에 넣지 않음 (음원·대본에 읽히지 않음).
- question_text: 정확히 "Man: ________" (다른 단어 없음).
- previous_turn: 정답 직전 여자 발화 (예: "W: You can put the books in the return box.").
- 선택지: 영어 문장 5개. 정답만 직전 발화에 직접·자연스럽게 이어짐.
- 오답: 문법상 가능하나 현재 맥락에는 맞지 않음. 너무 엉뚱하거나 너무 짧은 "Yes." "Okay." 단독 금지.
- correct_response_function: 정답 기능(감사/동의/안도/수락/거절/정보 확인 등).
- distractor_reason: 5개 (각 선택지가 왜 정답/오답인지 한국어 한 줄).`,
  },
  {
    id: 20,
    question_type: "응답 고르기",
    instruction: "대화를 듣고, 남자의 마지막 말에 이어질 여자의 말로 가장 적절한 것을 고르시오.",
    body: `
- 19번과 다른 상황·주제.
- 대화 6~8턴. 마지막 segment 화자는 반드시 M(남자).
- 마지막에서 두 번째 발화는 여자의 반응을 유도.
- 여자 응답 대사는 segment에 넣지 않음.
- question_text: 정확히 "Woman: ________".
- previous_turn: 정답 직전 남자 발화.
- 선택지·오답·correct_response_function·distractor_reason 규칙은 19번과 동일.`,
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
