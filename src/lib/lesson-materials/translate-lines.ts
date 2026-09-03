export async function translateEnglishLinesToKorean(
  lines: string[]
): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");
  }

  const targets = lines.map((l) => l.trim());
  if (targets.length === 0) return [];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45_000);

  try {
    const numbered = targets
      .map((t, i) => `${i + 1}. ${t}`)
      .join("\n");

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `너는 영어 수업용 한줄해석 번역가다.
입력된 영어 문장을 같은 순서·같은 개수로 자연스러운 한국어 한 줄 해석으로 번역한다.
의역하되 의미를 바꾸지 말고, 한 영어 문장 = 한 한국어 문장.
JSON만 반환: {"korean":["..."]}`,
          },
          {
            role: "user",
            content: `아래 ${targets.length}개 영어 문장을 같은 개수의 한국어로 번역하라.\n\n${numbered}`,
          },
        ],
      }),
    });

    const bodyText = await res.text();
    if (!res.ok) {
      throw new Error(`한줄해석 생성 실패 (HTTP ${res.status})`);
    }

    const envelope = JSON.parse(bodyText) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = envelope.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as { korean?: unknown };
    const korean = Array.isArray(parsed.korean)
      ? parsed.korean.map((v) => String(v ?? "").trim())
      : [];

    if (korean.length !== targets.length) {
      throw new Error("한줄해석 개수가 문장 수와 맞지 않습니다. 다시 시도해 주세요.");
    }
    return korean;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("한줄해석 생성 시간이 초과되었습니다.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
