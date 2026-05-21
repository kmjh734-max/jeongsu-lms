export interface GenerateExampleInput {
  word: string;
  meaning: string;
}

export interface GenerateExampleResult {
  word: string;
  meaning: string;
  example_sentence: string;
  example_meaning: string;
}

export async function fetchGeneratedExamples(
  items: GenerateExampleInput[]
): Promise<
  | { ok: true; items: GenerateExampleResult[] }
  | { ok: false; message: string }
> {
  try {
    const res = await fetch("/api/vocab/generate-examples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });

    const data = (await res.json()) as {
      ok: boolean;
      message?: string;
      items?: GenerateExampleResult[];
    };

    if (!data.ok || !data.items) {
      return {
        ok: false,
        message: data.message ?? "AI 예문 생성에 실패했습니다.",
      };
    }

    return { ok: true, items: data.items };
  } catch {
    return { ok: false, message: "AI 예문 생성에 실패했습니다." };
  }
}
