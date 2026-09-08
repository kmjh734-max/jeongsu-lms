export type AnalysisHint = {
  sentenceId: string;
  grammarName: string;
  explanationKo: string;
  quotedExpression: string | null;
  importance: "high" | "medium" | "low";
};

export type GrammarChoiceCategory =
  | "relative"
  | "noun_clause"
  | "agreement"
  | "voice"
  | "tense_aspect"
  | "finite_nonfinite"
  | "infinitive_gerund"
  | "participle"
  | "parallelism"
  | "complement"
  | "conjunction_preposition"
  | "special_construction"
  | "other";

export type DifficultyLevel = "BASIC" | "CORE" | "ADVANCED";

export type SentenceGrammarPoint = {
  sourceSpan: string;
  category: string;
  rule: string;
  difficultyLevel: DifficultyLevel;
  canCreateUniqueChoice: boolean;
  reasonIfUnavailable: string | null;
};

export type SentenceGrammarSurvey = {
  sentenceId: string;
  originalSentence: string;
  wordCount: number;
  grammarPoints: SentenceGrammarPoint[];
};

export type GeneratedGrammarCandidate = {
  candidateId: string;
  passageId: string;
  sentenceId: string;
  correctText: string;
  incorrectText: string;
  occurrenceIndex: number;
  grammarCategory: GrammarChoiceCategory;
  bookTerm: string;
  grammarStructure: string;
  explanationKo: string;
  incorrectReasonKo: string;
  sourceHintUsed: boolean;
  sourceHintName: string | null;
  learningValue: number;
  estimatedDifficulty: number;
  confidence: number;
  difficultyLevel?: DifficultyLevel;
};

export type GrammarReviewRejectionReason =
  | "CORRECT_NOT_ORIGINAL"
  | "CORRECT_UNGRAMMATICAL"
  | "BOTH_OPTIONS_POSSIBLE"
  | "WRONG_ONLY_SEMANTICALLY_AWKWARD"
  | "LEXICAL_OR_COLLOCATION"
  | "TOO_TRIVIAL"
  | "IMPLAUSIBLE_DISTRACTOR"
  | "RANGE_TOO_LARGE"
  | "DUPLICATED_CONTEXT"
  | "NOT_HIGH_SCHOOL_GRAMMAR"
  | "OTHER";

export type GrammarCandidateReview = {
  candidateId: string;
  correctMatchesOriginal: boolean;
  correctSentenceIsGrammatical: boolean;
  incorrectSentenceIsUngrammatical: boolean;
  onlyOneAnswerPossible: boolean;
  testsGrammarNotVocabulary: boolean;
  distractorIsPlausible: boolean;
  selectionRangeIsMinimal: boolean;
  suitableForHighSchoolExam: boolean;
  ambiguityRisk: "low" | "medium" | "high";
  qualityScore: number;
  difficultyScore: number;
  accepted: boolean;
  rejectionReasons: GrammarReviewRejectionReason[];
  finalBookTerm: string;
  finalExplanationKo: string;
  finalIncorrectReasonKo: string;
};

export type CodeValidateRejectReason =
  | "missing_sentence"
  | "correct_not_in_sentence"
  | "occurrence_not_found"
  | "restore_failed"
  | "empty_side"
  | "same_as_incorrect"
  | "too_many_words"
  | "whole_sentence"
  | "subject_leak"
  | "cross_sentence_mix"
  | "overlap"
  | "duplicate"
  | "BOTH_GRAMMATICAL"
  | "BOTH_UNGRAMMATICAL"
  | "SEMANTIC_CONTRAST"
  | "MEANING_ONLY_CONTRAST"
  | "LEXICAL_ONLY"
  | "UNNATURAL_DISTRACTOR"
  | "MECHANICAL_INFINITIVE_MARKER"
  | "MECHANICAL_MODAL_FORM"
  | "NOT_GRAMMAR_POINT"
  | "SOURCE_MISMATCH"
  | "token_span_failed";

export type ValidatedGrammarCandidate = GeneratedGrammarCandidate & {
  sentenceText: string;
  startCharInSentence: number;
  endCharInSentence: number;
  sentenceWithCorrect: string;
  sentenceWithIncorrect: string;
  startTokenIndex: number;
  endTokenIndex: number;
};
