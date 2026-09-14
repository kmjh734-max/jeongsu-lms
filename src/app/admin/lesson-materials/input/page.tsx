import { LessonMaterialsInputWizard } from "@/components/lesson-materials/LessonMaterialsInputWizard";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 120;

export default async function AdminLessonMaterialsInputPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string }>;
}) {
  // 자료함에서 폴더를 고른 채 "새 자료 추가"를 누르면 그 폴더에 넣는다("unfiled"는 미분류).
  const { folder } = await searchParams;
  const folderId = folder?.trim() || null;
  let folderLabel: string | null = null;
  if (folderId === "unfiled") {
    folderLabel = "미분류";
  } else if (folderId) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("lesson_material_folders")
      .select("name")
      .eq("id", folderId)
      .maybeSingle();
    folderLabel = (data?.name as string | undefined) ?? null;
  }
  return <LessonMaterialsInputWizard role="admin" folderId={folderId} folderLabel={folderLabel} />;
}
