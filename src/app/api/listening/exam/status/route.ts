import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "student") {
    return NextResponse.json({ ok: false, message: "학생 권한이 필요합니다." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const setId = searchParams.get("setId")?.trim();
  if (!setId) {
    return NextResponse.json({ ok: false, message: "setId가 필요합니다." });
  }

  const admin = createAdminClient();
  const { data: latest } = await admin
    .from("listening_exam_attempts")
    .select("id, score, correct_count, total_count, submitted_at")
    .eq("student_id", profile.id)
    .eq("set_id", setId)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latest) {
    return NextResponse.json({ ok: true, attempt: null });
  }

  const { data: answerRows } = await admin
    .from("listening_exam_answers")
    .select("question_id, order_index, student_answer, correct_answer, is_correct")
    .eq("attempt_id", latest.id)
    .order("order_index", { ascending: true });

  return NextResponse.json({
    ok: true,
    attempt: {
      id: latest.id,
      score: latest.score,
      correctCount: latest.correct_count,
      totalCount: latest.total_count,
      submittedAt: latest.submitted_at,
      results: (answerRows ?? []).map((row) => ({
        questionId: row.question_id,
        orderIndex: row.order_index,
        studentAnswer: row.student_answer,
        correctAnswer: row.correct_answer,
        isCorrect: row.is_correct,
      })),
    },
  });
}
