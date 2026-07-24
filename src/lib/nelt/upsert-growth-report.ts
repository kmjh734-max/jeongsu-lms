import type { SupabaseClient } from "@supabase/supabase-js";
import { buildNeltGrowthAnalysis } from "@/lib/nelt/compare/build-growth";
import type { NeltAttemptBundle } from "@/lib/nelt/compare/types";
import {
  loadNeltAttemptsByReportIds,
  loadStudentNeltAttempts,
} from "@/lib/nelt/load-student-attempts";
import { parseStoredNarratives } from "@/lib/nelt/generate-report-narratives";

export async function upsertNeltGrowthReport(
  supabase: SupabaseClient,
  params: {
    academyId: string;
    studentName: string;
    createdBy: string;
    /** 이미 로드한 회차(링크 2개 이상 저장 직후 등) */
    attempts?: NeltAttemptBundle[];
    /** 방금 저장한 report id — 이름 조회 실패 시 사용 */
    reportIds?: string[];
  }
): Promise<
  | { ok: true; growthId: string; attemptCount: number }
  | { ok: false; message: string }
> {
  const name = params.studentName.trim();
  let attempts = params.attempts ?? [];

  if (attempts.length < 2 && params.reportIds && params.reportIds.length >= 2) {
    attempts = await loadNeltAttemptsByReportIds(supabase, params.reportIds);
  }
  if (attempts.length < 2) {
    attempts = await loadStudentNeltAttempts(
      supabase,
      params.academyId,
      name
    );
  }

  if (attempts.length < 2) {
    return {
      ok: false,
      message: "저장한 회차를 찾지 못했습니다. 목록에서 다시 열어 주세요.",
    };
  }

  const analysis = buildNeltGrowthAnalysis(name, attempts);
  if (!analysis) {
    return { ok: false, message: "성장 비교를 만들 수 없습니다." };
  }

  const { data: existing } = await supabase
    .from("nelt_growth_reports")
    .select("id, generated_summary")
    .eq("academy_id", params.academyId)
    .eq("student_name_raw", name)
    .eq("is_finalized", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const keepAiSummary = parseStoredNarratives(existing?.generated_summary);
  const generatedSummary = keepAiSummary
    ? JSON.stringify(keepAiSummary)
    : [
        analysis.overallNarrative,
        analysis.strengthsNarrative,
        analysis.stableNarrative,
        analysis.nextGoalsNarrative,
      ].join("\n\n");

  const payload = {
    academy_id: params.academyId,
    student_id: null,
    student_name_raw: name,
    start_report_id: analysis.start.id,
    end_report_id: analysis.end.id,
    generated_summary: generatedSummary,
    growth_highlights: analysis.highlights,
    focus_areas: analysis.focusGrammar.map((g) => ({
      category: g.category,
      detail: g.detail,
      kind: g.kind,
    })),
    learning_plan: analysis.learningPlan,
    created_by: params.createdBy,
    updated_at: new Date().toISOString(),
  };

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
