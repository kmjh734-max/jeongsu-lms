import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LessonMaterialItemWorkspace } from "@/components/lesson-materials/LessonMaterialItemWorkspace";
import { loadLessonMaterialItem } from "@/lib/lesson-materials/load-items";

interface PageProps {
  params: Promise<{ projectId: string; itemId: string }>;
}

export default async function AdminLessonMaterialItemPage({
  params,
}: PageProps) {
  const { itemId } = await params;
  const supabase = await createClient();
  const item = await loadLessonMaterialItem(supabase, itemId);
  if (!item) notFound();

  return (
    <Suspense fallback={<p className="text-sm text-slate-500">불러오는 중…</p>}>
      <LessonMaterialItemWorkspace role="admin" item={item} />
    </Suspense>
  );
}
