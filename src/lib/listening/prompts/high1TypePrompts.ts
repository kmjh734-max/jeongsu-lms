import {
  COMMON_PROMPT_HIGH1,
  HIGH1_COPYRIGHT_BLOCK,
  HIGH1_JSON_OUTPUT_SCHEMA,
} from "@/lib/listening/prompts/commonPromptHigh1";

export const HIGH1_FORMAT_NOTE = `
[고1 수능형 — 중등 20유형과 별개]
- 유형 번호 의미: 1목적 2의견 3요지 4그림불일치 5할일 6금액 7이유 8미언급 9내용불일치 10표 11~12짧은응답 13~14긴응답 15상황발화 16주제 17언급여부
- 중등 유형(날씨·장래희망·직업·중등 응답19~20 등) 규칙을 절대 섞지 말 것.
`.trim();

const HIGH1_TYPE_BLOCKS: Record<number, string> = {
  1: `
### 고1 1번 — 목적 파악
지시: 다음을 듣고, {남/여}가 하는 말의 목적으로 가장 적절한 것을 고르시오.
형식: 독백 안내방송. 인사·자기소개 → 일정/변경/요청 → 협조 감사.
선택지: 한국어 「…하려고」 5개. 정답=공지 목적. 오답=같은 소재의 다른 목적.
needs_image_choices=false. segments=M 또는 W만.
`.trim(),
  2: `
### 고1 2번 — 의견 파악
지시: 대화를 듣고, {남/여}의 의견으로 가장 적절한 것을 고르시오.
형식: M/W 대화. 대상 화자가 주장·조언을 명확히(재진술 가능).
선택지: 한국어 의견 5개. 상대 화자 의견·세부사항으로 오답.
`.trim(),
  3: `
### 고1 3번 — 요지 파악
지시: 다음을 듣고, {남/여}가 하는 말의 요지로 가장 적절한 것을 고르시오.
형식: 라디오/팁 독백. 훅 → 핵심 팁 → 짧은 이유. 요지=일반화.
선택지: 한국어. 세부만 고른 선지·반대 조언은 오답.
`.trim(),
  4: `
### 고1 4번 — 그림 불일치
지시: 대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.
형식: 포스터/장면 대화. ①~⑤ 요소를 모두 언급하되, 그림 설계상 하나와 불일치.
choices: ["①","②","③","④","⑤"]. needs_image_choices=true.
choice_image_prompts: 라벨 ①–⑤가 명확한 장면 1장 설명.
`.trim(),
  5: `
### 고1 5번 — 할 일
지시: 대화를 듣고, {남/여}가 할 일로 가장 적절한 것을 고르시오.
형식: 준비 체크리스트. 여러 일은 이미 끝남 → 남은 일 1개만 대상이 수행.
선택지: 한국어 「…하기」. 오답=이미 한 일.
`.trim(),
  6: `
### 고1 6번 — 금액 계산
지시: 대화를 듣고, {남/여}가 지불할 금액을 고르시오. (자주 3점)
형식: 단가·수량·옵션·쿠폰/할인. 최종 지불액이 유일하게 계산됨.
선택지: $금액 5개. 산수 실수형 오답 포함.
`.trim(),
  7: `
### 고1 7번 — 이유 파악
지시: 대화를 듣고, {남/여}가 … 이유를 고르시오.
형식: 참석 불가/실패. 상대가 틀린 이유 추측 → 부정 → 진짜 이유.
선택지: 한국어 「…해서」. 추측·언급됐으나 부정된 이유는 오답.
`.trim(),
  8: `
### 고1 8번 — 미언급
지시: 대화를 듣고, {행사명}에 관해 언급되지 않은 것을 고르시오.
형식: 날짜·방법·준비물·인원·비용 등 나열. 정확히 1개 라벨만 미언급.
선택지: 한국어 항목 라벨 5개.
`.trim(),
  9: `
### 고1 9번 — 내용 불일치
지시: {행사명}에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.
형식: 안내 독백. 선지 4개는 일치, 1개만 대본과 충돌.
선택지: 한국어 사실 진술.
`.trim(),
  10: `
### 고1 10번 — 표 선택
지시: 다음 표를 보면서 대화를 듣고, …을 고르시오.
형식: 표 5행(A–E)·3~4열. 조건(가격·크기·옵션)을 순차 적용해 1행 확정.
table_data 필수: title, rows[5]{no,label,value}, mismatch_no=정답행, mismatch_reason.
question_text "". needs_image_choices=false.
`.trim(),
  11: `
### 고1 11번 — 짧은 응답
지시: 대화를 듣고, {화자A}의 마지막 말에 대한 {화자B}의 응답으로…
형식: 짧은 대화. 응답 직전에서 끊김. 응답은 segments에 넣지 않음.
question_text: "Man: _____" 또는 "Woman: _____".
choices: 영어 응답 5개. previous_turn, blank_speaker, correct_response_function, distractor_reasons 필수.
Okay/Yes/Sure/Thank you 단독 금지.
`.trim(),
  12: `
### 고1 12번 — 짧은 응답 (11과 화자 반대)
11번과 동일 형식. blank_speaker를 반대로. 자주 3점.
`.trim(),
  13: `
### 고1 13번 — 긴 응답
지시: 동일 응답 패턴. 상담·예약·프로젝트 등 긴 맥락(8~12턴).
문제지에 Man:/Woman: 빈칸. 영어 선지. 자주 3점.
응답 segments 금지. previous_turn 등 필수 필드.
`.trim(),
  14: `
### 고1 14번 — 긴 응답 (13과 화자 반대)
13번과 동일 형식. blank_speaker 반대. 자주 3점.
`.trim(),
  15: `
### 고1 15번 — 상황 발화
지시: 다음 상황 설명을 듣고, {A}가 {B}에게 할 말로…
형식: 3인칭 영어 나레이션(독백). 끝: In this situation, what would A most likely say to B?
question_text: "Aname: _____". choices: 영어 발화 5개 (부탁/감사/제안/사과 등).
`.trim(),
  16: `
### 고1 16번 — 주제 ([16~17] 세트, 2회 재생)
지시: {남/여}가 하는 말의 주제로 가장 적절한 것은?
형식: 열거형 긴 독백(팁·필수품·음식 등 3~5항목). choices: 영어 주제 5개.
17번과 segments·script_text를 글자 단위로 동일하게 맞출 것.
`.trim(),
  17: `
### 고1 17번 — 언급 여부 (16과 동일 음원)
지시: 언급된 {범주}이/가 아닌 것은?
형식: 16번과 동일한 segments/script_text만 사용. 새 대본 작성 금지.
choices: 영어 항목 5개. 4개 언급·1개 미언급.
`.trim(),
};

