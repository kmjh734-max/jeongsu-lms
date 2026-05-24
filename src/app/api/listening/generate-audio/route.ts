import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateQuestionAudio } from "@/lib/listening/generate-audio";

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
        "OPENAI_API_KEY가 설정되어 있지 않습니다. .env.local에 키를 추가한 뒤 서버를 재시작해 주세요."
      );
    }

    const body = (await request.json()) as {
      setId?: string;
      questionId?: string;
      segmentId?: string;
    };

    const setId = body.setId?.trim();
    const questionId = body.questionId?.trim();
    if (!setId || !questionId) {
      return jsonError("setId와 questionId가 필요합니다.");
    }

    const admin = createAdminClient();
    const { data: question, error: qErr } = await admin
      .from("listening_questions")
      .select("id, set_id")
      .eq("id", questionId)
      .eq("set_id", setId)
      .maybeSingle();

    if (qErr || !question) {
      return jsonError("문항을 찾을 수 없습니다.");
    }

    const { data: setRow } = await admin
      .from("listening_sets")
      .select("teacher_id, created_by")
      .eq("id", setId)
      .maybeSingle();

    if (
      profile.role === "teacher" &&
      setRow &&
      setRow.teacher_id !== profile.id &&
      setRow.created_by !== profile.id
    ) {
      return jsonError("이 세트에 대한 권한이 없습니다.", 403);
    }

    const result = await generateQuestionAudio({
      setId,
      questionId,
      segmentId: body.segmentId?.trim() || undefined,
      apiKey,
    });

    return NextResponse.json({
      ok: true,
      audioUrl: result.audioUrl,
      segments: result.segments,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "음원 생성 중 오류가 발생했습니다.";
    return jsonError(message);
  }
}
