/** 시험지 분석용 OpenAI 호출. 연결이 끊기면 잠시 뒤 다시 한다. */
export type ChatResult = { text: string; finishReason: string | null };

export async function examChat(body: Record<string, unknown>, tries = 3): Promise<ChatResult> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY가 없습니다.");
  let lastError = "";
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(240_000),
      });
      const j = (await res.json()) as {
        choices?: { message?: { content?: string }; finish_reason?: string }[];
        error?: { message?: string };
      };
      if (res.ok) {
        return {
          text: j.choices?.[0]?.message?.content ?? "",
          finishReason: j.choices?.[0]?.finish_reason ?? null,
        };
      }
      lastError = j.error?.message ?? `HTTP ${res.status}`;
      // 잘못된 요청은 다시 해도 같다
      if (res.status === 400) break;
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
    if (i < tries) await new Promise((r) => setTimeout(r, 2500 * i));
  }
  throw new Error(lastError || "OpenAI 호출 실패");
}
