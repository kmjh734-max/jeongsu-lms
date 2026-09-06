export type BlankCandidateSource =
  | "ai"
  | "saved-vocabulary"
  | "deterministic-fallback";

export type BlankRejectionCode =
  | "FUNCTION_WORD"
  | "TOO_COMMON"
  | "LOW_LEARNING_VALUE"
  | "LOW_CONTEXT_VALUE"
  | "WORD_FAMILY_DUPLICATE"
  | "SEMANTIC_DUPLICATE"
  | "PARALLEL_LIST_DUPLICATE"
  | "BETTER_CANDIDATE_IN_PHRASE"
  | "REPEATED_OCCURRENCE"
  | "MAX_COUNT_REACHED"
  | "TOKEN_MAPPING_FAILED"
  | "SOURCE_TEXT_MISMATCH"
  | "SENTENCE_CAP"
  | "ADJACENT_GAP"
  | "GRADE_DEFERRED"
  | "NOT_SELECTED";

export type BlankCandidateDiagnostic = {
  sentenceId: string;
  token: string;
  lemma: string;
  wordFamily: string;
  tokenStartIndex: number;
  tokenEndIndex: number;
  sources: BlankCandidateSource[];
  grade: "A" | "B" | "C" | "REJECT";
  centrality: number;
  learningValue: number;
  contextImportance: number;
  examUsefulness: number;
  collocationValue: number;
  commonnessPenalty: number;
  redundancyPenalty: number;
  finalScore: number;
  competitionGroup?: string;
  selected: boolean;
  selectedRank?: number;
  decisionReason: string;
  rejectionCodes: BlankRejectionCode[];
};

export type BlankSelectionStats = {
  totalWordCount: number;
  targetMin: number;
  targetMax: number;
  aiCandidateCount: number;
  savedVocabularyCandidateCount: number;
  fallbackCandidateCount: number;
  mergedCandidateCount: number;
  gradeACount: number;
  gradeBCount: number;
  gradeCCount: number;
  rejectedCount: number;
  selectedACount: number;
  selectedBCount: number;
  selectedCCount: number;
  finalBlankCount: number;
};

export function printBlankSelectionDiagnostics(
  passageId: string,
  mode: string,
  diagnostics: BlankCandidateDiagnostic[],
  stats: BlankSelectionStats
): void {
  if (process.env.NODE_ENV === "production") return;

  console.group(`[BlankSelection] ${passageId} / ${mode}`);
  console.log("[BlankSelection] stats", stats);
  console.table(
    diagnostics.map((item) => ({
      token: item.token,
      sources: item.sources.join(","),
      grade: item.grade,
      score: item.finalScore,
      selected: item.selected,
      rank: item.selectedRank ?? "-",
      reason: item.decisionReason,
      rejectedBy: item.rejectionCodes.join(","),
    }))
  );
  if (stats.finalBlankCount < stats.targetMin) {
    console.warn("[BlankSelection] 목표 최소 개수 미달", {
      passageId,
      finalBlankCount: stats.finalBlankCount,
      targetMin: stats.targetMin,
      candidateCounts: {
        ai: stats.aiCandidateCount,
        vocab: stats.savedVocabularyCandidateCount,
        fallback: stats.fallbackCandidateCount,
        merged: stats.mergedCandidateCount,
      },
    });
  }
  console.groupEnd();
}
