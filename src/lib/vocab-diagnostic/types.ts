/**
 * 마케팅 > 예비고1·예비중1 어휘 진단 (정수학원 전용).
 *
 * 선생님 결정(2026-10-07): 예비고1은 「EngCore 고교기본」, 예비중1은 「EngCore 중학기본」에서 낸다.
 * 학원마다 공용 링크를 하나 두고, 들어온 사람이 예비고1·예비중1을 고르고 이름·학교를 적으면 그때 Day를 고르게
 * 무작위로 단어를 뽑는다(링크를 사람마다 발급하는 번거로움을 없앰, 선생님 결정 같은 날).
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

/** 응시 한 문항. 응시를 시작할 때 뽑아 응시 기록에 둔다. answerIndex 는 서버에만 둔다. */
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

/** 대상별 시험 설정(문항 수·권장 시간·안내 문구·켜기) */
export type DiagTestRow = {
  id: string;
  academy_id: string;
  target: DiagTarget;
  title: string;
  is_active: boolean;
  question_count: number;
  recommended_minutes: number;
  intro_text: string;
  created_at: string;
  updated_at: string;
};

/** 공용 링크에서 시작한 개인 응시를 이어 풀 수 있는 기간 */
export const DIAG_INVITE_DAYS = 7;
export const DIAG_RESULT_DAYS = 90;

export const JEONGSU_CONTACT = "031-837-1939 / 010-8851-1196";
