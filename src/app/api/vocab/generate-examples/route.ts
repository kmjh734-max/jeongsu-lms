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
      console.error("OpenAI API error", response.status, await response.text());
      return jsonError("AI 예문 생성에 실패했습니다.");
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

    return NextResponse.json({ ok: true, items: result });
  } catch (err) {
    console.error("generate-examples error", err);
    return jsonError("AI 예문 생성에 실패했습니다.");
  }
}
