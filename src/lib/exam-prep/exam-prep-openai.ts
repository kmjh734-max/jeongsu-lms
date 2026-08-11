/**
 * 워크북 1~10단계 공통 — 최고 상위 OpenAI 설정
 * 기본: gpt-5.5 + reasoning_effort high (환경변수로 xhigh 가능)
 */
import { questionGeneratorChatJson } from "@/lib/question-generator/openai";
import {
  LISTENING_MODEL_FALLBACK,
  LISTENING_MODEL_PRIMARY,
} from "@/lib/listening/openai-listening-model";

export const EXAM_PREP_MODEL_PRIMARY =
  process.env.OPENAI_MODEL_EXAM_PREP?.trim() || LISTENING_MODEL_PRIMARY;

export const EXAM_PREP_MODEL_FALLBACK = LISTENING_MODEL_FALLBACK;

export type ExamPrepReasoningEffort =
  | "low"
  | "medium"
  | "high"
  | "xhigh";

/** 품질 최우선: high (OPENAI_EXAM_PREP_REASONING=xhigh 로 더 올림) */
export function getExamPrepReasoningEffort(): ExamPrepReasoningEffort {
  const raw = (process.env.OPENAI_EXAM_PREP_REASONING ?? "high")
    .trim()
    .toLowerCase();
  if (raw === "low" || raw === "medium" || raw === "high" || raw === "xhigh") {
    return raw;
  }
  return "high";
}

export function getExamPrepPreferredModels(): string[] {
  const dedicated = process.env.OPENAI_MODEL_EXAM_PREP?.trim();
  const stage6 = process.env.OPENAI_MODEL_EXAM_PREP_STAGE6?.trim();
  const out: string[] = [];
  const push = (m?: string) => {
    if (m && !out.includes(m)) out.push(m);
  };
  push(dedicated);
  push(stage6);
  push(EXAM_PREP_MODEL_PRIMARY);
  push(EXAM_PREP_MODEL_FALLBACK);
  push("gpt-5.5");
  push("gpt-5");
  return out;
}

export type ExamPrepChatOpts = {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
  reasoningEffort?: ExamPrepReasoningEffort;
};

/** 워크북·시험대비 전용 — 항상 상위 모델 + high(기본) reasoning */
export async function examPrepChatJson(opts: ExamPrepChatOpts): Promise<unknown> {
  return questionGeneratorChatJson({
    system: opts.system,
    user: opts.user,
    temperature: opts.temperature ?? 0.2,
    maxTokens: opts.maxTokens ?? 8000,
    reasoningEffort: (opts.reasoningEffort ?? getExamPrepReasoningEffort()) as
      | "low"
      | "medium"
      | "high"
      | "xhigh",
    preferredModels: getExamPrepPreferredModels(),
  });
}
