export type DictationBlankLevel = "auto" | "few" | "normal" | "many";

export type DictationImportance =
  | "key_information"
  | "key_expression"
  | "supporting"
  | string;

export interface DictationBlankItem {
  id: string;
  speaker: "M" | "W" | string;
  original_sentence: string;
  display_sentence: string;
  answer: string;
  answer_type: "word" | "phrase" | string;
  importance: DictationImportance;
}

export interface DictationBlankItemClient {
  id: string;
  speaker: string;
  display_sentence: string;
}

export interface DictationPassageLineClient {
  speaker: string;
  text: string;
  blankIds: string[];
}

export interface DictationBlankInputClient {
  id: string;
  label: string;
}

export interface DictationStartPayloadClient {
  attemptId: string;
  passageLines: DictationPassageLineClient[];
  blanks: DictationBlankInputClient[];
}

export interface DictationSetSettings {
  dictation_enabled: boolean;
  dictation_pass_score: number;
  dictation_blank_level: DictationBlankLevel;
  dictation_randomize_on_retry: boolean;
  dictation_lock_next_until_pass: boolean;
}

export const DEFAULT_DICTATION_SETTINGS: DictationSetSettings = {
  dictation_enabled: true,
  dictation_pass_score: 80,
  dictation_blank_level: "auto",
  dictation_randomize_on_retry: true,
  dictation_lock_next_until_pass: true,
};

export interface DictationBlankScoreResult {
  id: string;
  studentAnswer: string;
  correctAnswer: string;
  blankScore: number;
  isCorrect: boolean;
  feedback: string;
}

export interface DictationSubmitResult {
  score: number;
  passed: boolean;
  passScore: number;
  results: DictationBlankScoreResult[];
}
