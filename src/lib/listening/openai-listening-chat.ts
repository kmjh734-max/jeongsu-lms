import {
  getListeningGeneratorModelCandidates,
  isListeningModelUnavailableError,
  isUnsupportedTemperatureError,
  listeningModelSupportsCustomTemperature,
} from "@/lib/listening/openai-listening-model";

export interface ListeningChatOptions {
  system: string;
  user: string;
  temperature?: number;
}

function buildChatCompletionBody(
  model: string,
  opts: ListeningChatOptions,
  includeTemperature: boolean
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.user },
    ],
  };
  if (includeTemperature) {
    body.temperature = opts.temperature ?? 0.4;
  }
  return body;
}

async function requestChatCompletion(
  apiKey: string,
  model: string,
  opts: ListeningChatOptions,
  includeTemperature = listeningModelSupportsCustomTemperature(model)
): Promise<Response> {
  return fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildChatCompletionBody(model, opts, includeTemperature)),
  });
}

export async function listeningChatCompletion(
  apiKey: string,
  opts: ListeningChatOptions
): Promise<string> {
  const models = getListeningGeneratorModelCandidates();
  let lastError = "OpenAI API 실패";

  for (let i = 0; i < models.length; i++) {
    const model = models[i]!;
    const response = await requestChatCompletion(apiKey, model, opts);

    if (response.ok) {
      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = data.choices?.[0]?.message?.content;
      if (!content?.trim()) {
        throw new Error("OpenAI 응답이 비어 있습니다.");
      }
      return content;
    }

    const bodyText = await response.text();
    lastError = `OpenAI API 실패 (HTTP ${response.status}, model=${model}): ${bodyText.slice(0, 300)}`;

    if (
      response.status === 400 &&
      isUnsupportedTemperatureError(bodyText)
    ) {
      const retry = await requestChatCompletion(apiKey, model, opts, false);
      if (retry.ok) {
        const data = (await retry.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const content = data.choices?.[0]?.message?.content;
        if (!content?.trim()) {
          throw new Error("OpenAI 응답이 비어 있습니다.");
        }
        return content;
      }
      const retryBody = await retry.text();
      lastError = `OpenAI API 실패 (HTTP ${retry.status}, model=${model}): ${retryBody.slice(0, 300)}`;
    }

    const hasFallback = i < models.length - 1;
    if (hasFallback && isListeningModelUnavailableError(response.status, bodyText)) {
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
  return JSON.parse(content) as T;
}