export function getHigh1TypePromptBlock(typeId: number): string {
  return HIGH1_TYPE_BLOCKS[typeId] ?? "";
}

export function getAllHigh1TypePromptBlocks(typeIds: number[]): string {
  const unique = [...new Set(typeIds)].sort((a, b) => a - b);
  const blocks = unique
    .map((id) => getHigh1TypePromptBlock(id))
    .filter(Boolean);
  if (blocks.length === 0) return "";
  return `${HIGH1_FORMAT_NOTE}\n\n${blocks.join("\n\n")}`;
}

/** 고1 단일 유형 1문항 */
export function buildHigh1TypeOnlyGenerationPrompt(
  typeId: number,
  previousProblems?: string[]
): string {
  const block = getHigh1TypePromptBlock(typeId);
  if (!block) {
    throw new Error(`고1 유형 ${typeId}을 찾을 수 없습니다.`);
  }
  const avoid =
    previousProblems && previousProblems.length > 0
      ? `\n이전 문항과 소재·표현 중복 금지:\n- ${previousProblems.slice(0, 8).join("\n- ")}`
      : "";

  return `
${COMMON_PROMPT_HIGH1}

${HIGH1_COPYRIGHT_BLOCK}

${HIGH1_FORMAT_NOTE}

이번 요청: 고1 듣기 유형 ${typeId}번만 1문항 생성. order_index=${typeId}.
다른 번호 유형을 섞지 말 것.
${avoid}

${block}

${HIGH1_JSON_OUTPUT_SCHEMA}
`.trim();
}
