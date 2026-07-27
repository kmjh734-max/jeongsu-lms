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
 * 첨부 PDF(유형별 변형문제) 기준 4개 세트.
 * settings.optionKeys = question-generator 옵션 키.
 */
export const WORKBOOK_VARIANT_STEPS: Array<{
  number: number;
  step_type: ExamStepType;
  label: string;
  shortLabel: string;
  optionKeys: string[];
}> = [
  {
    number: 1,
    step_type: "variant_grammar_vocab",
    label: "1세트 · 어법·어휘",
    shortLabel: "어법·어휘",
    optionKeys: [
      "grammar:na:default:어법개수",
      "vocabulary:na:default:어휘추론",
      "grammar:na:default:어법추론",
      "vocabulary:na:default:어휘개수",
    ],
  },
  {
    number: 2,
    step_type: "variant_main_idea",
    label: "2세트 · 대의 파악 (주제·제목·요지)",
    shortLabel: "대의 파악",
    optionKeys: [
      "topic:en:high:주제추론",
      "title:en:high:제목추론",
      "summary_mcq:ko:high:요지추론",
      "summary_mcq:en:default:요지추론",
    ],
  },
  {
    number: 3,
    step_type: "variant_details",
    label: "3세트 · 세부·함축",
    shortLabel: "세부·함축",
    optionKeys: [
      "content_false:ko:high:내용불일치",
      "content_false:en:high:내용불일치",
      "underlined_inference:en:default:함축의미추론",
    ],
  },
  {
    number: 4,
    step_type: "variant_inference",
    label: "4세트 · 추론 (삽입·무관·어법·어휘)",
    shortLabel: "추론",
    optionKeys: [
      "sentence_insertion:na:high:문장삽입",
      "irrelevant_sentence:na:high:무관한문장",
      "grammar:na:default:어법추론",
      "vocabulary:na:default:어휘추론",
    ],
  },
];

/** @deprecated 구 10단계 — 하위호환용 별칭 */
export const WORKBOOK_10_STEPS = WORKBOOK_VARIANT_STEPS.map((s) => ({
  number: s.number,
  step_type: s.step_type,
  label: s.label,
  shortLabel: s.shortLabel,
}));

function step(
  type: ExamStepType,
  order: number,
  opts?: Partial<ExamStepDraft>
): ExamStepDraft {
  return {
    step_type: type,
    step_order: order,
    title: opts?.title ?? EXAM_STEP_LABELS[type] ?? type,
    difficulty: "medium",
    passing_score: 60,
    is_required: true,
    sequential_unlock: true,
    max_attempts: 3,
    show_answer_policy: "after_submit",
    settings: {},
    ...opts,
  };
}

/** 선택한 세트 번호(1~4)로 워크북 단계 구성 */
export function buildStepsFromNumbers(numbers: number[]): ExamStepDraft[] {
  const unique = [...new Set(numbers)]
    .filter((n) => n >= 1 && n <= 4)
    .sort((a, b) => a - b);
  return unique.map((n, i) => {
    const def = WORKBOOK_VARIANT_STEPS.find((s) => s.number === n)!;
    return step(def.step_type, i + 1, {
      title: `${n}세트 · ${def.shortLabel}`,
      settings: {
        workbookStepNumber: n,
        optionKeys: def.optionKeys,
        format: "csat_variant",
      },
    });
  });
}

export const EXAM_PRESET_STEP_NUMBERS: Record<
  Exclude<ExamPresetType, "custom">,
  number[]
> = {
  basic: [1, 2, 3],
  memorize: [2],
  exam_eve: [1, 2, 3, 4],
};

export const EXAM_PRESETS: Record<
  Exclude<ExamPresetType, "custom">,
  { label: string; description: string; steps: ExamStepDraft[] }
> = {
  basic: {
    label: "기본 세트",
    description: "어법·어휘 + 대의 + 세부",
    steps: buildStepsFromNumbers(EXAM_PRESET_STEP_NUMBERS.basic),
  },
  memorize: {
    label: "대의 집중",
    description: "주제·제목·요지",
    steps: buildStepsFromNumbers(EXAM_PRESET_STEP_NUMBERS.memorize),
  },
  exam_eve: {
    label: "시험 직전 (PDF형)",
    description: "첨부 PDF와 같은 유형 전체",
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

export function isVariantStepType(stepType: string): boolean {
  return stepType.startsWith("variant_");
}
