import {
  getListeningGeneratorModelCandidates,
  isGpt5FamilyModel,
  isListeningModelUnavailableError,
  isUnsupportedParameterError,
  isUnsupportedTemperatureError,
  LISTENING_GPT5_MAX_COMPLETION_TOKENS,
  listeningModelSupportsCustomTemperature,
} from "@/lib/listening/openai-listening-model";

function modelCandidates(preferred?: string[]): string[] {
  const dedicated = process.env.OPENAI_MODEL_QUESTION_GENERATOR?.trim();
  const base = getListeningGeneratorModelCandidates();
  const extras = (preferred ?? []).map((m) => m.trim()).filter(Boolean);
  const ordered: string[] = [];
  const push = (m: string) => {
    if (m && !ordered.includes(m)) ordered.push(m);
  };
  for (const m of extras) push(m);
  if (dedicated) push(dedicated);
  for (const m of base) push(m);
  return ordered;
}

type RequestProfile = {
  includeTemperature: boolean;
  includeJsonMode: boolean;
  includeReasoningEffort: boolean;
};

function defaultProfile(model: string): RequestProfile {
  const gpt5 = isGpt5FamilyModel(model);
  return {
    includeTemperature: listeningModelSupportsCustomTemperature(model),
    includeJsonMode: true,
    includeReasoningEffort: gpt5,
  };
}

function buildBody(
  model: string,
  system: string,
  user: string,
  temperature: number,
  maxTokens: number,
  profile: RequestProfile,
  reasoningEffort?: "low" | "medium" | "high" | "xhigh"
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  };
  if (profile.includeJsonMode) {
    body.response_format = { type: "json_object" };
  }
  if (profile.includeTemperature) {
    body.temperature = temperature;
  }
  if (isGpt5FamilyModel(model)) {
    body.max_completion_tokens = Math.min(
      LISTENING_GPT5_MAX_COMPLETION_TOKENS,
      maxTokens
    );
    if (profile.includeReasoningEffort) {
      body.reasoning_effort = reasoningEffort ?? "low";
    }
  } else {
    body.max_tokens = Math.min(NON_GPT5_MAX_TOKENS, maxTokens);
  }
  return body;
}

function relaxProfile(
  model: string,
  profile: RequestProfile,
  bodyText: string
): RequestProfile | null {
  const next = { ...profile };
  let changed = false;
  if (next.includeTemperature && isUnsupportedTemperatureError(bodyText)) {
    next.includeTemperature = false;
    changed = true;
  }
  if (
    next.includeJsonMode &&
    isUnsupportedParameterError(bodyText, "response_format")
  ) {
    next.includeJsonMode = false;
    changed = true;
  }
  if (
    next.includeReasoningEffort &&
    isUnsupportedParameterError(bodyText, "reasoning_effort")
  ) {
    next.includeReasoningEffort = false;
    changed = true;
  }
  return changed ? next : null;
}

/**
 * 재시도 정책 (호출 낭비 방지)
 * - 한 모델당 실제 요청은 최대 3회 (첫 요청 + 재시도 2회)
 *   · finish_reason "length"(토큰 상한으로 잘림) → 상한을 올려 1회
 *   · 빈 응답 / JSON 해석 실패 → 1회
 *   · 429·5xx·네트워크 오류 → 짧은 대기 후 1회 (총 2회 시도)
 * - 파라미터 미지원 400(temperature·reasoning_effort·response_format)은
 *   해당 파라미터를 빼고 다시 보냄 (과금 없는 거절이라 위 횟수에 포함하지 않음)
 * - 모델 폴백은 1회 (사용할 수 없는 모델은 건너뛰고 세지 않음)
 */
const MAX_ATTEMPTS_PER_MODEL = 3;
const MAX_MODELS_TRIED = 2;
const MAX_PROFILE_RELAXES = 3;
const TRANSIENT_BACKOFF_DEFAULT_MS = 1500;
const TRANSIENT_BACKOFF_MAX_MS = 8000;
const NON_GPT5_MAX_TOKENS = 8192;

function tokenLimitFor(model: string): number {
  return isGpt5FamilyModel(model)
    ? LISTENING_GPT5_MAX_COMPLETION_TOKENS
    : NON_GPT5_MAX_TOKENS;
}

function isTransientStatus(status: number, bodyText: string): boolean {
  if (status === 429) {
    // 크레딧 소진은 기다려도 풀리지 않음
    return !bodyText.toLowerCase().includes("insufficient_quota");
  }
  return status === 408 || status >= 500;
}

