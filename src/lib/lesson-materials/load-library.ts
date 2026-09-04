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
  analysis_json?: unknown;
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
      .select("id,title,title_en,source,folder_id,updated_at,deleted_at,analysis_json")
      .order("updated_at", { ascending: false }),
    supabase
      .from("lesson_material_items")
      .select("project_id,id")
      .order("created_at", { ascending: true }),
  ]);

  const folders = (foldersRes.data ?? []) as LessonMaterialFolderRow[];
  const projects = (projectsRes.data ?? []) as LessonMaterialProjectRow[];

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
