import type { SupabaseClient } from "@supabase/supabase-js";

export interface LessonMaterialFolderRow {
  id: string;
  name: string;
  created_at: string;
}

export interface LessonMaterialProjectRow {
  id: string;
  title: string;
  folder_id: string | null;
  updated_at: string;
}

export interface LessonMaterialLibraryData {
  folders: LessonMaterialFolderRow[];
  unfiledProjects: LessonMaterialProjectRow[];
  projects: LessonMaterialProjectRow[]; // includes filed ones
  itemCountByProjectId: Record<string, number>;
}

export async function loadLessonMaterialsLibraryData(
  supabase: SupabaseClient
): Promise<LessonMaterialLibraryData> {
  const [foldersRes, projectsRes, itemsRes] = await Promise.all([
    supabase
      .from("lesson_material_folders")
      .select("id,name,created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("lesson_material_projects")
      .select("id,title,folder_id,updated_at")
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

  return {
    folders,
    projects: projects.filter((p) => p.folder_id !== null),
    unfiledProjects: projects.filter((p) => p.folder_id === null),
    itemCountByProjectId,
  };
}

