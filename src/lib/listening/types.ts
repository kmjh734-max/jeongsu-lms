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

export interface ListeningTableRow {
  no: number;
  label: string;
  value: string;
}

export interface MentionedWeatherByTime {
  time: string;
  weather: string;
}

export type { MentionPlan, MentionPlanItem } from "@/lib/listening/type5-mention-plan";
export type { MentionedTimeEntry } from "@/lib/listening/type6-time-choices";
import type { MentionPlan } from "@/lib/listening/type5-mention-plan";
import type { MentionedTimeEntry } from "@/lib/listening/type6-time-choices";

export interface PurchaseSelectedConditions {
  item_type: string;
  color: string;
  pattern_or_shape: string;
  extra_feature: string;
  final_choice_sentence: string;
}

export interface ListeningTableData {
  title: string;
  rows: ListeningTableRow[];
  mismatch_no: number;
  mismatch_reason: string;
}

export interface AnswerValidationPayload {
  is_answer_clear: boolean;
  correct_answer_verified: boolean;
  has_multiple_possible_answers: boolean;
  ambiguous_choices: string[];
  answer_clue: string;
  problems: string[];
  suggestions: string[];
  answer_clarity_score: number;
  /** 19~20번 맥락 검수 */
  response_context_score?: number;
  previous_turn?: string;
  best_response?: string;
  second_possible_answer?: string | null;
  has_context_mismatch?: boolean;
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
  quality_score?: number;
  answer_clarity_score?: number;
  is_answer_clear?: boolean;
  has_multiple_possible_answers?: boolean;
  has_answer_clue?: boolean;
  problems?: string[];
  suggestions?: string[];
  answer_validation?: AnswerValidationPayload;
  table_data?: ListeningTableData | null;
  previous_turn?: string;
  correct_response_function?: string;
  distractor_reason?: string[];
  blank_speaker?: string;
  situation_type?: string;
  needs_image_choices?: boolean;
  choice_image_prompts?: string[];
  choice_image_urls?: string[];
  visual_choice_type?: string;
  selected_conditions?: PurchaseSelectedConditions;
  weather_target_location?: string;
  weather_target_time?: string;
  weather_answer?: string;
  mentioned_weather_by_time?: MentionedWeatherByTime[];
  last_speaker?: "M" | "W";
  final_utterance?: string;
  target_intention?: string;
  intention_candidates?: string[];
  mention_plan?: MentionPlan | null;
  time_question_target?: string;
  final_time?: string;
  mentioned_times?: MentionedTimeEntry[];
  target_person?: string;
  dream_job?: string;
  interest_clues?: string[];
  target_emotion?: string;
  emotion_clues?: string[];
  immediate_action?: string;
  mentioned_actions?: import("@/lib/listening/type9-action-choices").MentionedActionEntry[];
  main_content?: string;
  content_clues?: string[];
  topic_distractor_reasons?: import("@/lib/listening/type10-content-choices").TopicDistractorReason[];
  destination?: string;
  final_transport?: string;
  mentioned_transport_options?: import("@/lib/listening/type11-transport-choices").MentionedTransportEntry[];
  target_place?: string;
  reason_for_going?: string;
  mentioned_possible_reasons?: import("@/lib/listening/type12-reason-choices").MentionedPossibleReason[];
  place_clues?: string[];
  distractor_places?: import("@/lib/listening/type13-place-choices").DistractorPlace[];
  source_facts_from_script?: import("@/lib/listening/type14-table-validation").SourceFactFromScript[];
  requester?: string;
  requested_person?: string;
  requested_action?: string;
  request_expression?: string;
  suggester?: string;
  suggested_to?: string;
  suggested_action?: string;
  suggestion_expression?: string;
  target_time?: string;
  planned_action?: string;
  mentioned_other_actions?: import("@/lib/listening/type17-schedule-choices").MentionedOtherActionEntry[];
  target_job?: string;
  job_clues?: string[];
  distractor_jobs?: import("@/lib/listening/type18-job-choices").DistractorJobEntry[];
  quality_check_focus?: string[];
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
  quality_score: number | null;
  answer_clarity_score: number | null;
  quality_issues: QualityIssuePayload[];
  answer_validation: AnswerValidationPayload | Record<string, unknown>;
  table_data: ListeningTableData | null;
  previous_turn: string;
  correct_response_function: string;
  distractor_reason: string[];
  blank_speaker: string;
  situation_type: string;
  needs_image_choices: boolean;
  choice_image_prompts: string[];
  choice_image_urls?: string[];
  visual_choice_type: string;
  selected_conditions: PurchaseSelectedConditions | null;
  weather_target_location: string;
  weather_target_time: string;
  weather_answer: string;
  mentioned_weather_by_time: MentionedWeatherByTime[];
  last_speaker: string;
  final_utterance: string;
  target_intention: string;
  intention_candidates: string[];
  mention_plan: MentionPlan | Record<string, unknown>;
  time_question_target: string;
  final_time: string;
  mentioned_times: MentionedTimeEntry[];
  target_person: string;
  dream_job: string;
  interest_clues: string[];
  target_emotion: string;
  emotion_clues: string[];
  immediate_action: string;
  mentioned_actions: import("@/lib/listening/type9-action-choices").MentionedActionEntry[];
  main_content: string;
  content_clues: string[];
  topic_distractor_reasons: import("@/lib/listening/type10-content-choices").TopicDistractorReason[];
  destination: string;
  final_transport: string;
  mentioned_transport_options: import("@/lib/listening/type11-transport-choices").MentionedTransportEntry[];
  target_place: string;
  reason_for_going: string;
  mentioned_possible_reasons: import("@/lib/listening/type12-reason-choices").MentionedPossibleReason[];
  place_clues: string[];
  distractor_places: import("@/lib/listening/type13-place-choices").DistractorPlace[];
  source_facts_from_script: import("@/lib/listening/type14-table-validation").SourceFactFromScript[];
  requester: string;
  requested_person: string;
  requested_action: string;
  request_expression: string;
  suggester: string;
  suggested_to: string;
  suggested_action: string;
  suggestion_expression: string;
  target_time: string;
  planned_action: string;
  mentioned_other_actions: import("@/lib/listening/type17-schedule-choices").MentionedOtherActionEntry[];
  target_job: string;
  job_clues: string[];
  distractor_jobs: import("@/lib/listening/type18-job-choices").DistractorJobEntry[];
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
