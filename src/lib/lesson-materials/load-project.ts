import type { SupabaseClient } from "@supabase/supabase-js";
import { parseProjectContent } from "@/lib/lesson-materials/project-content";
import type { LessonMaterialProjectContent } from "@/lib/lesson-materials/project-content";

export interface LessonMaterialProjectDetail {
  id: string;
  title: string;
  lesson_label: string | null;
  source_passage: string | null;
  folder_id: string | null;
  content: LessonMaterialProjectContent;
  updated_at: string;
  created_at: string;
}

export async function loadLessonMaterialProject(
  supabase: SupabaseClient,
  projectId: string
): Promise<LessonMaterialProjectDetail | null> {
  const { data, error } = await supabase
    .from("lesson_material_projects")
    .select(
      "id, title, lesson_label, source_passage, folder_id, content, updated_at, created_at"
    )
    .eq("id", projectId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id as string,
    title: data.title as string,
    lesson_label: (data.lesson_label as string | null) ?? null,
    source_passage: (data.source_passage as string | null) ?? null,
    folder_id: (data.folder_id as string | null) ?? null,
    content: parseProjectContent(data.content),
    updated_at: data.updated_at as string,
    created_at: data.created_at as string,
  };
}
