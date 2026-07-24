import type { NeltAttemptBundle } from "@/lib/nelt/compare/types";
import type { NeltExtractedDraft } from "@/lib/nelt/types-draft";

/** 미리보기 회차 번들 → 저장용 draft */
export function attemptBundleToDraft(
  attempt: NeltAttemptBundle,
  studentName: string
): NeltExtractedDraft {
  return {
    studentName,
    studentGradeRaw: attempt.studentGradeRaw,
    testDate: attempt.testDate,
    testName: attempt.testName,
    overallLevel: attempt.overallLevel,
    overallBand: attempt.overallBand,
    overallPercentile: attempt.overallPercentile,
    totalDurationSeconds: attempt.totalDurationSeconds,
    domains: attempt.domains.map((d) => ({
      domain: d.domain,
      difficultyCode: d.difficultyCode,
      rawScore: d.rawScore,
      evaluatedLevel: d.evaluatedLevel,
      percentile: d.percentile,
      durationSeconds: d.durationSeconds,
      achievementGrade: d.achievementGrade,
      evaluationSummary: d.evaluationSummary,
      subskills: d.subskills,
    })),
    vocabulary: {
      vocabularySize: attempt.vocabulary?.vocabularySize ?? null,
      elementaryRequiredTotal:
        attempt.vocabulary?.elementaryRequiredTotal ?? null,
      elementaryRequiredPercentage:
        attempt.vocabulary?.elementaryRequiredPercentage ?? null,
      csatVocabularyPercentage:
        attempt.vocabulary?.csatVocabularyPercentage ?? null,
    },
    grammar: {
      elementaryGrammarPercentage:
        attempt.grammar?.elementaryGrammarPercentage ?? null,
      items: (attempt.grammar?.items ?? []).map((i) => ({
        category: i.category,
        detail: i.detail,
        isCorrect: i.isCorrect,
      })),
    },
    sourceUrl: attempt.sourceUrl,
    extractionConfidence: 0.9,
    needsReviewFields: [],
    rawTextPreview: "",
  };
}