function transientBackoffMs(res: Response | null): number {
  const retryAfterMs = Number(res?.headers.get("retry-after-ms"));
  if (Number.isFinite(retryAfterMs) && retryAfterMs > 0) {
    return Math.min(retryAfterMs, TRANSIENT_BACKOFF_MAX_MS);
  }
  const retryAfterSec = Number(res?.headers.get("retry-after"));
  if (Number.isFinite(retryAfterSec) && retryAfterSec > 0) {
    return Math.min(retryAfterSec * 1000, TRANSIENT_BACKOFF_MAX_MS);
  }
  return TRANSIENT_BACKOFF_DEFAULT_MS + Math.floor(Math.random() * 500);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("JSON 파싱에 실패했습니다.");
  }
}

export async function questionGeneratorChatJson(opts: {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
  /** GPT-5 계열 reasoning_effort (기본 low) */
  reasoningEffort?: "low" | "medium" | "high" | "xhigh";
  /** 우선 시도할 모델 (예: gpt-5.5) */
  preferredModels?: string[];
}): Promise<unknown> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY가 설정되지 않았습니다.");
  }

  const temperature = opts.temperature ?? 0.35;
  const baseMaxTokens = opts.maxTokens ?? 4096;
  let lastError = "생성 요청에 실패했습니다.";
  let modelsTried = 0;

  for (const model of modelCandidates(opts.preferredModels)) {
    if (modelsTried >= MAX_MODELS_TRIED) break;

    let profile = defaultProfile(model);
    let maxTokens = baseMaxTokens;
    let attempts = 0;
    let relaxes = 0;
    let lengthRetried = false;
    let contentRetried = false;
    let transientRetried = false;
    let reachedModel = false;

    while (attempts < MAX_ATTEMPTS_PER_MODEL) {
      let res: Response;
      let bodyText: string;
      try {
        res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            buildBody(
              model,
              opts.system,
              opts.user,
              temperature,
              maxTokens,
              profile,
              opts.reasoningEffort
            )
          ),
        });
        bodyText = await res.text();
      } catch {
        // 네트워크 오류 — 짧게 쉬고 1회만 더
        reachedModel = true;
        attempts++;
        lastError = "생성 서버와 연결하지 못했습니다.";
        if (!transientRetried && attempts < MAX_ATTEMPTS_PER_MODEL) {
          transientRetried = true;
          await sleep(transientBackoffMs(null));
          continue;
        }
        break;
      }

      if (!res.ok) {
        // 파라미터 미지원 거절은 모델 미존재로 오인하기 전에 먼저 걸러 냄
        const relaxed =
          relaxes < MAX_PROFILE_RELAXES
            ? relaxProfile(model, profile, bodyText)
            : null;
        if (relaxed) {
          profile = relaxed;
          relaxes++;
          continue;
        }
        if (isListeningModelUnavailableError(res.status, bodyText)) {
          lastError = `모델 ${model}을(를) 사용할 수 없습니다.`;
          break;
        }
        reachedModel = true;
        attempts++;
        lastError = `생성 요청 실패 (${res.status})`;
        if (
          isTransientStatus(res.status, bodyText) &&
          !transientRetried &&
          attempts < MAX_ATTEMPTS_PER_MODEL
        ) {
          transientRetried = true;
          await sleep(transientBackoffMs(res));
          continue;
        }
        break;
      }

      reachedModel = true;
      attempts++;

      let parsed: {
        choices?: Array<{
          message?: { content?: string | null };
          finish_reason?: string;
        }>;
      } = {};
      try {
        parsed = JSON.parse(bodyText);
      } catch {
        parsed = {};
      }
      const choice = parsed.choices?.[0];
      const content = String(choice?.message?.content ?? "");
      if (content.trim()) {
        try {
          return extractJsonObject(content);
        } catch {
          // 아래에서 재시도 여부 판단
        }
      }

      // 토큰 상한으로 잘림 → 상한을 올려 1회
      const limit = tokenLimitFor(model);
      if (
        choice?.finish_reason === "length" &&
        !lengthRetried &&
        Math.min(limit, maxTokens) < limit
      ) {
        lengthRetried = true;
        maxTokens = Math.min(limit, Math.max(maxTokens * 2, maxTokens + 2048));
        lastError = "응답이 길이 제한으로 잘렸습니다.";
        continue;
      }

      // 빈 응답·해석 불가 → 같은 설정으로 1회
      lastError = content.trim()
        ? "응답 형식을 해석하지 못했습니다."
        : "응답이 비어 있습니다.";
      if (!contentRetried) {
        contentRetried = true;
        continue;
      }
      break;
    }

    if (reachedModel) modelsTried++;
  }

  throw new Error(lastError);
}

/**
 * 재시도·모델 폴백은 questionGeneratorChatJson 안에서 처리한다.
 * (예전처럼 전체를 한 번 더 돌리면 최악 호출 수가 두 배가 되므로 그대로 위임)
 */
export async function questionGeneratorChatJsonWithRetry(
  opts: Parameters<typeof questionGeneratorChatJson>[0]
): Promise<unknown> {
  return questionGeneratorChatJson(opts);
}
