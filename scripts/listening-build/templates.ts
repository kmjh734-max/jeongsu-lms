/**
 * 번호별 형식 — 참고 교재에서 전수로 뽑아 정리한 값 (2026-09-21).
 *
 * 근거: 고등 첫단추 듣기실전편·듣기유형편·수능실감듣기 / 중등 빠르게 중학영어듣기 25회·Listening Q 1·2권.
 * 회차를 쓸 때는 내용만 적고, 배점 표시·응답 줄 같은 형식은 여기서 자동으로 붙인다.
 */

export type ChoiceLang = "ko" | "en" | "money" | "time" | "date" | "picture" | "table";

export interface NumberTemplate {
  order: number;
  /** 유형 이름 — DB의 question_type 에 그대로 들어간다 */
  type: string;
  /** 지시문 틀. {who}=남자/여자, {what}=소재 이름 */
  ask: string;
  choiceLang: ChoiceLang;
  /** 담화 한 사람 / 대화 두 사람 */
  form: "담화" | "대화" | "짧은대화모음";
  /** 대본 발화 수 (중앙값) */
  turns: number;
  /** 대본 낱말 수 (중앙값) */
  words: number;
  /** [3점] 문항 */
  points3?: boolean;
  /** 문항 위에 붙는 응답 줄 (▶ Man : 처럼) */
  responseLine?: boolean;
  /** 그림·표가 필요한 문항 */
  visual?: "figure5" | "scene" | "grid5" | "table";
  note?: string;
}

