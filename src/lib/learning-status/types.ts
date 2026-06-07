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
