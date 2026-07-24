export type NeltDraftDomain = {
  domain: "vocabulary" | "grammar" | "listening" | "reading";
  difficultyCode: string | null;
  rawScore: number | null;
  evaluatedLevel: string | null;
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
};

export type NeltDraftGrammarItem = {
  category: string | null;
  detail: string;
  isCorrect: boolean | null;
};

export type NeltExtractedDraft = {
  studentName: string | null;
  studentGradeRaw: string | null;
  testDate: string | null; // YYYY-MM-DD
  testName: string | null;
  overallLevel: string | null;
  overallBand: string | null;
  overallPercentile: number | null;
  totalDurationSeconds: number | null;
  domains: NeltDraftDomain[];
  vocabulary: {
    vocabularySize: number | null;
    elementaryRequiredTotal: number | null;
    elementaryRequiredPercentage: number | null;
    csatVocabularyPercentage: number | null;
  };
  grammar: {
    elementaryGrammarPercentage: number | null;
    items: NeltDraftGrammarItem[];
  };
  sourceUrl: string | null;
  extractionConfidence: number;
  needsReviewFields: string[];
  rawTextPreview: string;
};
