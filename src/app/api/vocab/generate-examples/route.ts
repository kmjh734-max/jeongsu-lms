import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import {
  chargeFeatureOrError,
  CREDIT_FEATURES,
} from "@/lib/credits/charge";
import { joinExamplePairs } from "@/lib/vocab/multi-example";
import { openAiErrorMessage } from "@/lib/vocab/openai-error-message";

interface RequestItem {
  word: string;
  meaning: string;
}

interface GeneratedItem extends RequestItem {
  example_sentence: string;
  example_meaning: string;
}

type AiExamplePair = {
  sense?: string;
  example_sentence?: string;
  example_meaning?: string;
};

type AiGeneratedItem = {
  word?: string;
  meaning?: string;
  examples?: AiExamplePair[];
  example_sentence?: string;
  example_meaning?: string;
};

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
      return jsonError("권한이 없습니다.", 403);
    }

    const chargeErr = await chargeFeatureOrError({
      academyId: profile.academy_id,
      featureKey: CREDIT_FEATURES.vocab_generate_examples,
      actorId: profile.id,
      idempotencyKey: `vocab_generate_examples:${profile.academy_id}:${profile.id}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
    });
    if (chargeErr) return chargeErr;

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return jsonError(
        "OPENAI_API_KEY가 설정되어 있지 않습니다. .env.local에 키를 추가한 뒤 개발 서버를 재시작해 주세요."
      );
    }

    const body = (await request.json()) as {
      items?: RequestItem[];
      level?: "middle" | "high";
    };
    const items = (body.items ?? []).filter(
      (i) => i.word?.trim() && i.meaning?.trim()
    );
    const level = body.level === "high" ? "high" : "middle";

    if (items.length === 0) {
      return jsonError("예문을 생성할 단어가 없습니다.");
    }

    const levelGuide =
      level === "high"
        ? "high school level (slightly richer vocabulary and structure, suitable for Korean high school students and exam prep)"
        : "middle school level (short and clear, suitable for Korean middle school students)";

    const prompt = `You are an English teacher creating vocabulary examples for Korean students.

For each word below:
1. Look at the Korean meaning field. It may list 1–several senses (e.g. "제공하다; 규정하다" or "제공하다 / 마련하다").
2. Pick 2–3 representative senses that are useful for learners (if only one clear sense exists, still make 2 different natural examples for that sense when helpful; if the meaning truly has 2–3 distinct senses, make one example per sense, up to 3).
3. Do NOT make only a single example unless the word truly has one trivial sense AND a second example would be redundant — prefer 2 examples in normal cases, max 3.
4. Each example must be a natural English sentence (${levelGuide}) that clearly shows that sense. Word form may change (provide → provides).
5. Provide an accurate Korean translation for each example.
6. Do not invent unrelated senses that are not implied by the given meaning.
7. Do not include inappropriate or sensitive content.

Return ONLY valid JSON in this exact shape (no markdown):
{
  "items": [
    {
      "word": "exact word from input",
      "meaning": "exact meaning from input",
      "examples": [
        {
          "sense": "대표 뜻 조각 (한글)",
          "example_sentence": "English sentence 1",
          "example_meaning": "한국어 해석 1"
        },
        {
          "sense": "다른 대표 뜻 (있으면)",
          "example_sentence": "English sentence 2",
          "example_meaning": "한국어 해석 2"
        }
      ]
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

    let parsed: { items?: AiGeneratedItem[] };
    try {
      parsed = JSON.parse(content) as { items?: AiGeneratedItem[] };
    } catch {
      return jsonError("AI 응답을 해석하지 못했습니다.");
    }

    const generated = parsed.items ?? [];
    if (generated.length === 0) {
      return jsonError("AI가 예문을 반환하지 않았습니다. 다시 시도해 주세요.");
    }

    const byWord = new Map(
      generated.map((g) => [
        String(g.word ?? "")
          .trim()
          .toLowerCase(),
        g,
      ])
    );

    const result: GeneratedItem[] = items.map((item) => {
      const match = byWord.get(item.word.trim().toLowerCase());
      const fromList = (match?.examples ?? [])
        .map((ex) => ({
          example_sentence: String(ex.example_sentence ?? "").trim(),
          example_meaning: String(ex.example_meaning ?? "").trim(),
        }))
        .filter((ex) => ex.example_sentence)
        .slice(0, 3);

      const joined =
        fromList.length > 0
          ? joinExamplePairs(fromList)
          : joinExamplePairs([
              {
                example_sentence: String(match?.example_sentence ?? "").trim(),
                example_meaning: String(match?.example_meaning ?? "").trim(),
              },
            ]);

      return {
        word: item.word.trim(),
        meaning: item.meaning.trim(),
        example_sentence: joined.example_sentence,
        example_meaning: joined.example_meaning,
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
