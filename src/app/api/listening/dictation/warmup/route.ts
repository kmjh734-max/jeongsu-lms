import { NextResponse } from "next/server";
import { prebuildDictationForQuestion } from "@/lib/listening/dictation/prebuild-question";
import { assertStudentListeningQuestionAccess } from "@/lib/listening/dictation/student-access";

export const maxDuration = 120;

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

/** 학생이 객관식 풀 때 백그라운드 Dictation 빈칸 준비 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      setId?: string;
      questionId?: string;
    };

    const setId = body.setId?.trim();
    const questionId = body.questionId?.trim();
    if (!setId || !questionId) {
      return jsonError("setId와 questionId가 필요합니다.");
    }

    const access = await assertStudentListeningQuestionAccess(setId, questionId);
    if (!access.ok) return jsonError(access.message, access.status);

    if (!access.settings.dictation_enabled) {
      return NextResponse.json({ ok: true, prepared: false, skipped: true });
    }

    const { admin } = access;
    const { data: qRow } = await admin
      .from("listening_questions")
      .select("dictation_blank_items, dictation_prepared_at")
      .eq("id", questionId)
      .maybeSingle();

    const existing = qRow?.dictation_blank_items;
    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json({
        ok: true,
        prepared: true,
        itemCount: existing.length,
        cached: true,
      });
    }

    const built = await prebuildDictationForQuestion(questionId, {
      includeVariants: false,
    });

    if (!built.ok) {
      return jsonError(built.message ?? "Dictation 준비 실패");
    }

    return NextResponse.json({
      ok: true,
      prepared: true,
      itemCount: built.itemCount ?? 0,
      cached: false,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Dictation 준비 오류";
    return jsonError(message);
  }
}
