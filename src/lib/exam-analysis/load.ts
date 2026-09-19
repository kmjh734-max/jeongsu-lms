import { createAdminClient } from "@/lib/supabase/admin";
import { loadAcademyMaterialPassages } from "@/lib/exam-analysis/material-passages";
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

export type MaterialPassage = { id: string; project: string; title: string; words: number; preview: string };

/** 동형모의고사 지문 고르기용: 학원 수업자료(자료 하나 = 지문 하나) 목록. 글은 보내지 않고 앞부분만 */
export async function loadMaterialPassages(academyId: string): Promise<MaterialPassage[]> {
  const list = await loadAcademyMaterialPassages(createAdminClient(), academyId);
  return list
    .map((p) => {
      const words = p.text.split(/\s+/).filter(Boolean);
      return { id: p.projectId, project: p.folder, title: p.title, words: words.length, preview: words.slice(0, 14).join(" "), updated: p.updatedAt };
    })
    .filter((m) => m.words >= 40)
    .sort((a, b) => b.updated.localeCompare(a.updated))
    .map(({ id, project, title, words, preview }) => ({ id, project, title, words, preview }));
}

/** 이 시험 분석으로 만든 동형모의고사(변형문제 작업) — 최근 것부터 */
export async function loadExamMocks(analysisId: string, academyId: string) {
  const { data } = await createAdminClient()
    .from("question_generation_jobs")
    .select("id, status, created_at, request_config")
    .eq("academy_id", academyId)
    .eq("request_config->>examAnalysisId", analysisId)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data ?? []).map((j) => ({
    id: j.id as string,
    status: j.status as string,
    created_at: j.created_at as string,
    title: String((j.request_config as { title?: string } | null)?.title ?? "동형모의고사"),
  }));
}
