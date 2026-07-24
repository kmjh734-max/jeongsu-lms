import type { NeltDomain, NeltGrowthStatus } from "@/types/nelt";

export type NeltAttemptBundle = {
  id: string;
  attemptNumber: number;
  testDate: string | null;
  testName: string | null;
  studentGradeRaw: string | null;
  overallLevel: string | null;
  overallBand: string | null;
  overallLevelOrder: number | null;
  overallPercentile: number | null;
  totalDurationSeconds: number | null;
  sourceType: string;
  sourceUrl: string | null;
  domains: Array<{
    domain: NeltDomain;
    difficultyCode: string | null;
    rawScore: number | null;
    evaluatedLevel: string | null;
    evaluatedLevelOrder: number | null;
    percentile: number | null;
    durationSeconds: number | null;
    achievementGrade: string | null;
    evaluationSummary: string | null;
    subskills: Array<{
      name: string;
      description: string | null;
      studentAccuracy: number | null;
      levelAverageAccuracy: number | null;
    }>;
  }>;
  vocabulary: {
    vocabularySize: number | null;
    elementaryRequiredTotal: number | null;
    elementaryRequiredPercentage: number | null;
    elementaryRequiredEstimatedCount: number | null;
    csatVocabularyPercentage: number | null;
  } | null;
  grammar: {
    elementaryGrammarPercentage: number | null;
    correctItemCount: number | null;
    totalItemCount: number | null;
    items: Array<{
      category: string | null;
      detail: string;
      isCorrect: boolean | null;
    }>;
  } | null;
};

export type NeltGrowthHighlightCard = {
  key: string;
  title: string;
  beforeLabel: string;
  afterLabel: string;
  deltaLabel?: string;
  status: NeltGrowthStatus;
  parentVisible: boolean;
  priority: number;
};

export type NeltDomainGrowth = {
  domain: NeltDomain;
  label: string;
  status: NeltGrowthStatus;
  beforeLevel: string | null;
  afterLevel: string | null;
  levelDelta: number | null;
  beforeDifficulty: string | null;
  afterDifficulty: string | null;
  difficultyUp: boolean;
  beforeScore: number | null;
  afterScore: number | null;
  scoreComparable: boolean;
  scoreDelta: number | null;
  beforePercentile: number | null;
  afterPercentile: number | null;
  percentileImproved: boolean;
  percentileDelta: number | null;
  beforeSummary: string | null;
  afterSummary: string | null;
  narrative: string;
};

export type NeltSubskillGrowth = {
  domain: NeltDomain;
  name: string;
  beforeAccuracy: number | null;
  afterAccuracy: number | null;
  delta: number;
};

export type NeltGrammarItemChange = {
  category: string | null;
  detail: string;
  kind: "newly_correct" | "still_correct" | "still_incorrect" | "regressed";
};

/** 회차 간(1→2, 2→3 …) 단계별 변화 */
export type NeltAttemptStep = {
  fromAttempt: number;
  toAttempt: number;
  fromDate: string | null;
  toDate: string | null;
  overallLevelBefore: string | null;
  overallLevelAfter: string | null;
  vocabBefore: number | null;
  vocabAfter: number | null;
  vocabDelta: number | null;
  summary: string;
  domainLines: Array<{
    domain: NeltDomain;
    label: string;
    line: string;
    status: NeltGrowthStatus;
  }>;
};

/** 그래프용 회차별 시계열 */
export type NeltTrendPoint = {
  attemptNumber: number;
  testDate: string | null;
  label: string;
  overallLevelOrder: number | null;
  overallLevel: string | null;
  vocabularySize: number | null;
  domains: Record<
    NeltDomain,
    {
      levelOrder: number | null;
      level: string | null;
      difficulty: string | null;
      score: number | null;
    }
  >;
};

export type NeltGrowthAnalysis = {
  studentName: string;
  attemptCount: number;
  start: NeltAttemptBundle;
  end: NeltAttemptBundle;
  attempts: NeltAttemptBundle[];
  /** 1→2, 2→3 … 단계 변화 */
  attemptSteps: NeltAttemptStep[];
  /** 차트용 시계열 */
  trendPoints: NeltTrendPoint[];
  highlights: NeltGrowthHighlightCard[];
  domainGrowth: NeltDomainGrowth[];
  vocabularyGrowth: {
    beforeSize: number | null;
    afterSize: number | null;
    sizeDelta: number | null;
    sizeMultiplier: number | null;
    beforeRequiredPct: number | null;
    afterRequiredPct: number | null;
    requiredPctDelta: number | null;
    beforeRequiredCount: number | null;
    afterRequiredCount: number | null;
    requiredCountDelta: number | null;
    beforeCsatPct: number | null;
    afterCsatPct: number | null;
    csatPctDelta: number | null;
  };
  subskillGrowth: NeltSubskillGrowth[];
  grammarChanges: NeltGrammarItemChange[];
  newlyCorrectGrammar: NeltGrammarItemChange[];
  focusGrammar: NeltGrammarItemChange[];
  overallNarrative: string;
  strengthsNarrative: string;
  stableNarrative: string;
  nextGoalsNarrative: string;
  learningPlan: Record<
    NeltDomain,
    { strength: string; nextGoal: string; classFocus: string; homework: string }
  >;
  parentCopy: string;
  /** gpt-5.5 등으로 다듬은 학부모용 서술 (있으면 화면 우선) */
  aiNarratives?: {
    version: 1;
    model: string | null;
    attemptFingerprint?: string;
    overallSummary: string;
    strengthsNarrative: string;
    nextGoalsNarrative: string;
    domainExplanations: Partial<Record<NeltDomain, string>>;
    domainPlans: Partial<Record<NeltDomain, string>>;
  };
};
