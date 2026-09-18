export type ReportRange = "all" | "7d" | "30d" | "month";

export interface ReportStudentOption {
  id: string;
  name: string;
  loginId: string | null;
  classNames: string[];
}

export interface ReportClassOption {
  id: string;
  name: string;
}

export interface CourseReportSection {
  courseId: string;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  lastStudiedAt: string | null;
  /** 완료한 영상 제목만 (미완료는 리포트에 표시하지 않음) */
  completedLessonsList: string[];
}

export interface VocabReportSection {
  setId: string;
  setTitle: string;
  itemCount: number;
  stage1Completed: boolean;
  stage2Completed: boolean;
  stage3Completed: boolean;
  stage4Passed: boolean;
  /** 3단계(예문 빈칸) 최고 점수. 예전에 저장한 리포트에는 없다 */
  stage3BestScore?: number;
  stage4LastScore: number;
  stage4BestScore: number;
  stage4AttemptCount: number;
  lastStudiedAt: string | null;
  statusLabel: string;
}

export interface ReviewWordRow {
  itemId: string;
  word: string;
  meaning: string;
  stages: string[];
  wrongCount: number;
  recentWrong: boolean;
}

export interface ListeningDictationReportRow {
  setId: string;
  setTitle: string;
  questionCount: number;
  passedQuestionCount: number;
  averageBestScore: number | null;
  totalAttempts: number;
  frequentWrongWords: string[];
  summaryLine: string;
}

export interface ListeningExamReportRow {
  setId: string;
  setTitle: string;
  questionCount: number;
  attemptCount: number;
  bestScore: number | null;
  latestScore: number | null;
  latestSubmittedAt: string | null;
  summaryLine: string;
}

export interface ListeningScheduleReportRow {
  assignmentId: string;
  title: string;
  periodLabel: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  missedOrPendingTasks: number;
  recentTasks: Array<{
    taskDate: string;
    status: string;
    statusLabel: string;
    completedCount: number;
    totalCount: number;
    setTitle: string;
  }>;
  lastActivityDate: string | null;
  summaryLine: string;
}

/** 한눈에 보기 — 기간 안에 실제로 한 학습을 모은 숫자와 학습 달력 */
export interface ReportOverview {
  /** 무엇이든 학습한 날 수 */
  activeDays: number;
  /** 날짜(YYYY-MM-DD, 한국 시간) → 그날 남긴 학습 기록 수 */
  activity: Record<string, number>;
  /** 달력 첫날·끝날(YYYY-MM-DD). 전체 기간이면 최근 5주 */
  calendarStart: string;
  calendarEnd: string;
  vocab: {
    setsStudied: number;
    setsPassed: number;
    /** 끝낸 단계 수 / 전체 단계 수(세트 × 4) */
    stagesDone: number;
    stagesTotal: number;
    /** 4단계 종합테스트 최고 점수 평균(응시한 세트만) */
    avgScore: number | null;
  };
  listening: {
    examSets: number;
    /** 듣기 시험 최고 점수 평균 */
    examAvg: number | null;
    /** 받아쓰기 통과 문항 비율(%) */
    dictationRate: number | null;
    /** 받아쓰기 통과 문항 / 받아쓰기한 세트의 전체 문항 */
    dictationPassed?: number;
    dictationTotal?: number;
    tasksDone: number;
    tasksTotal: number;
  };
  video: { courses: number; lessonsDone: number };
}

export interface StudentReport {
  generatedAt: string;
  range: ReportRange;
  rangeLabel: string;
  student: {
    id: string;
    name: string;
    loginId: string | null;
    classNames: string[];
  };
  summary: {
    videoLine: string;
    vocabLine: string;
    reviewLine: string;
    listeningScheduleLine: string;
    listeningDictationLine: string;
    listeningExamLine: string;
  };
  courses: CourseReportSection[];
  vocabSets: VocabReportSection[];
  listeningSchedule: ListeningScheduleReportRow[];
  listeningDictation: ListeningDictationReportRow[];
  listeningExam: ListeningExamReportRow[];
  reviewWords: ReviewWordRow[];
  /** 예전에 저장한 리포트에는 없다 */
  overview?: ReportOverview;
}
