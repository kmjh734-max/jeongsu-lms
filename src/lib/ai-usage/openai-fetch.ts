import { recordAiUsage } from "@/lib/ai-usage/record";

/**
 * OpenAI를 부르는 공통 창구.
 *
 * 쓰는 법은 fetch와 똑같다 — 부르던 자리에서 fetch만 이것으로 바꾸면 된다.
 * 응답을 한 번 엿보아 모델·토큰·요청 id를 기록하고, 응답 자체는 손대지 않고 그대로 넘긴다.
 * 기록이 어긋나도 만들기를 막지 않는다.
 */
export async function openAiFetch(
  input: string | URL | Request,
  init?: RequestInit
): Promise<Response> {
  const res = await fetch(input, init);
  // 실패한 응답은 사용량이 없다. 읽어서 본문을 건드리지 않는다.
  if (!res.ok) return res;
  try {
    const clone = res.clone();
    const body = (await clone.json()) as OpenAiBody;
    const u = body?.usage;
    if (u && body?.model) {
      recordAiUsage({
        model: String(body.model),
        inputTokens: Number(u.prompt_tokens ?? u.input_tokens ?? 0),
        cachedInputTokens: Number(
          u.prompt_tokens_details?.cached_tokens ?? u.input_tokens_details?.cached_tokens ?? 0
        ),
        outputTokens: Number(u.completion_tokens ?? u.output_tokens ?? 0),
        requestId: res.headers.get("x-request-id"),
      });
    }
  } catch {
    /* 그림처럼 JSON이 아닌 응답은 기록하지 않는다 */
  }
  return res;
}

type OpenAiBody = {
  model?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    input_tokens?: number;
    output_tokens?: number;
    prompt_tokens_details?: { cached_tokens?: number };
    input_tokens_details?: { cached_tokens?: number };
  };
};
