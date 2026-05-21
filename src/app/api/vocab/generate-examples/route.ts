import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";

interface RequestItem {
  word: string;
  meaning: string;
}

interface GeneratedItem extends RequestItem {
  example_sentence: string;
  example_meaning: string;
}

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

function openAiErrorMessage(status: number, bodyText: string): string {
  try {
    const body = JSON.parse(bodyText) as {
      error?: { message?: string; code?: string; type?: string };
    };
    const code = body.error?.code ?? body.error?.type;
    const msg = body.error?.message ?? "";

    if (code === "insufficient_quota" || msg.includes("quota")) {
      return "OpenAI 사용 한도가 없습니다. platform.openai.com → Settings → Billing에서 결제 수단·크레딧을 확인해 주세요.";
    }
    if (status === 401 || code === "invalid_api_key") {
      return "OPENAI_API_KEY가 올바르지 않습니다. 키를 다시 발급해 .env.local과 Vercel에 등록해 주세요.";
    }
    if (status === 429) {
      return "OpenAI 요청 한도에 걸렸습니다. 잠시 후 다시 시도하거나 Billing을 확인해 주세요.";
    }
    if (msg) return `OpenAI 오류: ${msg}`;
  } catch {
    /* ignore parse errors */
  }
  return `AI 예문 생성에 실패했습니다. (OpenAI HTTP ${status})`;
}

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
      return jsonError("권한이 없습니다.", 403);
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return jsonError(
        "OPENAI_API_KEY가 설정되어 있지 않습니다. .env.local에 키를 추가한 뒤 개발 서버를 재시작해 주세요."
      );
    }

    const body = (await request.json()) as { items?: RequestItem[] };
    const items = (body.items ?? []).filter(
      (i) => i.word?.trim() && i.meaning?.trim()
    );

    if (items.length === 0) {
      return jsonError("예문을 생성할 단어가 없습니다.");
    }

    const prompt = `You are an English teacher creating vocabulary examples for Korean middle school students.

For each word below, create ONE natural example sentence (middle school level, not too long) and its Korean translation.
The sentence must clearly show the meaning of the word. Word form may change naturally (e.g. provide → provides).
Do not include inappropriate or sensitive content.

Return ONLY valid JSON in this exact shape (no markdown):
{
  "items": [
    {
      "word": "exact word from input",
      "meaning": "exact meaning from input",
      "example_sentence": "English sentence",
      "example_meaning": "Korean translation"
    }
  ]
}

Words to process:
${JSON.stringify(items.map((i) => ({ word: i.word.trim(), meaning: i.meaning.trim() })))}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.5,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You output only valid JSON. Never include markdown fences or extra text.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI API error", response.status, errText);
      return jsonError(openAiErrorMessage(response.status, errText));
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return jsonError("AI 예문 생성에 실패했습니다.");
    }

    let parsed: { items?: GeneratedItem[] };
    try {
      parsed = JSON.parse(content) as { items?: GeneratedItem[] };
    } catch {
      return jsonError("AI 응답을 해석하지 못했습니다.");
    }

    const generated = parsed.items ?? [];
    if (generated.length === 0) {
      return jsonError("AI가 예문을 반환하지 않았습니다. 다시 시도해 주세요.");
    }

    const byWord = new Map(
      generated.map((g) => [g.word.trim().toLowerCase(), g])
    );

    const result: GeneratedItem[] = items.map((item) => {
      const match = byWord.get(item.word.trim().toLowerCase());
      return {
        word: item.word.trim(),
        meaning: item.meaning.trim(),
        example_sentence: match?.example_sentence?.trim() ?? "",
        example_meaning: match?.example_meaning?.trim() ?? "",
      };
    });

    const filled = result.filter((r) => r.example_sentence);
    if (filled.length === 0) {
      return jsonError("생성된 예문이 비어 있습니다. 다시 시도해 주세요.");
    }

    return NextResponse.json({ ok: true, items: result });
  } catch (err) {
    console.error("generate-examples error", err);
    return jsonError("AI 예문 생성에 실패했습니다.");
  }
}
