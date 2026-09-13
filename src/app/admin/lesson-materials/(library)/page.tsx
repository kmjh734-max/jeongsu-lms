import { createClient } from "@/lib/supabase/server";
import { loadLessonMaterialsLibraryData } from "@/lib/lesson-materials/load-library";
import { LessonMaterialsLibrary } from "@/components/lesson-materials/LessonMaterialsLibrary";

export default async function AdminLessonMaterialsPage() {
  const supabase = await createClient();
  const data = await loadLessonMaterialsLibraryData(supabase);

  return <LessonMaterialsLibrary role="admin" data={data} />;
}
