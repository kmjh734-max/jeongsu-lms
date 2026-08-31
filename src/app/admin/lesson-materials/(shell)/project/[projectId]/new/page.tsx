import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LessonMaterialNewItemWizard } from "@/components/lesson-materials/LessonMaterialNewItemWizard";
import { loadLessonMaterialProject } from "@/lib/lesson-materials/load-project";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function AdminLessonMaterialNewItemPage({
  params,
}: PageProps) {
  const { projectId } = await params;
  const supabase = await createClient();
  const project = await loadLessonMaterialProject(supabase, projectId);
  if (!project) notFound();

  return <LessonMaterialNewItemWizard role="admin" project={project} />;
}
