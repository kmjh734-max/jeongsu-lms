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
 * 인쇄 서식 — 선생님 결정(2026-10-01): 초록 라벨형과 파랑 워크북형만 쓴다.
 *
 * 예전 서식(정갈형·음영 머리글형·저널형)의 서식은 globals.css 에 그대로 둔다.
 * 그 서식으로 저장해 둔 시험지가 있어, 서식까지 걷으면 그 자료가 모양을 잃는다.
 */
export const GRAMMAR_SHEET_STYLES = [
  { key: "g", label: "초록 라벨형", hint: "초록 라벨과 사각 번호, 예문은 연초록 칸" },
  { key: "i", label: "파랑 워크북형", hint: "문항마다 연파랑 카드, 앱 색과 같음" },
] as const;

export type GrammarSheetStyle = (typeof GRAMMAR_SHEET_STYLES)[number]["key"];

export function isGrammarSheetStyle(v: unknown): v is GrammarSheetStyle {
  return GRAMMAR_SHEET_STYLES.some((s) => s.key === v);
}

/** 본문 속 [[ ]] 표시를 밑줄 자리로 읽어 낸다 */
export const GRAMMAR_BLANK_RE = /\[\[(.*?)\]\]/g;
