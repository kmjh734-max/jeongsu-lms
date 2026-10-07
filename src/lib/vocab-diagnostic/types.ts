/**
 * 마케팅 > 예비고1·예비중1 어휘 진단 (정수학원 전용).
 *
 * 선생님 결정(2026-10-07): 예비고1은 「EngCore 고교기본」, 예비중1은 「EngCore 중학기본」에서 낸다.
 * 단어는 여러 Day에서 고르게 자동 추천하고, 관리자가 검토해 「출제 확정」한다.
 */

export type DiagTarget = "pre_high1" | "pre_middle1";

export const DIAG_TARGETS: Record<
  DiagTarget,
  { label: string; who: string; folderName: string; defaultCount: number; defaultMinutes: number }
> = {
  pre_high1: { label: "예비고1", who: "현재 중3", folderName: "EngCore 고교기본", defaultCount: 40, defaultMinutes: 15 },
  pre_middle1: { label: "예비중1", who: "현재 초6", folderName: "EngCore 중학기본", defaultCount: 30, defaultMinutes: 10 },
};

export function isDiagTarget(v: unknown): v is DiagTarget {
  return v === "pre_high1" || v === "pre_middle1";
}

/** 시험 한 문항. 확정하면 바뀌지 않는다. answerIndex 는 서버에만 둔다. */
export type DiagQuestion = {
  itemId: string;
  setId: string;
  day: number;
  word: string;
  answer: string;
  choices: string[];
  answerIndex: number;
};

/** 학생 화면에 보내는 문항 — 정답이 없다 */
export type DiagClientQuestion = { word: string; choices: string[] };

export type DiagAnswer = number | "unknown";
export type DiagAnswers = Record<string, DiagAnswer>;

export type DiagTestRow = {
  id: string;
  academy_id: string;
  target: DiagTarget;
  title: string;
  version: number;
  status: "draft" | "confirmed";
  is_active: boolean;
  question_count: number;
  recommended_minutes: number;
  intro_text: string;
  folder_id: string | null;
  questions: DiagQuestion[];
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
};

export const DIAG_INVITE_DAYS = 7;
export const DIAG_RESULT_DAYS = 90;

export const JEONGSU_CONTACT = "031-837-1939 / 010-8851-1196";
