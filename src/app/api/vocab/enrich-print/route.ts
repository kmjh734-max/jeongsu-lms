import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import {
  buildEnrichPrintPrompt,
  mergeEnrichment,
  type EnrichPrintInput,
  type EnrichPrintKind,
} from "@/lib/vocab/enrich-print-vocabulary";
import { openAiErrorMessage } from "@/lib/vocab/openai-error-message";

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

function parseKind(raw: string | undefined): EnrichPrintKind | null {
  if (
    raw === "example-middle" ||
    raw === "example-high" ||
    raw === "companion"
  ) {
    return raw;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
      return jsonError("권한이 없습니다.", 403);
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return jsonError("OPENAI_API_KEY가 설정되어 있지 않습니다.");
    }

    const body = (await request.json()) as {
      kind?: string;
      items?: EnrichPrintInput[];
    };

    const kind = parseKind(body.kind);
    if (!kind) {
      return jsonError("지원하지 않는 인쇄 형식입니다.");
    }

    const items = (body.items ?? []).filter(
      (i) => i.word?.trim() && i.meaning?.trim()
    );
    if (items.length === 0) {
      return jsonError("처리할 단어가 없습니다.");
    }
    if (items.length > 40) {
      return jsonError("한 번에 최대 40개 단어까지 생성할 수 있습니다.");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You output only valid JSON. Never include markdown fences.",
          },
          { role: "user", content: buildEnrichPrintPrompt(kind, items) },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return jsonError(openAiErrorMessage(response.status, errText));
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return jsonError("AI 생성에 실패했습니다.");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return jsonError("AI 응답을 해석하지 못했습니다.");
    }

    const byWord = mergeEnrichment(items, parsed);
    const result = items.map((item) => {
      const enrich = byWord.get(item.word.trim().toLowerCase());
      return {
        word: item.word.trim(),
        ...enrich,
      };
    });

    return NextResponse.json({ ok: true, items: result });
  } catch (err) {
    console.error("enrich-print error", err);
    return jsonError("AI 생성에 실패했습니다.");
  }
}
