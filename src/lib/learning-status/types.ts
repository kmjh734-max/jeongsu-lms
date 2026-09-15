/** paused = 선생님이 멈춘 날 (isStudyDay 는 false — 수행률·안 한 날에 세지 않음) */
export type HomeworkDaySymbol =
  | "complete"
  | "partial"
  | "missing"
  | "scheduled"
  | "paused"
  | "none";

export interface HomeworkDayCell {
  day: number;
  weekday: number;
  taskDate: string;
  symbol: HomeworkDaySymbol;
  isToday: boolean;
  isStudyDay: boolean;
  completedCount: number;
  totalCount: number;
}

export interface ListeningOmrAttemptRow {
  studentId: string;
  studentName: string;
  classLabel: string;
  setId: string;
  setTitle: string;
  examDate: string;
  score: number;
  correctCount: number;
  totalCount: number;
}

export interface ListeningOmrStudentSummary {
  studentId: string;
  studentName: string;
  classLabel: string;
  attemptCount: number;
  bestScore: number | null;
  latestScore: number | null;
  latestDate: string | null;
  attempts: ListeningOmrAttemptRow[];
}

export interface ListeningStatusRow {
  studentId: string;
  studentName: string;
  classLabel: string;
  programLabel: string;
  days: HomeworkDayCell[];
  completedCount: number;
  totalCount: number;
  executionRate: number;
  /** 객관식 맞은 문항 수 */
  correctCount: number;
  /** 객관식 응시(제출) 문항 수 */
  answeredCount: number;
  /** 미완료 학습일 (독촉용) — 멈춘 날은 들어가지 않는다 */
  missedDates: string[];
  /** 오늘 멈춰 있는 듣기 과제가 있으면 멈춘 날·다시 시작하는 날 */
  pause?: { since: string; until: string | null } | null;
}

export interface ListeningStatusTable {
  year: number;
  month: number;
  todayIso: string;
  daysInMonth: number;
  rows: ListeningStatusRow[];
  omrByStudent: ListeningOmrStudentSummary[];
}

export interface VocabTodayStatusRow {
  studentId: string;
  studentName: string;
  classLabel: string;
  setId: string;
  setTitle: string;
  activityLabel: string;
  studiedToday: boolean;
}

export interface VocabTodayStatusTable {
  dateIso: string;
  rows: VocabTodayStatusRow[];
}
