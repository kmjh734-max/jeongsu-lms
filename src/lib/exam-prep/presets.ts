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

/**
 * 인천광역시 교육청 학력평가 10단계 WORKBOOK 통합본 기준.
 * 제목·발문은 HWP 원문과 동일하게 맞춤.
 */
export const WORKBOOK_10_STEPS: Array<{
  number: number;
  step_type: ExamStepType;
  label: string;
  shortLabel: string;
  /** 학생·인쇄용 WORKBOOK 발문 */
  prompt: string;
}> = [
  {
    number: 1,
    step_type: "comprehension",
    label: "1단계 · 지문 익히기",
    shortLabel: "지문 익히기",
    prompt:
      "영문과 우리말 해석을 함께 읽으며 문장의 의미를 이해해 보세요.",
  },
  {
    number: 2,
    step_type: "korean_blank",
    label: "2단계 · 우리말 빈칸 완성하기",
    shortLabel: "우리말 빈칸 완성하기",
    prompt: "영문을 읽고 우리말 해석의 빈칸을 완성해 보세요.",
  },
  {
    number: 3,
    step_type: "english_blank",
    label: "3단계 · 영문 빈칸 완성하기",
    shortLabel: "영문 빈칸 완성하기",
    prompt: "우리말 해석을 읽고 영문의 빈칸을 완성해 보세요.",
  },
  {
    number: 4,
    step_type: "translation_practice",
    label: "4단계 · 해석 연습하기",
    shortLabel: "해석 연습하기",
    prompt: "문장 전체의 자연스러운 해석을 써 보세요.",
  },
  {
    number: 5,
    step_type: "verb_form",
    label: "5단계 · 동사형 연습하기",
    shortLabel: "동사형 연습하기",
    prompt:
      "괄호 안에 주어진 단어를 문맥에 맞는 알맞은 형태로 고쳐 쓰세요.",
  },
  {
    number: 6,
    step_type: "grammar_vocab_choice",
    label: "6단계 · 어법·어휘 고르기",
    shortLabel: "어법·어휘 고르기",
    prompt:
      "괄호 안에서 문맥에 맞는 올바른 어법과 어휘를 골라 보세요.",
  },
  {
    number: 7,
    step_type: "error_correction",
    label: "7단계 · 어색한 곳 찾기",
    shortLabel: "어색한 곳 찾기",
    prompt:
      "밑줄 친 부분 중 어법상 어색한 것을 세 개 찾아 알맞게 고쳐 쓰세요.",
  },
  {
    number: 8,
    step_type: "sentence_order",
    label: "8단계 · 순서 배열하기",
    shortLabel: "순서 배열하기",
    prompt:
      "우리말과 같은 뜻이 되도록 주어진 단어를 바르게 배열해 보세요.",
  },
  {
    number: 9,
    step_type: "paragraph_order",
    label: "9단계 · 문단 배열하기",
    shortLabel: "문단 배열하기",
    prompt: "다음 문단을 흐름상 알맞게 배열해 보세요.",
  },
  {
    number: 10,
    step_type: "writing",
    label: "10단계 · 영작 연습하기",
    shortLabel: "영작 연습하기",
    prompt:
      "우리말과 같은 뜻이 되도록 주어진 단어를 순서대로 사용하여 영작하세요.",
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
      settings: {
        workbookStepNumber: n,
        workbookPrompt: def.prompt,
        format: "incheon_10_step",
      },
    });
  });
}

export const EXAM_PRESET_STEP_NUMBERS: Record<
  Exclude<ExamPresetType, "custom">,
  number[]
> = {
  basic: [1, 3, 6, 8, 10],
  memorize: [1, 3, 10],
  exam_eve: [6, 7, 8, 9, 10],
};

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

export function workbookPromptForStepType(stepType: string): string | null {
  return (
    WORKBOOK_10_STEPS.find((s) => s.step_type === stepType)?.prompt ?? null
  );
}
