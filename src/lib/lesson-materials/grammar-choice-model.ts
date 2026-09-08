export const DEFAULT_GRAMMAR_GENERATOR_MODEL = "gpt-5.6-sol";
export const DEFAULT_GRAMMAR_REVIEWER_MODEL = "gpt-5.6-sol";
export const DEFAULT_GRAMMAR_GENERATOR_REASONING_EFFORT = "medium";
export const DEFAULT_GRAMMAR_REVIEWER_REASONING_EFFORT = "high";

const EFFORTS = new Set(["low", "medium", "high", "xhigh"]);

export type GrammarReasoningEffort = "low" | "medium" | "high" | "xhigh";

function readEffort(raw: string | undefined, fallback: GrammarReasoningEffort): GrammarReasoningEffort {
  const value = raw?.trim().toLowerCase();
  if (value && EFFORTS.has(value)) return value as GrammarReasoningEffort;
  return fallback;
}

/** 어법 전용 환경변수 → 어법 전용 기본값. OPENAI_MODEL_WORKBOOK / gpt-4o 로 대체하지 않는다. */
export function resolveGrammarGeneratorModel(): string {
  return (
    process.env.OPENAI_GRAMMAR_GENERATOR_MODEL?.trim() ||
    DEFAULT_GRAMMAR_GENERATOR_MODEL
  );
}

export function resolveGrammarReviewerModel(): string {
  return (
    process.env.OPENAI_GRAMMAR_REVIEWER_MODEL?.trim() ||
    DEFAULT_GRAMMAR_REVIEWER_MODEL
  );
}

export function resolveGrammarGeneratorReasoningEffort(): GrammarReasoningEffort {
  return readEffort(
    process.env.OPENAI_GRAMMAR_GENERATOR_REASONING_EFFORT,
    DEFAULT_GRAMMAR_GENERATOR_REASONING_EFFORT
  );
}

export function resolveGrammarReviewerReasoningEffort(): GrammarReasoningEffort {
  return readEffort(
    process.env.OPENAI_GRAMMAR_REVIEWER_REASONING_EFFORT,
    DEFAULT_GRAMMAR_REVIEWER_REASONING_EFFORT
  );
}

export type GrammarChoiceModelFailure = {
  stage: "GENERATOR" | "REVIEWER";
  requestedModel: string;
  requestedReasoningEffort: string;
  errorCode: string;
  errorMessage: string;
  fallbackUsed: false;
};

export class GrammarChoiceModelError extends Error {
  stage: GrammarChoiceModelFailure["stage"];
  requestedModel: string;
  requestedReasoningEffort: string;
  errorCode: string;
  errorMessage: string;
  fallbackUsed: false;

  constructor(input: Omit<GrammarChoiceModelFailure, "fallbackUsed">) {
    super(
      `[${input.stage}] ${input.requestedModel} / reasoning=${input.requestedReasoningEffort}: ${input.errorMessage}`
    );
    this.name = "GrammarChoiceModelError";
    this.stage = input.stage;
    this.requestedModel = input.requestedModel;
    this.requestedReasoningEffort = input.requestedReasoningEffort;
    this.errorCode = input.errorCode;
    this.errorMessage = input.errorMessage;
    this.fallbackUsed = false;
  }

  toJSON(): GrammarChoiceModelFailure {
    return {
      stage: this.stage,
      requestedModel: this.requestedModel,
      requestedReasoningEffort: this.requestedReasoningEffort,
      errorCode: this.errorCode,
      errorMessage: this.errorMessage,
      fallbackUsed: false,
    };
  }
}
