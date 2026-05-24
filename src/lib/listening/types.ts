export type ListeningSpeakerType = "ANN" | "M" | "W";

export type ListeningGenerationMode = "free" | "exam";

export interface ListeningScriptSegment {
  speaker: ListeningSpeakerType;
  text: string;
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
  explanation: string;
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