/** 고등 17문항 (수능 형식) */
export const HIGH_TEMPLATE: NumberTemplate[] = [
  { order: 1, type: "목적 파악", ask: "다음을 듣고, {who}가 하는 말의 목적으로 가장 적절한 것을 고르시오.", choiceLang: "ko", form: "담화", turns: 1, words: 130 },
  { order: 2, type: "의견 파악", ask: "대화를 듣고, {who}의 의견으로 가장 적절한 것을 고르시오.", choiceLang: "ko", form: "대화", turns: 11, words: 144 },
  { order: 3, type: "요지 파악", ask: "다음을 듣고, {who}가 하는 말의 요지로 가장 적절한 것을 고르시오.", choiceLang: "ko", form: "담화", turns: 1, words: 105 },
  { order: 4, type: "그림 불일치", ask: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.", choiceLang: "picture", form: "대화", turns: 11, words: 140, visual: "figure5", note: "한 장면에 라벨 ①~⑤. 하나만 대본과 다르게 그린다." },
  { order: 5, type: "할 일", ask: "대화를 듣고, {who}가 할 일로 가장 적절한 것을 고르시오.", choiceLang: "ko", form: "대화", turns: 11, words: 150 },
  { order: 6, type: "금액 계산", ask: "대화를 듣고, {who}가 지불할 금액을 고르시오.", choiceLang: "money", form: "대화", turns: 12, words: 143, note: "단가·수량·할인으로 계산. 최종 금액은 대본에서 말하지 않는다." },
  { order: 7, type: "이유 파악", ask: "대화를 듣고, {who}가 {what} 이유를 고르시오.", choiceLang: "ko", form: "대화", turns: 8, words: 106 },
  { order: 8, type: "미언급", ask: "대화를 듣고, {what}에 관해 언급되지 않은 것을 고르시오.", choiceLang: "ko", form: "대화", turns: 11, words: 148, note: "보기는 항목 이름(제목·가격·일시·장소 등)" },
  { order: 9, type: "내용 불일치", ask: "{what}에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.", choiceLang: "ko", form: "담화", turns: 1, words: 124 },
  { order: 10, type: "표 선택", ask: "다음 표를 보면서 대화를 듣고, {what}을 고르시오.", choiceLang: "table", form: "대화", turns: 11, words: 146, visual: "table", note: "조건 3~4개로 하나씩 지워 하나만 남긴다." },
  { order: 11, type: "짧은 응답", ask: "대화를 듣고, {who}의 마지막 말에 대한 {other}의 응답으로 가장 적절한 것을 고르시오.", choiceLang: "en", form: "대화", turns: 4, words: 51, responseLine: true },
  { order: 12, type: "짧은 응답", ask: "대화를 듣고, {who}의 마지막 말에 대한 {other}의 응답으로 가장 적절한 것을 고르시오.", choiceLang: "en", form: "대화", turns: 4, words: 50, responseLine: true },
  { order: 13, type: "긴 응답", ask: "대화를 듣고, {who}의 마지막 말에 대한 {other}의 응답으로 가장 적절한 것을 고르시오.", choiceLang: "en", form: "대화", turns: 11, words: 134, points3: true, responseLine: true },
  { order: 14, type: "긴 응답", ask: "대화를 듣고, {who}의 마지막 말에 대한 {other}의 응답으로 가장 적절한 것을 고르시오.", choiceLang: "en", form: "대화", turns: 10, words: 113, points3: true, responseLine: true },
  { order: 15, type: "상황 발화", ask: "다음 상황 설명을 듣고, {what}에게 할 말로 가장 적절한 것을 고르시오.", choiceLang: "en", form: "담화", turns: 1, words: 142, points3: true, responseLine: true },
  { order: 16, type: "주제", ask: "{who}가 하는 말의 주제로 가장 적절한 것은?", choiceLang: "en", form: "담화", turns: 1, words: 169, note: "16·17번이 같은 담화를 쓴다" },
  { order: 17, type: "언급 여부", ask: "언급된 {what}이 아닌 것은?", choiceLang: "en", form: "담화", turns: 1, words: 0, note: "보기는 담화에 나온 낱말 그대로" },
];

/** 중등 20문항 (시도교육청 듣기평가 형식) */
export const MIDDLE_TEMPLATE: NumberTemplate[] = [
  { order: 1, type: "그림 고르기", ask: "대화를 듣고, {who}가 구입할 {what}을 고르시오.", choiceLang: "picture", form: "대화", turns: 8, words: 91, visual: "grid5", note: "같은 물건의 무늬·모양이 다른 다섯 개" },
  { order: 2, type: "언급하지 않은 것(대화)", ask: "대화를 듣고, {what}에 관해 언급되지 않은 것을 고르시오.", choiceLang: "ko", form: "대화", turns: 9, words: 98 },
  { order: 3, type: "목적 파악(전화·방문)", ask: "대화를 듣고, {who}가 {other}에게 전화한 목적으로 가장 적절한 것을 고르시오.", choiceLang: "ko", form: "대화", turns: 8, words: 77 },
  { order: 4, type: "시각 파악", ask: "대화를 듣고, 두 사람이 만나기로 한 시각을 고르시오.", choiceLang: "time", form: "대화", turns: 9, words: 103 },
  { order: 5, type: "심정 파악", ask: "대화를 듣고, {who}의 심정으로 가장 적절한 것을 고르시오.", choiceLang: "en", form: "대화", turns: 8, words: 91, note: "보기는 영어 형용사 한 낱말" },
  { order: 6, type: "그림 상황에 맞는 대화", ask: "다음 그림의 상황에 가장 적절한 대화를 고르시오.", choiceLang: "picture", form: "짧은대화모음", turns: 5, words: 58, visual: "scene", note: "보기 ①~⑤가 각각 짧은 대화 한 쌍" },
  { order: 7, type: "부탁한 일 파악", ask: "대화를 듣고, {who}가 {other}에게 부탁한 일로 가장 적절한 것을 고르시오.", choiceLang: "ko", form: "대화", turns: 8, words: 95 },
  { order: 8, type: "언급하지 않은 것", ask: "다음을 듣고, {what}에 대해 언급되지 않은 것을 고르시오.", choiceLang: "ko", form: "담화", turns: 1, words: 71 },
  { order: 9, type: "설명 대상 파악", ask: "다음을 듣고, 무엇에 관한 설명인지 고르시오.", choiceLang: "ko", form: "담화", turns: 1, words: 66 },
  { order: 10, type: "어색한 대화 고르기", ask: "다음을 듣고, 두 사람의 대화가 어색한 것을 고르시오.", choiceLang: "en", form: "짧은대화모음", turns: 5, words: 57, note: "짧은 대화 다섯 쌍 중 하나가 어긋난다" },
  { order: 11, type: "대화 직후 할 일 파악", ask: "대화를 듣고, {who}가 대화 직후에 할 일로 가장 적절한 것을 고르시오.", choiceLang: "ko", form: "대화", turns: 8, words: 91 },
  { order: 12, type: "표 보고 고르기", ask: "다음 표를 보면서 대화를 듣고, {who}가 구입할 {what}을 고르시오.", choiceLang: "table", form: "대화", turns: 9, words: 106, visual: "table" },
  { order: 13, type: "날짜 파악", ask: "대화를 듣고, 두 사람이 {what} 날짜를 고르시오.", choiceLang: "date", form: "대화", turns: 9, words: 108 },
  { order: 14, type: "한 일 파악", ask: "대화를 듣고, {who}가 지난 주말에 한 일로 가장 적절한 것을 고르시오.", choiceLang: "ko", form: "대화", turns: 8, words: 97 },
  { order: 15, type: "방송 목적 파악", ask: "다음을 듣고, 방송의 목적으로 가장 적절한 것을 고르시오.", choiceLang: "ko", form: "담화", turns: 1, words: 84 },
  { order: 16, type: "금액 파악", ask: "대화를 듣고, {who}가 지불할 금액을 고르시오.", choiceLang: "money", form: "대화", turns: 8, words: 90 },
  { order: 17, type: "응답 고르기", ask: "대화를 듣고, {who}의 마지막 말에 대한 {other}의 응답으로 가장 적절한 것을 고르시오.", choiceLang: "en", form: "대화", turns: 8, words: 100, responseLine: true },
  { order: 18, type: "응답 고르기", ask: "대화를 듣고, {who}의 마지막 말에 대한 {other}의 응답으로 가장 적절한 것을 고르시오.", choiceLang: "en", form: "대화", turns: 8, words: 104, responseLine: true },
  { order: 19, type: "응답 고르기", ask: "대화를 듣고, {who}의 마지막 말에 대한 {other}의 응답으로 가장 적절한 것을 고르시오.", choiceLang: "en", form: "대화", turns: 9, words: 108, responseLine: true },
  { order: 20, type: "상황에 맞는 말", ask: "다음 상황 설명을 듣고, {what}에게 할 말로 가장 적절한 것을 고르시오.", choiceLang: "en", form: "담화", turns: 1, words: 85, responseLine: true },
];

export function templateFor(grade: string): NumberTemplate[] {
  return grade.startsWith("high") ? HIGH_TEMPLATE : MIDDLE_TEMPLATE;
}

export function templateAt(grade: string, order: number): NumberTemplate | undefined {
  return templateFor(grade).find((t) => t.order === order);
}
