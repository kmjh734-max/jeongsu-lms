/** GrammarBlueprint — internal analysis for grammar-choice workbook. */

export type AnalysisCompleteness = "COMPLETE" | "PARTIAL" | "NONE";

export type GrammarBlueprintAnalysisSource =
  | "FULL_ANALYSIS"
  | "PARTIAL_ANALYSIS_WITH_AI_SUPPLEMENT"
  | "LIGHTWEIGHT_AI_ANALYSIS";

export type GrammarNoTestableReason =
  | "NONE"
  | "SIMPLE_SENTENCE_NO_HIGH_VALUE_POINT"
  | "ONLY_LEXICAL_FEATURE"
  | "ONLY_AMBIGUOUS_CONTRAST"
  | "DUPLICATE_OF_STRONGER_POINT";

export type GrammarPointExclusionReason =
  | "NONE"
  | "NO_EXACT_SOURCE_SPAN"
  | "BOTH_OPTIONS_POSSIBLE"
  | "LEXICAL_ONLY"
  | "SPELLING_ONLY"
  | "PUNCTUATION_ONLY"
  | "CANNOT_CREATE_MINIMAL_PAIR"
  | "OVERLAPPING_WITH_HIGHER_PRIORITY"
  | "DUPLICATE_GRAMMAR_POINT"
  | "TOO_TRIVIAL";

export type GrammarContrastType =
  | "RELATIVE_PRONOUN"
  | "NOUN_CLAUSE_CONNECTOR"
  | "SUBJECT_VERB_AGREEMENT"
  | "ACTIVE_PASSIVE"
  | "TENSE_ASPECT"
  | "FINITE_NONFINITE"
  | "INFINITIVE_GERUND"
  | "PARTICIPLE_VOICE"
  | "PREPOSITION_GERUND"
  | "HOW_TO_INFINITIVE"
  | "PARALLEL_FORM"
  | "ALLOW_OBJECT_TO_INF"
  | "HELP_OBJECT_BARE_INF"
  | "BE_MADE_TO_INF"
  | "BE_MEANT_TO_INF"
  | "CONJUNCTION_PREPOSITION"
  | "DUMMY_IT"
  | "COMPARISON"
  | "INVERSION"
  | "SUBJUNCTIVE"
  | "OTHER";

export type GrammarBlueprintPoint = {
  grammarPointId: string;
  sourceAnalysisPointId: string | null;
  targetText: string;
  /** Relative to sentence.originalText */
  targetStartCharIndex: number;
  targetEndCharIndex: number;
  grammarCategoryId: string;
  grammarCategoryName: string;
  bookTerm: string;
  structure: string;
  explanationKo: string;
  importance: "high" | "medium" | "low";
  testWorthiness: number;
  convertibleToChoice: boolean;
  conversionReason: string;
  exclusionReason: GrammarPointExclusionReason;
  contrastType: GrammarContrastType;
  /** Formal report vs internal AI */
  analysisOrigin: "formal_report" | "internal_ai";
};

export type GrammarBlueprintSentence = {
  sentenceId: string;
  sentenceIndex: number;
  originalText: string;
  startCharIndex: number;
  endCharIndex: number;
  structureSummary: string;
  sentencePattern: string;
  hasGrammarPoints: boolean;
  hasTestableGrammarPoint: boolean;
  noTestablePointReason: GrammarNoTestableReason;
  grammarPoints: GrammarBlueprintPoint[];
};

export type GrammarBlueprint = {
  passageId: string;
  sourceHash: string;
  analysisSource: GrammarBlueprintAnalysisSource;
  completeness: AnalysisCompleteness;
  sentenceCount: number;
  analyzedSentenceCount: number;
  sentences: GrammarBlueprintSentence[];
  fullAnalysisHash: string;
  grammarBlueprintVersion: string;
  modelUsed: string | null;
  createdAt: string;
};

export type PassageSentenceSpan = {
  sentenceId: string;
  sentenceIndex: number;
  originalText: string;
  startCharIndex: number;
  endCharIndex: number;
};
