import type { SupabaseClient } from "@supabase/supabase-js";
import type { NeltDomain } from "@/types/nelt";
import type { NeltAttemptBundle } from "@/lib/nelt/compare/types";

type ReportRow = {
  id: string;
  attempt_number: number | null;
  test_date: string | null;
  test_name: string | null;
  student_grade_raw: string | null;
  overall_level: string | null;
  overall_band: string | null;
  overall_level_order: number | null;
  overall_percentile: number | null;
  total_duration_seconds: number | null;
  source_type: string;
  source_url: string | null;
};

export async function renumberNeltAttempts(
  supabase: SupabaseClient,
  academyId: string,
  studentName: string
): Promise<void> {
  const { data } = await supabase
    .from("nelt_reports")
    .select("id, test_date, created_at")
    .eq("academy_id", academyId)
    .eq("student_name_raw", studentName)
    .order("test_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  const rows = data ?? [];
  for (let i = 0; i < rows.length; i++) {
    await supabase
      .from("nelt_reports")
      .update({
        attempt_number: i + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", rows[i].id);
  }
}

export async function loadStudentNeltAttempts(
  supabase: SupabaseClient,
  academyId: string,
  studentName: string
): Promise<NeltAttemptBundle[]> {
  const { data: reports, error } = await supabase
    .from("nelt_reports")
    .select(
      "id, attempt_number, test_date, test_name, student_grade_raw, overall_level, overall_band, overall_level_order, overall_percentile, total_duration_seconds, source_type, source_url"
    )
    .eq("academy_id", academyId)
    .eq("student_name_raw", studentName)
    .eq("extraction_status", "completed")
    .order("attempt_number", { ascending: true, nullsFirst: false })
    .order("test_date", { ascending: true, nullsFirst: false });

  if (error || !reports?.length) return [];

  const reportIds = reports.map((r) => r.id);

  const [
    { data: domains },
    { data: vocab },
    { data: grammar },
    { data: grammarItems },
  ] = await Promise.all([
    supabase
      .from("nelt_domain_results")
      .select(
        "id, nelt_report_id, domain, difficulty_code, raw_score, evaluated_level, evaluated_level_order, percentile, duration_seconds, achievement_grade, evaluation_summary"
      )
      .in("nelt_report_id", reportIds),
    supabase
      .from("nelt_vocabulary_metrics")
      .select(
        "nelt_report_id, vocabulary_size, elementary_required_total, elementary_required_percentage, elementary_required_estimated_count, csat_vocabulary_percentage"
      )
      .in("nelt_report_id", reportIds),
    supabase
      .from("nelt_grammar_metrics")
      .select(
        "nelt_report_id, elementary_grammar_percentage, correct_item_count, total_item_count"
      )
      .in("nelt_report_id", reportIds),
    supabase
      .from("nelt_grammar_items")
      .select("nelt_report_id, category, detail, is_correct")
      .in("nelt_report_id", reportIds),
  ]);

  const domainIds = (domains ?? []).map((d) => d.id);
  const { data: subskills } =
    domainIds.length > 0
      ? await supabase
          .from("nelt_subskill_results")
          .select(
            "nelt_domain_result_id, subskill_name, description, student_accuracy, level_average_accuracy"
          )
          .in("nelt_domain_result_id", domainIds)
      : { data: [] as Array<{
          nelt_domain_result_id: string;
          subskill_name: string;
          description: string | null;
          student_accuracy: number | null;
          level_average_accuracy: number | null;
        }> };

  const subByDomain = new Map<string, typeof subskills>();
  for (const s of subskills ?? []) {
    const list = subByDomain.get(s.nelt_domain_result_id) ?? [];
    list.push(s);
    subByDomain.set(s.nelt_domain_result_id, list);
  }

  return (reports as ReportRow[]).map((r, idx) => {
    const reportDomains = (domains ?? []).filter(
      (d) => d.nelt_report_id === r.id
    );
    const v = (vocab ?? []).find((x) => x.nelt_report_id === r.id) ?? null;
    const g = (grammar ?? []).find((x) => x.nelt_report_id === r.id) ?? null;
    const items = (grammarItems ?? []).filter((x) => x.nelt_report_id === r.id);

    return {
      id: r.id,
      attemptNumber: r.attempt_number ?? idx + 1,
      testDate: r.test_date,
      testName: r.test_name,
      studentGradeRaw: r.student_grade_raw,
      overallLevel: r.overall_level,
      overallBand: r.overall_band,
      overallLevelOrder: r.overall_level_order,
      overallPercentile: r.overall_percentile,
      totalDurationSeconds: r.total_duration_seconds,
      sourceType: r.source_type,
      sourceUrl: r.source_url,
      domains: reportDomains.map((d) => ({
        domain: d.domain as NeltDomain,
        difficultyCode: d.difficulty_code,
        rawScore: d.raw_score != null ? Number(d.raw_score) : null,
        evaluatedLevel: d.evaluated_level,
        evaluatedLevelOrder:
          d.evaluated_level_order != null
            ? Number(d.evaluated_level_order)
            : null,
        percentile: d.percentile != null ? Number(d.percentile) : null,
        durationSeconds: d.duration_seconds,
        achievementGrade: d.achievement_grade,
        evaluationSummary: d.evaluation_summary,
        subskills: (subByDomain.get(d.id) ?? []).map((s) => ({
          name: s.subskill_name,
          description: s.description,
          studentAccuracy:
            s.student_accuracy != null ? Number(s.student_accuracy) : null,
          levelAverageAccuracy:
            s.level_average_accuracy != null
              ? Number(s.level_average_accuracy)
              : null,
        })),
      })),
      vocabulary: v
        ? {
            vocabularySize: v.vocabulary_size,
            elementaryRequiredTotal: v.elementary_required_total,
            elementaryRequiredPercentage:
              v.elementary_required_percentage != null
                ? Number(v.elementary_required_percentage)
                : null,
            elementaryRequiredEstimatedCount:
              v.elementary_required_estimated_count,
            csatVocabularyPercentage:
              v.csat_vocabulary_percentage != null
                ? Number(v.csat_vocabulary_percentage)
                : null,
          }
        : null,
      grammar: g
        ? {
            elementaryGrammarPercentage:
              g.elementary_grammar_percentage != null
                ? Number(g.elementary_grammar_percentage)
                : null,
            correctItemCount: g.correct_item_count,
            totalItemCount: g.total_item_count,
            items: items.map((i) => ({
              category: i.category,
              detail: i.detail,
              isCorrect: i.is_correct,
            })),
          }
        : {
            elementaryGrammarPercentage: null,
            correctItemCount: items.filter((i) => i.is_correct).length,
            totalItemCount: items.length,
            items: items.map((i) => ({
              category: i.category,
              detail: i.detail,
              isCorrect: i.is_correct,
            })),
          },
    };
  });
}
