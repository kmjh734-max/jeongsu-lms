export type HomeworkDaySymbol = "complete" | "partial" | "missing" | "scheduled" | "none";

export interface HomeworkDayCell {
  day: number;
  weekday: number;
  taskDate: string;
  symbol: HomeworkDaySymbol;
  isToday: boolean;
  isStudyDay: boolean;
  completedCount: number;
  totalCount: number;
  /** 해당 날짜 OMR 시험 최고 점수 */
  examBestScore?: number | null;
  examAttemptCount?: number;
}

export interface ListeningExamMonthSummary {
  attemptCount: number;
  bestScore: number | null;
  latestScore: number | null;
  latestCorrectCount: number | null;
  latestTotalCount: number | null;
  latestSetTitle: string | null;
  latestDate: string | null;
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
  examSummary: ListeningExamMonthSummary;
}

export interface ListeningStatusTable {
  year: number;
  month: number;
  todayIso: string;
  daysInMonth: number;
  rows: ListeningStatusRow[];
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
