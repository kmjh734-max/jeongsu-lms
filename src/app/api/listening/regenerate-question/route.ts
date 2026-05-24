import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ListeningDifficultyMode } from "@/lib/listening/exam-difficulty";
import { generateSingleExamQuestion } from "@/lib/listening/generate-questions";
import { persistGeneratedQuestions } from "@/lib/listening/persist-questions";
import { getExamTypeById } from "@/lib/listening/exam-types";

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
    if (!apiKey) return jsonError("OPENAI_API_KEY가 설정되어 있지 않습니다.");

    const body = (await request.json()) as {
      setId?: string;
      questionId?: string;
      typeId?: number;
      difficultyMode?: ListeningDifficultyMode;
    };

    const setId = body.setId?.trim();
    const questionId = body.questionId?.trim();
    if (!setId || !questionId) {
      return jsonError("setId와 questionId가 필요합니다.");
    }

    const admin = createAdminClient();
    const { data: setRow } = await admin
      .from("listening_sets")
      .select("id, teacher_id, created_by")
      .eq("id", setId)
      .maybeSingle();

    if (!setRow) return jsonError("세트를 찾을 수 없습니다.");

    if (
      profile.role === "teacher" &&
      setRow.teacher_id !== profile.id &&
      setRow.created_by !== profile.id
    ) {
      return jsonError("권한이 없습니다.", 403);
    }

    const { data: existing } = await admin
      .from("listening_questions")
      .select("id, order_index")
      .eq("id", questionId)
      .eq("set_id", setId)
      .maybeSingle();

    if (!existing) return jsonError("문항을 찾을 수 없습니다.");

    const typeId = body.typeId ?? existing.order_index;
    const type = getExamTypeById(typeId);
    if (!type) return jsonError("유형을 찾을 수 없습니다.");

    await admin.from("listening_questions").delete().eq("id", questionId);

    const generated = await generateSingleExamQuestion(
      apiKey,
      typeId,
      body.difficultyMode ?? "auto"
    );

    const [saved] = await persistGeneratedQuestions(setId, [generated]);

    return NextResponse.json({
      ok: true,
      question: saved,
      needs_review: generated.needs_review,
      quality_issues: generated.quality_issues,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "재생성 실패";
    return jsonError(message);
  }
}
