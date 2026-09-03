import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LessonMaterialProjectWorkspace } from "@/components/lesson-materials/LessonMaterialProjectWorkspace";

type LessonMaterialItemRow = {
  id: string;
  label: string | null;
  title: string;
  english_text: string;
  korean_text: string | null;
  order_index: number;
};

type LessonMaterialProjectRow = {
  id: string;
  title: string;
  analysis_json: unknown;
  illustration_prompt: string | null;
  illustration_url: string | null;
};

export default async function TeacherLessonMaterialProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const supabase = await createClient();
  const { projectId } = await params;

  const { data: project, error: projectErr } = await supabase
    .from("lesson_material_projects")
    .select("id,title,analysis_json,illustration_prompt,illustration_url")
    .eq("id", projectId)
    .maybeSingle();

  if (projectErr) return notFound();
  if (!project) return notFound();

  const { data: items } = await supabase
    .from("lesson_material_items")
    .select("id,label,title,english_text,korean_text,order_index")
    .eq("project_id", projectId)
    .order("order_index", { ascending: true });

  return (
    <LessonMaterialProjectWorkspace
      role="teacher"
      project={{ id: project.id, title: project.title }}
      items={(items ?? []) as LessonMaterialItemRow[]}
      analysis_json={(project as LessonMaterialProjectRow).analysis_json}
      illustration_prompt={
        (project as LessonMaterialProjectRow).illustration_prompt
      }
      illustration_url={(project as LessonMaterialProjectRow).illustration_url}
    />
  );
}

