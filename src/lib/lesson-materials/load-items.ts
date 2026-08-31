import type { SupabaseClient } from "@supabase/supabase-js";
import { parseProjectContent } from "@/lib/lesson-materials/project-content";
import type { LessonMaterialProjectContent } from "@/lib/lesson-materials/project-content";

export interface LessonMaterialItemRow {
  id: string;
  project_id: string;
  label: string | null;
  title: string;
  summary: string | null;
  source_passage: string | null;
  content: LessonMaterialProjectContent;
  order_index: number;
  updated_at: string;
  created_at: string;
}

export interface LessonMaterialItemDetail extends LessonMaterialItemRow {
  project_title: string;
}

function mapItem(row: Record<string, unknown>): LessonMaterialItemRow {
  return {
    id: row.id as string,
    project_id: row.project_id as string,
    label: (row.label as string | null) ?? null,
    title: row.title as string,
    summary: (row.summary as string | null) ?? null,
    source_passage: (row.source_passage as string | null) ?? null,
    content: parseProjectContent(row.content),
    order_index: (row.order_index as number) ?? 0,
    updated_at: row.updated_at as string,
    created_at: row.created_at as string,
  };
}

export function sentenceCountFromItem(item: LessonMaterialItemRow): number {
  const lines = item.content.lineInterpretation?.lines;
  if (lines?.length) return lines.length;
  const passage = item.source_passage?.trim() ?? "";
  if (!passage) return 0;
  return passage.split(/(?<=[.!?])\s+/).filter(Boolean).length;
}

export async function loadLessonMaterialItems(
  supabase: SupabaseClient,
  projectId: string
): Promise<LessonMaterialItemRow[]> {
  const { data, error } = await supabase
    .from("lesson_material_items")
    .select(
      "id, project_id, label, title, summary, source_passage, content, order_index, updated_at, created_at"
    )
    .eq("project_id", projectId)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return [];
  return (data ?? []).map((row) => mapItem(row as Record<string, unknown>));
}

export async function loadLessonMaterialItem(
  supabase: SupabaseClient,
  itemId: string
): Promise<LessonMaterialItemDetail | null> {
  const { data, error } = await supabase
    .from("lesson_material_items")
    .select(
      "id, project_id, label, title, summary, source_passage, content, order_index, updated_at, created_at"
    )
    .eq("id", itemId)
    .maybeSingle();

  if (error || !data) return null;

  const { data: project } = await supabase
    .from("lesson_material_projects")
    .select("title")
    .eq("id", data.project_id as string)
    .maybeSingle();

  return {
    ...mapItem(data as Record<string, unknown>),
    project_title: (project?.title as string) ?? "자료",
  };
}
