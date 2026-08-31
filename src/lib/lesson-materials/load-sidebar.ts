import { cache } from "react";
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
  lesson_label: string | null;
  updated_at: string;
}

export const loadLessonMaterialsSidebarData = cache(
  async function loadLessonMaterialsSidebarData(
    supabase: SupabaseClient
  ): Promise<{
    folders: LessonMaterialFolderRow[];
    projects: LessonMaterialProjectRow[];
  }> {
    const [foldersRes, projectsRes] = await Promise.all([
      supabase
        .from("lesson_material_folders")
        .select("id, name, created_at")
        .order("name"),
      supabase
        .from("lesson_material_projects")
        .select("id, title, folder_id, lesson_label, updated_at")
        .order("updated_at", { ascending: false }),
    ]);

    return {
      folders: (foldersRes.data ?? []) as LessonMaterialFolderRow[],
      projects: (projectsRes.data ?? []) as LessonMaterialProjectRow[],
    };
  }
);
