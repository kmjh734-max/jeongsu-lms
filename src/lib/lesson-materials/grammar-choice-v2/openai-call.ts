import {
  isGpt5FamilyModel,
  isUnsupportedParameterError,
} from "@/lib/student-records/model";
import { GrammarChoiceModelError } from "@/lib/lesson-materials/grammar-choice-model";

function parseJsonSafe<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * 분석 호출 지연은 편차가 크다(관측: 1문장 29초, 3문장 79초, 180초 초과 사례).
 * 상한을 넘기면 abort하되, 원시 AbortError가 아니라 진단 가능한 오류로 바꿔 던진다.
 */
export const REQUEST_TIMEOUT_MS = 180_000;

/**
 * 429/5xx 재시도 횟수.
 *
 * 분석 호출은 문장 하나당 하나라 지문을 여러 개 돌리면 순간 동시 호출이
 * 수십 개가 된다. 재시도가 없으면 rate limit 한 번에 그 지문이 통째로
 * 버려진다(호출 실패는 곧 지문 skip이다). 게이트 상한을 올리기 전에
 * 이 경로부터 있어야 한다.
 */
const RATE_LIMIT_RETRIES = 3;
const RATE_LIMIT_BASE_DELAY_MS = 1_000;
const RATE_LIMIT_MAX_DELAY_MS = 20_000;

/** Retry-After는 초 단위 정수 또는 HTTP date로 온다. 초만 받는다. */
function retryDelayMs(res: Response, attempt: number): number {
  const header = Number(res.headers.get("retry-after"));
  if (Number.isFinite(header) && header > 0) {
    return Math.min(header * 1_000, RATE_LIMIT_MAX_DELAY_MS);
  }
  const backoff = RATE_LIMIT_BASE_DELAY_MS * 2 ** attempt;
  // 같은 웨이브의 호출이 한꺼번에 되돌아오지 않게 흩는다.
  const jitter = Math.random() * RATE_LIMIT_BASE_DELAY_MS;
  return Math.min(backoff + jitter, RATE_LIMIT_MAX_DELAY_MS);
}

function isRetriableStatus(status: number): boolean {
  return status === 429 || status === 408 || status >= 500;
}

export async function callGrammarChoiceV2Json(input: {
  stage: "GENERATOR" | "REVIEWER";
  apiKey: string;
  model: string;
  reasoningEffort: string;
  system: string;
  user: string;
  schemaName: string;
  schema: Record<string, unknown>;
  maxCompletionTokens?: number;
}): Promise<{
  content: string;
  responseModel: string;
  rawJson: string;
  latencyMs: number;
  inputTokens: number | null;
  outputTokens: number | null;
  fallback: boolean;
}> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  const started = Date.now();
  let fallback = false;
  try {
    let bodyText = "";
    let ok = false;
    let responseModel = input.model;
    let reasoningField: "effort" | "object" = "effort";
    let useJsonSchema = true;
    let rateLimitRetries = 0;

    // 파라미터 폴백 2회 + rate limit 재시도분까지 도는 상한.
    for (let attempt = 0; attempt < 4 + RATE_LIMIT_RETRIES; attempt++) {
      if (attempt > 0) fallback = true;
      const body: Record<string, unknown> = {
        model: input.model,
        messages: [
          { role: "system", content: input.system },
          { role: "user", content: input.user },
        ],
      };
      const completionCap = input.maxCompletionTokens ?? 12_000;
      if (isGpt5FamilyModel(input.model)) {
        body.max_completion_tokens = completionCap;
      } else {
        body.max_tokens = Math.min(8_000, completionCap);
      }
      if (reasoningField === "object") {
        body.reasoning = { effort: input.reasoningEffort };
      } else {
        body.reasoning_effort = input.reasoningEffort;
      }
      if (useJsonSchema) {
        body.response_format = {
          type: "json_schema",
          json_schema: {
            name: input.schemaName,
            strict: true,
            schema: input.schema,
          },
        };
      }

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${input.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      bodyText = await res.text();
      ok = res.ok;
      if (ok) {
        const envelope = parseJsonSafe<{ model?: string }>(bodyText);
        responseModel = String(envelope?.model ?? input.model);
        break;
      }
      const errMsg = bodyText.slice(0, 800);
      if (isRetriableStatus(res.status) && rateLimitRetries < RATE_LIMIT_RETRIES) {
        const wait = retryDelayMs(res, rateLimitRetries);
        rateLimitRetries += 1;
        await new Promise((resolve) => setTimeout(resolve, wait));
        continue;
      }
      if (
        reasoningField === "effort" &&
        isUnsupportedParameterError(errMsg, "reasoning_effort")
      ) {
        reasoningField = "object";
        continue;
      }
      if (isUnsupportedParameterError(errMsg, "response_format") && useJsonSchema) {
        useJsonSchema = false;
        continue;
      }
      throw new GrammarChoiceModelError({
        stage: input.stage,
        requestedModel: input.model,
        requestedReasoningEffort: input.reasoningEffort,
        errorCode: `HTTP_${res.status}`,
        errorMessage: errMsg || "unknown",
      });
    }

    if (!ok) {
      throw new GrammarChoiceModelError({
        stage: input.stage,
        requestedModel: input.model,
        requestedReasoningEffort: input.reasoningEffort,
        errorCode: "OPENAI_FAILED",
        errorMessage: bodyText.slice(0, 500) || "unknown",
      });
    }

    const json = parseJsonSafe<{
      choices?: Array<{
        finish_reason?: string;
        message?: { content?: string };
      }>;
    }>(bodyText);
    if (json?.choices?.[0]?.finish_reason === "length") {
      throw new GrammarChoiceModelError({
        stage: input.stage,
        requestedModel: input.model,
        requestedReasoningEffort: input.reasoningEffort,
        errorCode: "TOKEN_LIMIT",
        errorMessage: "응답이 토큰 한도로 잘렸습니다.",
      });
    }
    const content = json?.choices?.[0]?.message?.content ?? "";
    if (!content.trim()) {
      throw new GrammarChoiceModelError({
        stage: input.stage,
        requestedModel: input.model,
        requestedReasoningEffort: input.reasoningEffort,
        errorCode: "EMPTY_CONTENT",
        errorMessage: "빈 응답",
      });
    }
    const usage = parseJsonSafe<{
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    }>(bodyText);
    return {
      content,
      responseModel,
      rawJson: content,
      latencyMs: Date.now() - started,
      inputTokens: usage?.usage?.prompt_tokens ?? null,
      outputTokens: usage?.usage?.completion_tokens ?? null,
      fallback,
    };
  } catch (error) {
    if (timedOut) {
      throw new GrammarChoiceModelError({
        stage: input.stage,
        requestedModel: input.model,
        requestedReasoningEffort: input.reasoningEffort,
        errorCode: "TIMEOUT",
        errorMessage: `${Math.round(REQUEST_TIMEOUT_MS / 1000)}초 안에 응답이 오지 않았습니다.`,
      });
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export function parseModelJson<T>(text: string): T {
  const parsed = parseJsonSafe<T>(text);
  if (!parsed) throw new Error("모델 JSON을 해석하지 못했습니다.");
  return parsed;
}
