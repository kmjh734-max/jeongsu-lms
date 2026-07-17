/** 중1 전국 영어듣기평가 — 모든 문항 공통 생성 규칙 */

import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
import {
  COMMON_PROMPT_HIGH1,
  HIGH1_COPYRIGHT_BLOCK,
  HIGH1_JSON_OUTPUT_SCHEMA,
  LISTENING_SYSTEM_PROMPT_HIGH1,
} from "@/lib/listening/prompts/commonPromptHigh1";
import {
  COMMON_PROMPT_MIDDLE2,
  LISTENING_SYSTEM_PROMPT_MIDDLE2,
  MIDDLE2_COPYRIGHT_BLOCK,
  MIDDLE2_JSON_OUTPUT_SCHEMA,
} from "@/lib/listening/prompts/commonPromptMiddle2";
import {
  COMMON_PROMPT_MIDDLE3,
  LISTENING_SYSTEM_PROMPT_MIDDLE3,
  MIDDLE3_COPYRIGHT_BLOCK,
  MIDDLE3_JSON_OUTPUT_SCHEMA,
} from "@/lib/listening/prompts/commonPromptMiddle3";

export const COPYRIGHT_BLOCK = `저작권 (필수):
- 2024·2025·2026 기출 문장, 대본, 선택지를 그대로 복사하지 않는다.
- 유형·난이도·구조만 참고하고, 상황과 문장은 완전히 새로 작성한다.
`.trim();

export const COMMON_PROMPT = `
너는 중학교 1학년 영어듣기능력평가(전국 중1 영어듣기평가) 문항을 제작하는 출제자다.

공통 생성 규칙:
- 기존 기출 문장, 대본, 선택지를 그대로 복사하지 않는다.
- 중1 수준의 자연스러운 영어 듣기 문항을 만든다.
- 문장은 너무 짧게만 끊지 말고, 대체로 6~13단어 정도로 작성한다.
- 대화형 문항은 6~8턴(화자 발화 6~8개)으로 구성한다.
- 담화형 문항은 5~7문장(발화 5~7개)으로 구성한다.
- 전체 대본(segment.text 합계)은 문항별 55~90단어를 목표로 한다.
- 너무 어려운 관계대명사, 가정법, 분사구문, 긴 삽입구는 사용하지 않는다.
- 사용 가능한 문법:
  - be going to, want to, have to, can / could, will
  - simple present, simple past
  - there is / there are, because, when, if
  - let's, how about, why don't we
- 대화 상황: 학교, 가족, 친구, 가게, 날씨, 취미, 약속, 교통, 행사, 동아리, 도서관, 병원, 식당, 공원 등 일상적 상황.
- 정답 단서는 대본 안에 반드시 포함한다.
- 정답 단서는 너무 노골적으로 반복하지 말고, 자연스럽게 한 번 이상 제시한다.
- 선택지는 정확히 5개, 정답은 명확히 하나만.
- 오답은 정답과 같은 범주 안에서 자연스럽게, 길이·표현 수준을 비슷하게 맞춘다.
- segment.text에는 영어 대사만 (한국어 지시문·선택지·빈칸 기호 금지).
- segments 화자: ANN, M, W (대화형은 M/W, 담화형은 M 또는 W 단독 가능, ANN은 짧은 안내에만).
- script_text: "M: ..." / "W: ..." / "ANN: ..." 형식.
- script_translation: 한국어 해석 (화자 표기: 남/여/안내).
- instruction: 한국어 (○○에는 남자/여자/지명 등만 채움).
`.trim();

export const JSON_OUTPUT_SCHEMA = `
반드시 아래 JSON만 출력 (questions 배열):

{
  "questions": [
    {
      "order_index": 1,
      "question_type": "",
      "instruction": "",
      "segments": [{ "speaker": "M", "text": "" }],
      "script_text": "",
      "script_translation": "",
      "question_text": "",
      "choices": ["", "", "", "", ""],
      "correct_answer": 1,
      "explanation": "한국어 짧은 해설",
      "answer_clue": "대본 속 정답 근거 영어 구절 또는 한국어 설명",
      "table_data": null,
      "previous_turn": "",
      "correct_response_function": "",
      "distractor_reason": []
    }
  ]
}

14번: table_data 필수 { title, rows[5], mismatch_no, mismatch_reason }. question_text는 "".
19~20번: previous_turn, correct_response_function, distractor_reason[5] 필수.
`.trim();

export const LISTENING_SYSTEM_PROMPT =
  "You are an expert writer for the Korean national middle school Grade 1 English listening exam (전국 중1 영어듣기능력평가). Output only valid JSON. Never copy copyrighted past exam content. Follow per-type rules and word-count targets strictly. Write natural, slightly longer sentences (6~13 words) at grade-1 level.";

export function getListeningSystemPrompt(grade: ListeningGradeLevel): string {
  if (grade === "high1") return LISTENING_SYSTEM_PROMPT_HIGH1;
  if (grade === "middle3") return LISTENING_SYSTEM_PROMPT_MIDDLE3;
  if (grade === "middle2") return LISTENING_SYSTEM_PROMPT_MIDDLE2;
  return LISTENING_SYSTEM_PROMPT;
}

export function getCommonPrompt(grade: ListeningGradeLevel): string {
  if (grade === "high1") return COMMON_PROMPT_HIGH1;
  if (grade === "middle3") return COMMON_PROMPT_MIDDLE3;
  if (grade === "middle2") return COMMON_PROMPT_MIDDLE2;
  return COMMON_PROMPT;
}

export function getCopyrightBlock(grade: ListeningGradeLevel): string {
  if (grade === "high1") return HIGH1_COPYRIGHT_BLOCK;
  if (grade === "middle3") return MIDDLE3_COPYRIGHT_BLOCK;
  if (grade === "middle2") return MIDDLE2_COPYRIGHT_BLOCK;
  return COPYRIGHT_BLOCK;
}

export function getJsonOutputSchema(grade: ListeningGradeLevel): string {
  if (grade === "high1") return HIGH1_JSON_OUTPUT_SCHEMA;
  if (grade === "middle3") return MIDDLE3_JSON_OUTPUT_SCHEMA;
  if (grade === "middle2") return MIDDLE2_JSON_OUTPUT_SCHEMA;
  return JSON_OUTPUT_SCHEMA;
}
