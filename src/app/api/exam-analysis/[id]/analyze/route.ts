import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { debitLessonCredits } from "@/lib/credits/lesson-credits";
import { loadOwnAnalysis, requireExamStaff } from "@/lib/exam-analysis/access";
import { analyzeExam } from "@/lib/exam-analysis/analyze";

export const runtime = "nodejs";
export const maxDuration = 300;

/** 읽어 둔 쪽들로 문항표·보고서를 만든다. 다 되면 한 번만 차감한다. */
export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireExamStaff();
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  const analysis = await loadOwnAnalysis(id, auth.profile.academy_id);
  if (!analysis) return NextResponse.json({ ok: false, message: "분석을 찾을 수 없어요." }, { status: 404 });

  const admin = createAdminClient();
  await admin.from("school_exam_analyses").update({ status: "analyzing", error: null }).eq("id", id);
  try {
    await analyzeExam(admin, id, auth.profile.academy_id);
  } catch (e) {
    console.error("[exam-analysis/analyze]", e);
    const message = e instanceof Error && /문항을 찾지|읽은 쪽/.test(e.message) ? e.message : "분석하지 못했어요. 다시 시도해 주세요.";
    await admin.from("school_exam_analyses").update({ status: "failed", error: message }).eq("id", id);
    return NextResponse.json({ ok: false, message }, { status: 502 });
  }
  await debitLessonCredits({
    academyId: auth.profile.academy_id,
    actorId: auth.profile.id,
    featureKey: "school_exam_analysis",
    idempotencyKey: `school_exam_analysis:${id}`,
    metadata: { analysis_id: id, pages: analysis.page_count },
    note: "내신 시험지 분석",
  });
  return NextResponse.json({ ok: true });
}
