import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LessonMaterialProjectWorkspace } from "@/components/lesson-materials/LessonMaterialProjectWorkspace";
import { loadLessonMaterialProject } from "@/lib/lesson-materials/load-project";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function AdminLessonMaterialProjectPage({
  params,
}: PageProps) {
  const { projectId } = await params;
  const supabase = await createClient();
  const project = await loadLessonMaterialProject(supabase, projectId);
  if (!project) notFound();

  return (
    <Suspense fallback={<p className="text-sm text-slate-500">불러오는 중…</p>}>
      <LessonMaterialProjectWorkspace role="admin" project={project} />
    </Suspense>
  );
}
