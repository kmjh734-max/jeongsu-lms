import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertListeningSetWritable } from "@/lib/listening/listening-api-auth";
import { replaceQuestionSegments } from "@/lib/listening/persist-questions";
import { isListeningSpeaker } from "@/lib/listening/speaker-voices";

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ questionId: string }> }
) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
      return jsonError("권한이 없습니다.", 403);
    }

    const { questionId } = await context.params;
    const body = (await request.json()) as {
      segments?: Array<{ speaker?: string; text?: string }>;
      instruction?: string;
      question_text?: string;
      choices?: string[];
      correct_answer?: number;
      explanation?: string;
      script_translation?: string;
    };

    const admin = createAdminClient();
    const { data: question, error: qErr } = await admin
      .from("listening_questions")
      .select("id, set_id")
      .eq("id", questionId)
      .maybeSingle();

    if (qErr || !question) {
      return jsonError("문항을 찾을 수 없습니다.");
    }

    const writable = await assertListeningSetWritable(question.set_id);
    if (!writable.ok) return jsonError(writable.message, writable.status);

    if (body.segments) {
      const segments = body.segments
        .map((s) => {
          const speaker = (s.speaker ?? "").trim().toUpperCase();
          const text = (s.text ?? "").trim();
          if (!isListeningSpeaker(speaker) || !text) return null;
          return { speaker, text };
        })
        .filter((s): s is { speaker: "ANN" | "M" | "W"; text: string } => s !== null);

      if (segments.length === 0) {
        return jsonError("유효한 segment가 없습니다.");
      }

      await replaceQuestionSegments(questionId, segments);
    }

    const patch: Record<string, unknown> = {};
    if (typeof body.instruction === "string") patch.instruction = body.instruction;
    if (typeof body.question_text === "string") patch.question_text = body.question_text;
    if (
      Array.isArray(body.choices) &&
      body.choices.length >= 4 &&
      body.choices.length <= 5
    ) {
      patch.choices = body.choices.filter((c) => String(c).trim());
    }
    if (typeof body.correct_answer === "number") {
      patch.correct_answer = body.correct_answer;
    }
    if (typeof body.explanation === "string") patch.explanation = body.explanation;
    if (typeof body.script_translation === "string") {
      patch.script_translation = body.script_translation;
    }

    if (Object.keys(patch).length > 0) {
      const { error } = await admin
        .from("listening_questions")
        .update(patch)
        .eq("id", questionId);
      if (error) return jsonError(error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "저장 중 오류가 발생했습니다.";
    return jsonError(message);
  }
}
