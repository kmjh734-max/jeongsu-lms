export type QuestionTypeCode =
  | "title"
  | "topic"
  | "summary_mcq"
  | "content_true"
  | "content_false"
  | "content_count"
  | "order"
  | "sentence_blank"
  | "irrelevant_sentence"
  | "sentence_insertion"
  | "underlined_inference"
  | "grammar"
  | "vocabulary"
  | "summary_short"
  | "writing"
  | "short_title"
  | "short_topic";

export type QuestionCategory =
  | "main_idea"
  | "details"
  | "inference"
  | "grammar_vocabulary"
  | "subjective";

export type DifficultyLevel = "low" | "medium" | "high" | "default";

export type ChoiceLanguage = "english" | "korean" | null;

export type JobStatus =
  | "pending"
  | "analyzing"
  | "generating"
  | "validating"
  | "partially_completed"
  | "completed"
  | "failed";

export type QuestionStatus =
  | "draft"
  | "needs_review"
  | "approved"
  | "archived";

export type GenerationMode = "custom" | "preset";

export interface QuestionTypeOption {
  /** unique key used in request config counts, e.g. title:english:high */
  key: string;
  type: QuestionTypeCode;
  category: QuestionCategory;
  label: string;
  difficulty: DifficultyLevel;
  choiceLanguage: ChoiceLanguage;
  isObjective: boolean;
  preview: string;
}

export interface QuestionTypeGroup {
  category: QuestionCategory;
  label: string;
  options: QuestionTypeOption[];
}

export interface GenerationRequestCounts {
  [optionKey: string]: number;
}

export interface GenerationRequestConfig {
  title: string;
  schoolName: string;
  grade: string;
  sourceType: string;
  sourceDetail: string;
  overallDifficulty: string;
  passage: string;
  mode: GenerationMode;
  presetId: string | null;
  counts: GenerationRequestCounts;
  forceGenerateDespiteWarnings?: boolean;
}

export interface PassageAnalysis {
  overallTopic: string;
  overallMainIdea: string;
  titleCandidates: string[];
  paragraphRoles: Array<{ index: number; role: string; summary: string }>;
  sentenceFacts: Array<{ sentence: string; keyInfo: string }>;
  eventRelations: string[];
  causeEffect: string[];
  compareContrast: string[];
  timeOrder: string[];
  properNouns: string[];
  numbers: string[];
  keyVocabulary: string[];
  antonymCandidates: Array<{ word: string; antonym: string; reason: string }>;
  grammarPoints: Array<{ span: string; point: string }>;
  insertionClues: string[];
  orderClues: string[];
  blankCandidates: string[];
  writingCandidates: string[];
  estimatedDifficulty: string;
  unsuitableTypes: Array<{ type: QuestionTypeCode; reason: string }>;
  warnings: string[];
}

export interface GeneratedChoice {
  number: number;
  text: string;
}

export interface GeneratedEvidence {
  sentence: string;
  description: string;
}

export interface ScoringGuide {
  totalPoints: number;
  fullScoreCondition: string;
  partialScoreConditions: Array<{ points: number; condition: string }>;
  requiredKeywords?: string[];
  requiredGrammar?: string[];
}

export interface QuestionValidation {
  singleCorrectAnswer: boolean;
  answerMatchesExplanation: boolean;
  evidenceExists: boolean;
  ambiguityRisk: "low" | "medium" | "high";
  difficultyMatch: boolean;
  grammarChecked: boolean;
  overallScore: number;
  warnings: string[];
  typeMatch?: boolean;
}

export interface GeneratedQuestionPayload {
  type: QuestionTypeCode;
  category: QuestionCategory;
  difficulty: DifficultyLevel;
  choiceLanguage: ChoiceLanguage;
  passageOriginal: string;
  passageModified?: string;
  instruction: string;
  questionText: string;
  choices?: GeneratedChoice[];
  correctAnswer: string | number | number[];
  acceptableAnswers?: string[];
  explanation: string;
  evidence: GeneratedEvidence[];
  scoringGuide?: ScoringGuide;
  validation?: QuestionValidation;
}

export interface PresetConfig {
  counts: GenerationRequestCounts;
}

export interface QuestionSetItem {
  questionId: string;
  orderIndex: number;
}
