import { createAdminClient } from "@/lib/supabase/admin";
import type { ExamAnalysisRow, ExamItemRow } from "@/lib/exam-analysis/types";

const ANALYSIS_COLUMNS =
  "id, academy_id, school_name, grade, subject, exam_label, status, page_count, missing, note, total_points, features, strategy, error, match_materials, created_at";

/** 학원의 시험지 분석 목록 (최근 것부터) + 문항 수 */
export async function loadExamAnalyses(academyId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("school_exam_analyses")
    .select(ANALYSIS_COLUMNS)
    .eq("academy_id", academyId)
    .order("created_at", { ascending: false })
    .limit(200);
  const list = (data ?? []) as ExamAnalysisRow[];
  const ids = list.map((a) => a.id);
  const counts = new Map<string, { n: number; hard: number; subj: number; matched: number }>();
  if (ids.length) {
    const { data: items } = await admin
      .from("school_exam_items")
      .select("analysis_id, level, is_subjective, matched_item_id")
      .in("analysis_id", ids);
    for (const it of items ?? []) {
      const c = counts.get(it.analysis_id as string) ?? { n: 0, hard: 0, subj: 0, matched: 0 };
      c.n++;
      if (it.level === "상") c.hard++;
      if (it.is_subjective) c.subj++;
      if (it.matched_item_id) c.matched++;
      counts.set(it.analysis_id as string, c);
    }
  }
  return list.map((a) => ({ ...a, counts: counts.get(a.id) ?? { n: 0, hard: 0, subj: 0, matched: 0 } }));
}

export async function loadExamAnalysis(id: string, academyId: string) {
  const admin = createAdminClient();
  const { data } = await admin.from("school_exam_analyses").select(ANALYSIS_COLUMNS).eq("id", id).maybeSingle();
  if (!data || data.academy_id !== academyId) return null;
  const { data: items } = await admin
    .from("school_exam_items")
    .select("*")
    .eq("analysis_id", id)
    .order("order_index");
  return { analysis: data as ExamAnalysisRow, items: (items ?? []) as ExamItemRow[] };
}
