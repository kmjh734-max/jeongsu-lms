/** 내신대비학습 (Exam Prep) 공통 타입 */

export type ExamPassageStatus = "draft" | "ready" | "archived";
export type ExamWorkbookStatus =
  | "draft"
  | "reviewing"
  | "approved"
  | "archived";

export type ExamStepType =
  | "comprehension"
  | "korean_blank"
  | "english_blank"
  | "translation_practice"
  | "verb_form"
  | "grammar_vocab_choice"
  | "error_correction"
  | "sentence_order"
  | "paragraph_order"
  | "writing"
  /** 하위 호환 (이전 변형세트 실험) */
  | "variant_grammar_vocab"
  | "variant_main_idea"
  | "variant_details"
  | "variant_inference"
  | "csat_mcq";

export type ExamAssignmentStudentStatus =
  | "not_started"
  | "in_progress"
  | "needs_retry"
  | "completed"
  | "overdue";

export type ExamGradingStatus =
  | "pending"
  | "auto_correct"
  | "auto_incorrect"
  | "needs_review"
  | "teacher_correct"
  | "teacher_incorrect";

export type ExamShowAnswerPolicy =
  | "never"
  | "after_submit"
  | "after_pass"
  | "immediate";

export type ExamPresetType = "basic" | "memorize" | "exam_eve" | "custom";

export const EXAM_STEP_LABELS: Record<ExamStepType, string> = {
  comprehension: "지문 익히기",
  korean_blank: "우리말 빈칸 완성하기",
  english_blank: "영문 빈칸 완성하기",
  translation_practice: "해석 연습하기",
  verb_form: "동사형 연습하기",
  grammar_vocab_choice: "어법·어휘 고르기",
  error_correction: "어색한 곳 찾아 고쳐 쓰기",
  sentence_order: "순서 배열하기",
  paragraph_order: "문단 배열하기",
  writing: "영작 연습하기",
  variant_grammar_vocab: "어법·어휘 (변형)",
  variant_main_idea: "대의 파악 (변형)",
  variant_details: "세부·함축 (변형)",
  variant_inference: "추론 (변형)",
  csat_mcq: "유형별 객관식",
};

/** 인천 10단계 WORKBOOK */
export const MVP_STEP_TYPES: ExamStepType[] = [
  "comprehension",
  "korean_blank",
  "english_blank",
  "translation_practice",
  "verb_form",
  "grammar_vocab_choice",
  "error_correction",
  "sentence_order",
  "paragraph_order",
  "writing",
];

export type ExamPassage = {
  id: string;
  academy_id: string;
  set_id?: string | null;
  title: string;
  school_level: string | null;
  school_name: string | null;
  grade: string | null;
  source: string | null;
  exam_name: string | null;
  exam_year: number | null;
  exam_month: number | null;
  textbook_name: string | null;
  publisher: string | null;
  unit_name: string | null;
  exam_range: string | null;
  passage_number: string | null;
  passage_type: string | null;
  difficulty: string | null;
  original_text: string;
  full_translation: string | null;
  teacher_note: string | null;
  exam_points: string | null;
  status: ExamPassageStatus;
  stage2_published: boolean;
  stage3_published: boolean;
  stage4_published: boolean;
  stage5_published: boolean;
  stage6_published: boolean;
  stage7_published: boolean;
  stage7_required_error_count?: number;
  stage7_content_version?: number;
  stage8_published: boolean;
  stage8_content_version?: number;
  stage9_published: boolean;
  stage9_content_version?: number;
  stage9_fixed_prefix?: string;
  stage9_fixed_suffix?: string;
  stage9_answer_mode?: string;
  stage9_structure_hint?: string | null;
  stage10_published: boolean;
  stage10_content_version?: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ExamPassageSentence = {
  id: string;
  academy_id: string;
  passage_id: string;
  sentence_order: number;
  english_text: string;
  korean_text: string | null;
  paragraph_number: number;
  is_paragraph_start: boolean;
  teacher_note: string | null;
  student_note: string | null;
  stage7_display_text?: string | null;
  vocabulary: unknown;
  grammar_points: unknown;
  exam_points: unknown;
  is_important_writing: boolean;
  created_at: string;
  updated_at: string;
};

export type ExamStage1Progress = {
  id: string;
  academy_id: string;
  assignment_student_id: string;
  passage_id: string;
  stage_number: number;
  completed_sentence_ids: string[];
  last_viewed_sentence_id: string | null;
  progress_percent: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ExamWorkbook = {
  id: string;
  academy_id: string;
  passage_id: string;
  title: string;
  description: string | null;
  preset_type: string | null;
  status: ExamWorkbookStatus;
  created_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ExamWorkbookStep = {
  id: string;
  academy_id: string;
  workbook_id: string;
  step_type: ExamStepType | string;
  step_order: number;
  title: string | null;
  difficulty: string | null;
  passing_score: number;
  is_required: boolean;
  sequential_unlock: boolean;
  max_attempts: number;
  show_answer_policy: ExamShowAnswerPolicy | string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ExamWorkbookQuestion = {
  id: string;
  academy_id: string;
  workbook_id: string;
  step_id: string;
  sentence_id: string | null;
  question_type: string;
  question_order: number;
  question_text: string | null;
  question_data: Record<string, unknown>;
  correct_answer: unknown;
  acceptable_answers: unknown;
  explanation: string | null;
  difficulty: string | null;
  points: number;
  is_active: boolean;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
};

/** 학생에게 내려줄 때 정답 필드 제거 */
export type ExamWorkbookQuestionPublic = Omit<
  ExamWorkbookQuestion,
  "correct_answer" | "acceptable_answers"
>;

export type ExamAssignment = {
  id: string;
  academy_id: string;
  workbook_id: string;
  title: string;
  class_id: string | null;
  start_at: string | null;
  due_at: string | null;
  settings: Record<string, unknown>;
  teacher_message: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ExamAssignmentStudent = {
  id: string;
  academy_id: string;
  assignment_id: string;
  student_id: string;
  status: ExamAssignmentStudentStatus;
  progress_rate: number;
  total_score: number | null;
  current_step_id: string | null;
  started_at: string | null;
  completed_at: string | null;
  last_studied_at: string | null;
  created_at: string;
  updated_at: string;
};
