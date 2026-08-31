import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import {
  buildLineInterpretationPrompt,
  normalizeLineInterpretation,
} from "@/lib/lesson-materials/generate-line-interpretation";
import { openAiErrorMessage } from "@/lib/vocab/openai-error-message";

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

    const body = (await request.json()) as {
      passage?: string;
      lessonLabel?: string;
      passageTitle?: string;
    };

    const passage = body.passage?.trim() ?? "";
    if (passage.length < 30) {
      return jsonError("지문이 너무 짧습니다. 영어 지문을 더 입력해 주세요.");
    }
    if (passage.length > 12000) {
      return jsonError("지문이 너무 깁니다. 12,000자 이하로 입력해 주세요.");
    }

    const { system, user } = buildLineInterpretationPrompt({
      passage,
      lessonLabel: body.lessonLabel,
      passageTitle: body.passageTitle,
    });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL_LESSON_MATERIALS?.trim() || "gpt-4o-mini",
        temperature: 0.25,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI line interpretation error", response.status, errText);
      return jsonError(openAiErrorMessage(response.status, errText));
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return jsonError("AI 응답이 비어 있습니다.");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return jsonError("AI 응답 JSON을 해석하지 못했습니다.");
    }

    const result = normalizeLineInterpretation(parsed);
    if (result.lines.length === 0) {
      return jsonError("문장을 나누지 못했습니다. 지문을 확인해 주세요.");
    }

    return NextResponse.json({ ok: true, result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "생성 오류";
    return jsonError(message);
  }
}
