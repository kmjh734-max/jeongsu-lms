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

/**
 * 이 시간 안에 답이 없으면 같은 요청을 하나 더 보내고 먼저 온 답을 쓴다.
 *
 * 관측(2026-09-11): 판정 호출 하나가 21초 동안 멈춰 있다가 500을 돌려주고,
 * 재시도도 500, 그다음 재시도가 36초 걸려 4지문 전체가 30초대에서 76초가 됐다.
 * 나머지 판정 호출은 대부분 3~7초에 끝났다. 지문 전체가 가장 느린 호출 하나를
 * 기다리는 구조라, 멈춘 호출 하나가 곧 전체 시간이다.
 *
 * 문턱은 단계별 정상 분포의 꼬리 바깥에 둔다(판정 p50 약 4초, 분석 none p90 약
 * 13초). 추론이 길어서 느린 정상 호출도 복제되지만, 판정 호출은 출력이 수백
 * 토큰이라 비용이 작다.
 */
const HEDGE_AFTER_MS: Record<"GENERATOR" | "REVIEWER", number> = {
  GENERATOR: 20_000,
  REVIEWER: 12_000,
};

/**
 * 판정 단계는 이 시간이 지나면 복제 요청까지 모두 접고 실패로 끝낸다.
 *
 * 복제로 못 구하는 느린 호출이 있다. 같은 묶음에서 모델이 추론을 멈추지 않아
 * 출력 상한(1,200토큰)을 채우는 경우로, 원 요청 59초, 복제 요청 78초가 걸린 뒤
 * 둘 다 TOKEN_LIMIT로 실패했다(2026-09-11). 어차피 실패로 끝날 호출을 기다리느라
 * 4지문 전체가 102초가 됐다. 정상 판정 호출은 대부분 15초 안에 끝나고, 성공한
 * 가장 긴 호출이 25.7초였다.
 *
 * 분석 단계는 REQUEST_TIMEOUT_MS를 그대로 쓴다. 분석이 실패하면 지문이 통째로 빠진다.
 */
const STAGE_DEADLINE_MS: Record<"GENERATOR" | "REVIEWER", number | null> = {
  GENERATOR: null,
  REVIEWER: 35_000,
};

type GrammarChoiceV2CallInput = {
  stage: "GENERATOR" | "REVIEWER";
  apiKey: string;
  model: string;
  reasoningEffort: string;
  system: string;
  user: string;
  schemaName: string;
  schema: Record<string, unknown>;
  maxCompletionTokens?: number;
};

type GrammarChoiceV2CallResult = {
  content: string;
  responseModel: string;
  rawJson: string;
  latencyMs: number;
  inputTokens: number | null;
  outputTokens: number | null;
  fallback: boolean;
};

export async function callGrammarChoiceV2Json(
  input: GrammarChoiceV2CallInput
): Promise<GrammarChoiceV2CallResult> {
  const hedgeAfterMs = HEDGE_AFTER_MS[input.stage];
  const deadlineMs = STAGE_DEADLINE_MS[input.stage];
  const primary = new AbortController();
  const backup = new AbortController();
  const started = Date.now();

  return new Promise((resolve, reject) => {
    let settled = false;
    let launched = 1;
    let failed = 0;
    let firstError: unknown = null;

    const finish = () => {
      settled = true;
      clearTimeout(hedgeTimer);
      if (deadlineTimer) clearTimeout(deadlineTimer);
    };

    const run = (own: AbortController, other: AbortController) => {
      callOnce(input, own.signal).then(
        (result) => {
          if (settled) return;
          finish();
          other.abort();
          resolve({ ...result, latencyMs: Date.now() - started });
        },
        (error: unknown) => {
          if (settled) return;
          failed += 1;
          firstError ??= error;
          // 다른 쪽이 아직 돌고 있으면 그 답을 기다린다.
          if (failed < launched) return;
          finish();
          reject(firstError);
        }
      );
    };

    const hedgeTimer = setTimeout(() => {
      if (settled) return;
      launched = 2;
      run(backup, primary);
    }, hedgeAfterMs);

    const deadlineTimer =
      deadlineMs === null
        ? null
        : setTimeout(() => {
            if (settled) return;
            finish();
            primary.abort();
            backup.abort();
            reject(
              new GrammarChoiceModelError({
                stage: input.stage,
                requestedModel: input.model,
                requestedReasoningEffort: input.reasoningEffort,
                errorCode: "TIMEOUT",
                errorMessage: `${Math.round(deadlineMs / 1000)}초 안에 판정이 오지 않았습니다.`,
              })
            );
          }, deadlineMs);

    run(primary, backup);
  });
}

async function callOnce(
  input: GrammarChoiceV2CallInput,
  cancel: AbortSignal
): Promise<GrammarChoiceV2CallResult> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  const onCancel = () => controller.abort();
  cancel.addEventListener("abort", onCancel, { once: true });
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
    cancel.removeEventListener("abort", onCancel);
  }
}

export function parseModelJson<T>(text: string): T {
  const parsed = parseJsonSafe<T>(text);
  if (!parsed) throw new Error("모델 JSON을 해석하지 못했습니다.");
  return parsed;
}
