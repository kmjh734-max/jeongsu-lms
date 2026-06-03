import {
  getListeningGeneratorModelCandidates,
  isGpt5FamilyModel,
  isListeningModelUnavailableError,
  isUnsupportedParameterError,
  isUnsupportedTemperatureError,
  LISTENING_GPT5_MAX_COMPLETION_TOKENS,
  listeningModelSupportsCustomTemperature,
} from "@/lib/listening/openai-listening-model";

export interface ListeningChatOptions {
  system: string;
  user: string;
  temperature?: number;
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

function buildChatCompletionBody(
  model: string,
  opts: ListeningChatOptions,
  profile: RequestProfile
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.user },
    ],
  };

  if (profile.includeJsonMode) {
    body.response_format = { type: "json_object" };
  }
  if (profile.includeTemperature) {
    body.temperature = opts.temperature ?? 0.4;
  }
  if (isGpt5FamilyModel(model)) {
    body.max_completion_tokens = LISTENING_GPT5_MAX_COMPLETION_TOKENS;
    if (profile.includeReasoningEffort) {
      body.reasoning_effort = "low";
    }
  } else {
    body.max_tokens = 8192;
  }

  return body;
}

function relaxProfile(
  model: string,
  profile: RequestProfile,
  bodyText: string
): RequestProfile | null {
  let next = { ...profile };
  let changed = false;

  if (next.includeTemperature && isUnsupportedTemperatureError(bodyText)) {
    next.includeTemperature = false;
    changed = true;
  }
  if (next.includeJsonMode && isUnsupportedParameterError(bodyText, "response_format")) {
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

async function postChatCompletion(
  apiKey: string,
  model: string,
  opts: ListeningChatOptions,
  profile: RequestProfile
): Promise<Response> {
  return fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildChatCompletionBody(model, opts, profile)),
  });
}

function extractJsonText(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return trimmed;
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

function parseCompletionContent(
  data: {
    choices?: Array<{
      message?: { content?: string };
      finish_reason?: string;
    }>;
  },
  model: string
): string {
  const choice = data.choices?.[0];
  const content = choice?.message?.content?.trim();
  if (content) return content;

  const reason = choice?.finish_reason ?? "unknown";
  throw new Error(
    `OpenAI 응답이 비어 있습니다 (model=${model}, finish_reason=${reason}). GPT-5는 추론 토큰으로 예산이 소진될 수 있습니다.`
  );
}

export async function listeningChatCompletion(
  apiKey: string,
  opts: ListeningChatOptions
): Promise<string> {
  const models = getListeningGeneratorModelCandidates();
  let lastError = "OpenAI API 실패";

  for (let i = 0; i < models.length; i++) {
    const model = models[i]!;
    let profile = defaultProfile(model);
    let attempts = 0;
    let lastStatus = 500;
    let lastBodyText = "";

    while (attempts < 4) {
      attempts++;
      const response = await postChatCompletion(apiKey, model, opts, profile);

      if (response.ok) {
        const data = (await response.json()) as {
          choices?: Array<{
            message?: { content?: string };
            finish_reason?: string;
          }>;
        };
        return parseCompletionContent(data, model);
      }

      lastBodyText = await response.text();
      lastStatus = response.status;
      lastError = `OpenAI API 실패 (HTTP ${lastStatus}, model=${model}): ${lastBodyText.slice(0, 400)}`;

      const relaxed = relaxProfile(model, profile, lastBodyText);
      if (relaxed && lastStatus === 400) {
        profile = relaxed;
        continue;
      }

      break;
    }

    const hasFallback = i < models.length - 1;
    if (hasFallback && isListeningModelUnavailableError(lastStatus, lastBodyText)) {
      continue;
    }
    throw new Error(lastError);
  }

  throw new Error(lastError);
}

export async function listeningChatJson<T>(
  apiKey: string,
  opts: ListeningChatOptions
): Promise<T> {
  const content = await listeningChatCompletion(apiKey, opts);
  try {
    return JSON.parse(content) as T;
  } catch {
    return JSON.parse(extractJsonText(content)) as T;
  }
}
