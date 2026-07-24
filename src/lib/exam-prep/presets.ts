import type { ExamPresetType, ExamStepType } from "@/lib/exam-prep/types";
import { EXAM_STEP_LABELS } from "@/lib/exam-prep/types";

export type ExamStepDraft = {
  step_type: ExamStepType;
  step_order: number;
  title: string;
  difficulty: string;
  passing_score: number;
  is_required: boolean;
  sequential_unlock: boolean;
  max_attempts: number;
  show_answer_policy: "never" | "after_submit" | "after_pass" | "immediate";
  settings: Record<string, unknown>;
};

function step(
  type: ExamStepType,
  order: number,
  opts?: Partial<ExamStepDraft>
): ExamStepDraft {
  return {
    step_type: type,
    step_order: order,
    title: EXAM_STEP_LABELS[type],
    difficulty: "medium",
    passing_score: 70,
    is_required: true,
    sequential_unlock: true,
    max_attempts: 3,
    show_answer_policy: "after_submit",
    settings: {},
    ...opts,
  };
}

/** 빠른 설정 프리셋 */
export const EXAM_PRESETS: Record<
  Exclude<ExamPresetType, "custom">,
  { label: string; description: string; steps: ExamStepDraft[] }
> = {
  basic: {
    label: "기본 코스",
    description: "본문 이해 · 영문 빈칸 · 어법·어휘 · 문장 배열 · 서술형 영작",
    steps: [
      step("comprehension", 1, { passing_score: 0, max_attempts: 1 }),
      step("english_blank", 2, { difficulty: "medium" }),
      step("grammar_vocab_choice", 3),
      step("sentence_order", 4),
      step("writing", 5),
    ],
  },
  memorize: {
    label: "집중 암기 코스",
    description: "본문 이해 · 영문 빈칸(쉬움/보통/어려움) · 서술형 영작",
    steps: [
      step("comprehension", 1, { passing_score: 0, max_attempts: 1 }),
      step("english_blank", 2, {
        title: "영문 빈칸 (쉬움)",
        difficulty: "easy",
        settings: { blankRatio: "easy" },
      }),
      step("english_blank", 3, {
        title: "영문 빈칸 (보통)",
        difficulty: "medium",
        settings: { blankRatio: "medium" },
      }),
      step("english_blank", 4, {
        title: "영문 빈칸 (어려움)",
        difficulty: "hard",
        settings: { blankRatio: "hard" },
      }),
      step("writing", 5),
    ],
  },
  exam_eve: {
    label: "시험 직전 코스",
    description: "어법·어휘 · 오류 수정 · 문장 배열 · 문단 배열 · 서술형 영작",
    steps: [
      step("grammar_vocab_choice", 1),
      step("error_correction", 2),
      step("sentence_order", 3),
      step("paragraph_order", 4),
      step("writing", 5),
    ],
  },
};

export function getPresetSteps(
  preset: Exclude<ExamPresetType, "custom">
): ExamStepDraft[] {
  return EXAM_PRESETS[preset].steps.map((s, i) => ({
    ...s,
    step_order: i + 1,
  }));
}
