import type { SupabaseClient } from "@supabase/supabase-js";

export interface LessonMaterialFolderRow {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
}

export interface LessonMaterialProjectRow {
  id: string;
  title: string;
  title_en: string | null;
  source: string | null;
  folder_id: string | null;
  updated_at: string;
  deleted_at: string | null;
  order_index: number;
  analysis_json?: unknown;
  /** True when logical-flow analysis exists */
  has_analysis: boolean;
  /** True when 수업용 자료(lesson pack) was saved */
  has_lesson_pack: boolean;
  /** True when 분석서 was saved */
  has_analysis_report: boolean;
}

export interface LessonMaterialLibraryData {
  folders: LessonMaterialFolderRow[];
  /** Active (not trashed) projects with a folder */
  projects: LessonMaterialProjectRow[];
  /** Active projects with no folder */
  unfiledProjects: LessonMaterialProjectRow[];
  /** Soft-deleted projects */
  trashedProjects: LessonMaterialProjectRow[];
  itemCountByProjectId: Record<string, number>;
}

function analysisSnippet(analysis_json: unknown): string {
  if (!Array.isArray(analysis_json) || analysis_json.length === 0) return "";
  const first = analysis_json[0] as { desc?: string; title?: string };
  return String(first?.desc ?? first?.title ?? "").trim();
}

function hasAnalysis(analysis_json: unknown): boolean {
  return Array.isArray(analysis_json) && analysis_json.length > 0;
}

function hasLessonPack(lesson_pack_json: unknown): boolean {
  if (!lesson_pack_json || typeof lesson_pack_json !== "object") return false;
  const pack = lesson_pack_json as { vocab?: unknown; headerLabel?: unknown };
  return (
    Array.isArray(pack.vocab) ||
    (typeof pack.headerLabel === "string" && pack.headerLabel.trim().length > 0)
  );
}

function hasAnalysisReport(analysis_report_json: unknown): boolean {
  if (!analysis_report_json || typeof analysis_report_json !== "object") {
    return false;
  }
  const report = analysis_report_json as { sentences?: unknown };
  return Array.isArray(report.sentences) && report.sentences.length > 0;
}

export async function loadLessonMaterialsLibraryData(
  supabase: SupabaseClient
): Promise<LessonMaterialLibraryData> {
  const [foldersRes, projectsRes, itemsRes] = await Promise.all([
    supabase
      .from("lesson_material_folders")
      .select("id,name,parent_id,created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("lesson_material_projects")
      .select(
        "id,title,title_en,source,folder_id,updated_at,deleted_at,order_index,analysis_json,lesson_pack_json,analysis_report_json"
      )
      .order("order_index", { ascending: true })
      .order("updated_at", { ascending: false }),
    supabase
      .from("lesson_material_items")
      .select("project_id,id")
      .order("created_at", { ascending: true }),
  ]);

  const folders = (foldersRes.data ?? []) as LessonMaterialFolderRow[];
  const rawProjects = (projectsRes.data ?? []) as Array<
    Omit<
      LessonMaterialProjectRow,
      "has_analysis" | "has_lesson_pack" | "has_analysis_report"
    > & {
      lesson_pack_json?: unknown;
      analysis_report_json?: unknown;
      order_index?: number | null;
    }
  >;

  const projects: LessonMaterialProjectRow[] = rawProjects.map((p) => {
    const { lesson_pack_json, analysis_report_json, ...rest } = p;
    return {
      ...rest,
      order_index: typeof p.order_index === "number" ? p.order_index : 0,
      has_analysis: hasAnalysis(p.analysis_json),
      has_lesson_pack: hasLessonPack(lesson_pack_json),
      has_analysis_report: hasAnalysisReport(analysis_report_json),
    };
  });

  const itemCountByProjectId: Record<string, number> = {};
  for (const row of (itemsRes.data ?? []) as Array<{
    project_id: string;
  }>) {
    itemCountByProjectId[row.project_id] =
      (itemCountByProjectId[row.project_id] ?? 0) + 1;
  }

  const active = projects.filter((p) => !p.deleted_at);
  const trashed = projects.filter((p) => !!p.deleted_at);

  return {
    folders,
    projects: active.filter((p) => p.folder_id !== null),
    unfiledProjects: active.filter((p) => p.folder_id === null),
    trashedProjects: trashed,
    itemCountByProjectId,
  };
}

export { analysisSnippet };
