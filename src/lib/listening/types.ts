export type ListeningSpeakerType = "ANN" | "M" | "W";

export type ListeningGenerationMode = "free" | "exam";

export interface ListeningScriptSegment {
  speaker: ListeningSpeakerType;
  text: string;
}

export interface QualityIssuePayload {
  code: string;
  message: string;
}

export interface GeneratedListeningQuestion {
  order_index: number;
  question_type: string;
  instruction: string;
  segments: ListeningScriptSegment[];
  script_text: string;
  script_translation: string;
  question_text: string;
  choices: string[];
  correct_answer: number;
  answer_clue: string;
  explanation: string;
  needs_review?: boolean;
  quality_issues?: QualityIssuePayload[];
}

export interface ListeningQuestionRow {
  id: string;
  set_id: string;
  order_index: number;
  question_type: string;
  instruction: string;
  script_text: string;
  script_translation: string;
  question_text: string;
  choices: string[];
  correct_answer: number;
  explanation: string;
  answer_clue: string;
  needs_review: boolean;
  audio_url: string | null;
}

export interface ListeningSegmentRow {
  id: string;
  question_id: string;
  order_index: number;
  speaker_type: ListeningSpeakerType;
  text: string;
  voice_name: string | null;
  audio_url: string | null;
  duration_ms: number | null;
}
