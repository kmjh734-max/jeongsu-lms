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

/** PDF WORKBOOK 1~10 단계 정의 */
export const WORKBOOK_10_STEPS: Array<{
  number: number;
  step_type: ExamStepType;
  label: string;
  shortLabel: string;
}> = [
  {
    number: 1,
    step_type: "comprehension",
    label: "1단계 · 지문 연습하기 (본문 이해)",
    shortLabel: "지문 연습",
  },
  {
    number: 2,
    step_type: "korean_blank",
    label: "2단계 · 빈칸 완성하기 (우리말)",
    shortLabel: "우리말 빈칸",
  },
  {
    number: 3,
    step_type: "english_blank",
    label: "3단계 · 빈칸 완성하기 (영문)",
    shortLabel: "영문 빈칸",
  },
  {
    number: 4,
    step_type: "translation_practice",
    label: "4단계 · 해석 연습하기",
    shortLabel: "해석 연습",
  },
  {
    number: 5,
    step_type: "verb_form",
    label: "5단계 · 동사형 연습하기",
    shortLabel: "동사형",
  },
  {
    number: 6,
    step_type: "grammar_vocab_choice",
    label: "6단계 · 어법·어휘 고르기",
    shortLabel: "어법·어휘",
  },
  {
    number: 7,
    step_type: "error_correction",
    label: "7단계 · 어색한 곳 찾아 고쳐 쓰기",
    shortLabel: "고쳐 쓰기",
  },
  {
    number: 8,
    step_type: "sentence_order",
    label: "8단계 · 순서 배열하기",
    shortLabel: "문장 배열",
  },
  {
    number: 9,
    step_type: "paragraph_order",
    label: "9단계 · 문단 배열하기",
    shortLabel: "문단 배열",
  },
  {
    number: 10,
    step_type: "writing",
    label: "10단계 · 영작 연습하기",
    shortLabel: "영작",
  },
];

function step(
  type: ExamStepType,
  order: number,
  opts?: Partial<ExamStepDraft>
): ExamStepDraft {
  return {
    step_type: type,
    step_order: order,
    title: opts?.title ?? EXAM_STEP_LABELS[type],
    difficulty: "medium",
    passing_score: type === "comprehension" ? 0 : 70,
    is_required: true,
    sequential_unlock: true,
    max_attempts: type === "comprehension" ? 1 : 3,
    show_answer_policy: "after_submit",
    settings: {},
    ...opts,
  };
}

/** 선택한 단계 번호(1~10)로 워크북 단계 구성 */
export function buildStepsFromNumbers(numbers: number[]): ExamStepDraft[] {
  const unique = [...new Set(numbers)]
    .filter((n) => n >= 1 && n <= 10)
    .sort((a, b) => a - b);
  return unique.map((n, i) => {
    const def = WORKBOOK_10_STEPS.find((s) => s.number === n)!;
    return step(def.step_type, i + 1, {
      title: `${n}단계 · ${def.shortLabel}`,
      settings: { workbookStepNumber: n },
    });
  });
}

/** 빠른 설정 프리셋 → 단계 번호 */
export const EXAM_PRESET_STEP_NUMBERS: Record<
  Exclude<ExamPresetType, "custom">,
  number[]
> = {
  basic: [1, 3, 6, 8, 10],
  memorize: [1, 3, 10],
  exam_eve: [6, 7, 8, 9, 10],
};

/** 빠른 설정 프리셋 */
export const EXAM_PRESETS: Record<
  Exclude<ExamPresetType, "custom">,
  { label: string; description: string; steps: ExamStepDraft[] }
> = {
  basic: {
    label: "기본 코스",
    description: "1·3·6·8·10단계",
    steps: buildStepsFromNumbers(EXAM_PRESET_STEP_NUMBERS.basic),
  },
  memorize: {
    label: "집중 암기 코스",
    description: "1·3·10단계",
    steps: buildStepsFromNumbers(EXAM_PRESET_STEP_NUMBERS.memorize),
  },
  exam_eve: {
    label: "시험 직전 코스",
    description: "6·7·8·9·10단계",
    steps: buildStepsFromNumbers(EXAM_PRESET_STEP_NUMBERS.exam_eve),
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
