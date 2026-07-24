import type { SupabaseClient } from "@supabase/supabase-js";
import {
  estimatedRequiredCount,
  resolveLevelOrder,
} from "@/lib/nelt/level-order";
import type { NeltExtractedDraft } from "@/lib/nelt/types-draft";

export async function saveNeltDraftAsReport(
  supabase: SupabaseClient,
  params: {
    academyId: string;
    createdBy: string;
    draft: NeltExtractedDraft;
    studentName: string;
    sourceUrl: string;
  }
): Promise<{ ok: true; reportId: string } | { ok: false; message: string }> {
  const { academyId, createdBy, draft, studentName, sourceUrl } = params;
  const name = studentName.trim();
  if (!name) {
    return { ok: false, message: "학생 이름을 입력해 주세요." };
  }

  const correctCount = draft.grammar.items.filter((i) => i.isCorrect === true)
    .length;
  const totalItems = draft.grammar.items.length;

  const { data: report, error } = await supabase
    .from("nelt_reports")
    .insert({
      academy_id: academyId,
      student_id: null,
      student_name_raw: name,
      test_name: draft.testName,
      test_date: draft.testDate,
      student_grade_raw: draft.studentGradeRaw,
      overall_level: draft.overallLevel,
      overall_level_order: resolveLevelOrder(draft.overallBand),
      overall_band: draft.overallBand,
      overall_percentile: draft.overallPercentile,
      total_duration_seconds: draft.totalDurationSeconds,
      source_type: "url",
      source_url: sourceUrl,
      extraction_status: "completed",
      extraction_confidence: draft.extractionConfidence,
      raw_extracted_data: draft as unknown as Record<string, unknown>,
      created_by: createdBy,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !report) {
    return {
      ok: false,
      message: error?.message ?? "결과 저장에 실패했습니다.",
    };
  }

  const reportId = report.id as string;

  if (draft.domains.length > 0) {
    const domainRows = draft.domains.map((d) => ({
      nelt_report_id: reportId,
      domain: d.domain,
      difficulty_code: d.difficultyCode,
      raw_score: d.rawScore,
      evaluated_level: d.evaluatedLevel,
      evaluated_level_order: resolveLevelOrder(d.evaluatedLevel),
      percentile: d.percentile,
      duration_seconds: d.durationSeconds,
      achievement_grade: d.achievementGrade,
      evaluation_summary: d.evaluationSummary,
    }));

    const { data: insertedDomains, error: domainErr } = await supabase
      .from("nelt_domain_results")
      .insert(domainRows)
      .select("id, domain");

    if (domainErr) {
      await supabase.from("nelt_reports").delete().eq("id", reportId);
      return { ok: false, message: domainErr.message };
    }

    const subskillRows = [];
    for (const d of draft.domains) {
      const row = (insertedDomains ?? []).find((x) => x.domain === d.domain);
      if (!row) continue;
      for (const s of d.subskills) {
        subskillRows.push({
          nelt_domain_result_id: row.id,
          subskill_name: s.name,
          description: s.description,
          student_accuracy: s.studentAccuracy,
          level_average_accuracy: s.levelAverageAccuracy,
        });
      }
    }
    if (subskillRows.length > 0) {
      const { error: subErr } = await supabase
        .from("nelt_subskill_results")
        .insert(subskillRows);
      if (subErr) {
        await supabase.from("nelt_reports").delete().eq("id", reportId);
        return { ok: false, message: subErr.message };
      }
    }
  }

  const { error: vocaErr } = await supabase.from("nelt_vocabulary_metrics").insert({
    nelt_report_id: reportId,
    vocabulary_size: draft.vocabulary.vocabularySize,
    elementary_required_total: draft.vocabulary.elementaryRequiredTotal,
    elementary_required_percentage:
      draft.vocabulary.elementaryRequiredPercentage,
    elementary_required_estimated_count: estimatedRequiredCount(
      draft.vocabulary.elementaryRequiredTotal,
      draft.vocabulary.elementaryRequiredPercentage
    ),
    csat_vocabulary_percentage: draft.vocabulary.csatVocabularyPercentage,
  });
  if (vocaErr) {
    await supabase.from("nelt_reports").delete().eq("id", reportId);
    return { ok: false, message: vocaErr.message };
  }

  const { error: gramErr } = await supabase.from("nelt_grammar_metrics").insert({
    nelt_report_id: reportId,
    elementary_grammar_percentage: draft.grammar.elementaryGrammarPercentage,
    correct_item_count: totalItems > 0 ? correctCount : null,
    total_item_count: totalItems > 0 ? totalItems : null,
  });
  if (gramErr) {
    await supabase.from("nelt_reports").delete().eq("id", reportId);
    return { ok: false, message: gramErr.message };
  }

  if (draft.grammar.items.length > 0) {
    const { error: itemsErr } = await supabase.from("nelt_grammar_items").insert(
      draft.grammar.items.map((item) => ({
        nelt_report_id: reportId,
        category: item.category,
        detail: item.detail,
        is_correct: item.isCorrect,
      }))
    );
    if (itemsErr) {
      await supabase.from("nelt_reports").delete().eq("id", reportId);
      return { ok: false, message: itemsErr.message };
    }
  }

  return { ok: true, reportId };
}

export function findDuplicateReports(
  existing: Array<{
    id: string;
    test_date: string | null;
    test_name: string | null;
    source_url: string | null;
  }>,
  draft: NeltExtractedDraft,
  sourceUrl: string
) {
  return existing.filter((r) => {
    if (sourceUrl && r.source_url === sourceUrl) return true;
    if (
      draft.testDate &&
      r.test_date === draft.testDate &&
      (r.test_name ?? "") === (draft.testName ?? "")
    ) {
      return true;
    }
    return false;
  });
}
