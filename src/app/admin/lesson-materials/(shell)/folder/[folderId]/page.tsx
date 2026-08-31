import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LessonMaterialsListClient } from "@/components/lesson-materials/LessonMaterialsListClient";

interface PageProps {
  params: Promise<{ folderId: string }>;
}

export default async function AdminLessonMaterialsFolderPage({
  params,
}: PageProps) {
  const { folderId } = await params;
  const supabase = await createClient();
  const { data: folder } = await supabase
    .from("lesson_material_folders")
    .select("id, name")
    .eq("id", folderId)
    .maybeSingle();

  if (!folder) notFound();

  return (
    <LessonMaterialsListClient
      role="admin"
      folderId={folderId}
      title={folder.name as string}
      description="이 폴더에 저장된 수업자료입니다."
    />
  );
}
