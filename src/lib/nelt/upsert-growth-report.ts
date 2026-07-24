import type { SupabaseClient } from "@supabase/supabase-js";
import { buildNeltGrowthAnalysis } from "@/lib/nelt/compare/build-growth";
import { loadStudentNeltAttempts } from "@/lib/nelt/load-student-attempts";

export async function upsertNeltGrowthReport(
  supabase: SupabaseClient,
  params: {
    academyId: string;
    studentName: string;
    createdBy: string;
  }
): Promise<
  | { ok: true; growthId: string; attemptCount: number }
  | { ok: false; message: string }
> {
  const attempts = await loadStudentNeltAttempts(
    supabase,
    params.academyId,
    params.studentName
  );

  if (attempts.length < 2) {
    return {
      ok: false,
      message: "성장 리포트는 회차가 2개 이상일 때 만들 수 있습니다.",
    };
  }

  const analysis = buildNeltGrowthAnalysis(params.studentName, attempts);
  if (!analysis) {
    return { ok: false, message: "성장 비교를 만들 수 없습니다." };
  }

  const payload = {
    academy_id: params.academyId,
    student_id: null,
    student_name_raw: params.studentName,
    start_report_id: analysis.start.id,
    end_report_id: analysis.end.id,
    generated_summary: [
      analysis.overallNarrative,
      analysis.strengthsNarrative,
      analysis.stableNarrative,
      analysis.nextGoalsNarrative,
    ].join("\n\n"),
    growth_highlights: analysis.highlights,
    focus_areas: analysis.focusGrammar.map((g) => ({
      category: g.category,
      detail: g.detail,
      kind: g.kind,
    })),
    learning_plan: analysis.learningPlan,
    teacher_comment: null,
    created_by: params.createdBy,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from("nelt_growth_reports")
    .select("id")
    .eq("academy_id", params.academyId)
    .eq("student_name_raw", params.studentName)
    .eq("is_finalized", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("nelt_growth_reports")
      .update(payload)
      .eq("id", existing.id);
    if (error) return { ok: false, message: error.message };
    return {
      ok: true,
      growthId: existing.id,
      attemptCount: attempts.length,
    };
  }

  const { data: inserted, error } = await supabase
    .from("nelt_growth_reports")
    .insert(payload)
    .select("id")
    .single();

  if (error || !inserted) {
    return { ok: false, message: error?.message ?? "성장 리포트 저장 실패" };
  }

  return {
    ok: true,
    growthId: inserted.id as string,
    attemptCount: attempts.length,
  };
}
