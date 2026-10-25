/** 중학 문법 문제 은행 — 화면과 API가 함께 쓰는 형태 */

export type GrammarChoice = { no: number; text: string };

export type GrammarQuestion = {
  id: number;
  source_file: string;
  number: number;
  level: number;
  level_name: string;
  chapter_no: number;
  chapter: string;
  kind: string | null;
  round: number | null;
  unit_no: number | null;
  unit: string | null;
  point_nos: number[];
  point_label: string | null;
  tier: number | null;
  question_kind: string | null;
  difficulty: string | null;
  badges: string[];
  prompt: string;
  body: string[];
  choices: GrammarChoice[];
  answer: string | null;
  explanation: string | null;
};

export type GrammarChapterRow = {
  level: number;
  level_name: string;
  chapter_no: number;
  chapter: string;
  tier: number | null;
  question_count: number;
};

/** 문항 묶음 — 교재 차례가 아니라 난이도로 나눈다 */
export const GRAMMAR_TIERS = [
  { tier: 1, label: "1단계 기본", hint: "형태 쓰기·두 곳 중 고르기처럼 개념을 바로 확인하는 문항" },
  { tier: 2, label: "2단계 실력", hint: "어법 판단·다른 하나 고르기 등 내신에 그대로 나오는 문항" },
  { tier: 3, label: "3단계 고난도", hint: "답이 여럿이거나 조건을 달아 쓰게 하는 문항" },
] as const;

/** 레벨별로 묶어 둔 단원 목록 */
export type GrammarChapterGroup = {
  level: number;
  level_name: string;
  chapters: {
    chapter_no: number;
    chapter: string;
    tiers: { tier: number; question_count: number }[];
    question_count: number;
  }[];
};

/**
 * 인쇄 서식 — 선생님 결정(2026-10-26): 내신 기출형 + STEP 단계형 + 기출 예상형 셋만 쓴다.
 * 다섯 개 뜨는 게 많다 하셨고, 내신 기출형 말고는 별로라 하셔서 시안을 다시 그려 둘을 받았다.
 *
 * 빠진 서식(포인트 라벨형·서술 연습형·초록 라벨형·파랑 워크북형 등)의 CSS 와 그리는 코드는 그대로 둔다.
 * 다시 쓰게 되면 아래 목록에 되돌리기만 하면 된다.
 */
export const GRAMMAR_SHEET_STYLES = [
  // 2026-10-25 선생님 승인 — 교재(내신 대비 문제집·기출예상·학원 실전문제지)를 보고 따온 서식
  { key: "a", label: "내신 기출형", hint: "색 띠 머리글, 배점·서술형·고난도 표시, 정답은 모아 쓰기" },
  // 2026-10-26 선생님 승인 — 해커스 STEP 쪽, 기출예상 문제집 쪽을 따른 서식. 글자 크기는 내신 기출형과 같다.
  { key: "s", label: "STEP 단계형", hint: "객관식은 STEP 1, 서술형은 STEP 2 쪽으로 나눠 싣기" },
  { key: "p", label: "기출 예상형", hint: "육각 표지, 문항마다 ❶ 세부 단원, 굵은 01 번호" },
] as const;

/** 그릴 줄 아는 서식 전부 — 목록에서 뺀 서식도 코드에는 남아 있다 */
export type GrammarSheetStyle = "a" | "b" | "c" | "g" | "i" | "s" | "p";

export function isGrammarSheetStyle(v: unknown): v is GrammarSheetStyle {
  return GRAMMAR_SHEET_STYLES.some((s) => s.key === v);
}

/** 본문 속 [[ ]] 표시를 밑줄 자리로 읽어 낸다 */
export const GRAMMAR_BLANK_RE = /\[\[(.*?)\]\]/g;
