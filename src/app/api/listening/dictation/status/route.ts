import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || profile.role !== "student") {
      return NextResponse.json(
        { ok: false, message: "학생 권한이 필요합니다." },
        { status: 403 }
      );
    }

    const setId = new URL(request.url).searchParams.get("setId")?.trim();
    if (!setId) {
      return NextResponse.json({ ok: false, message: "setId가 필요합니다." });
    }

    const admin = createAdminClient();
    const { data: assigned } = await admin.rpc("student_assigned_listening_set", {
      set_uuid: setId,
    });
    if (!assigned) {
      return NextResponse.json({ ok: false, message: "배정된 세트가 아닙니다." }, { status: 403 });
    }

    const { data: attempts, error } = await admin
      .from("listening_dictation_attempts")
      .select("question_id, score, passed, attempt_no, submitted_at")
      .eq("student_id", profile.id)
      .eq("set_id", setId)
      .order("attempt_no", { ascending: true });

    if (error) {
      return NextResponse.json({ ok: false, message: error.message });
    }

    const byQuestion: Record<
      string,
      {
        passed: boolean;
        bestScore: number | null;
        attemptCount: number;
        submittedCount: number;
      }
    > = {};

    for (const row of attempts ?? []) {
      const qid = row.question_id as string;
      const cur = byQuestion[qid] ?? {
        passed: false,
        bestScore: null,
        attemptCount: 0,
        submittedCount: 0,
      };
      cur.attemptCount = Math.max(cur.attemptCount, row.attempt_no as number);
      if (row.submitted_at) {
        cur.submittedCount += 1;
        const sc = row.score as number | null;
        if (sc != null) {
          cur.bestScore = cur.bestScore == null ? sc : Math.max(cur.bestScore, sc);
        }
      }
      if (row.passed) cur.passed = true;
      byQuestion[qid] = cur;
    }

    return NextResponse.json({ ok: true, questions: byQuestion });
  } catch (e) {
    const message = e instanceof Error ? e.message : "조회 오류";
    return NextResponse.json({ ok: false, message });
  }
}
