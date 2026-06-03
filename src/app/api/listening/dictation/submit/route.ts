import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { scoreDictationAttempt } from "@/lib/listening/dictation/score-blanks";
import type { DictationBlankItem } from "@/lib/listening/dictation/types";
import { DEFAULT_DICTATION_SETTINGS } from "@/lib/listening/dictation/types";

export const maxDuration = 60;

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || profile.role !== "student") {
      return jsonError("학생 권한이 필요합니다.", 403);
    }

    const body = (await request.json()) as {
      attemptId?: string;
      studentAnswers?: Record<string, string>;
    };

    const attemptId = body.attemptId?.trim();
    if (!attemptId) return jsonError("attemptId가 필요합니다.");

    const admin = createAdminClient();
    const { data: attempt, error: aErr } = await admin
      .from("listening_dictation_attempts")
      .select(
        "id, student_id, set_id, question_id, attempt_no, blank_items, submitted_at"
      )
      .eq("id", attemptId)
      .maybeSingle();

    if (aErr || !attempt) return jsonError("Dictation 시도를 찾을 수 없습니다.");
    if (attempt.student_id !== profile.id) {
      return jsonError("권한이 없습니다.", 403);
    }
    if (attempt.submitted_at) {
      return jsonError("이미 제출한 시도입니다.");
    }

    const { data: setRow } = await admin
      .from("listening_sets")
      .select("dictation_pass_score")
      .eq("id", attempt.set_id)
      .maybeSingle();

    const passScore =
      setRow?.dictation_pass_score ?? DEFAULT_DICTATION_SETTINGS.dictation_pass_score;

    const blankItems = (attempt.blank_items ?? []) as DictationBlankItem[];
    const studentAnswers = body.studentAnswers ?? {};

    const scored = scoreDictationAttempt(blankItems, studentAnswers, passScore);

    const { error: upErr } = await admin
      .from("listening_dictation_attempts")
      .update({
        student_answers: studentAnswers,
        score: scored.score,
        passed: scored.passed,
        submitted_at: new Date().toISOString(),
      })
      .eq("id", attemptId);

    if (upErr) return jsonError(upErr.message);

    return NextResponse.json({
      ok: true,
      score: scored.score,
      passed: scored.passed,
      passScore: scored.passScore,
      results: scored.results,
      attemptNo: attempt.attempt_no,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Dictation 제출 오류";
    return jsonError(message);
  }
}
