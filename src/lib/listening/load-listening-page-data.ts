import type { SupabaseClient } from "@supabase/supabase-js";
import { loadListeningAssignmentSummaries } from "@/lib/listening/load-assignment-summaries";
import { listReportClasses } from "@/lib/reports/list-students";
import type { UserRole } from "@/types/database";

export interface ListeningSetListItem {
  id: string;
  title: string;
  is_published: boolean;
  created_at: string;
}

export async function loadListeningPageData(
  supabase: SupabaseClient,
  role: UserRole,
  viewerId: string
) {
  let setsQuery = supabase
    .from("listening_sets")
    .select("id, title, is_published, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  let classesQuery = supabase
    .from("classes")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  if (role === "teacher") {
    setsQuery = setsQuery.eq("teacher_id", viewerId);
    classesQuery = classesQuery.eq("teacher_id", viewerId);
  }

  const [{ data: sets }, { data: classes }, statusClasses] = await Promise.all([
    setsQuery,
    classesQuery,
    listReportClasses(supabase, role, viewerId),
  ]);

  const setList = (sets ?? []) as ListeningSetListItem[];
  const assignmentBySetId = await loadListeningAssignmentSummaries(
    supabase,
    setList.map((s) => s.id)
  );

  return {
    sets: setList,
    classes: classes ?? [],
    assignmentBySetId,
    statusClasses,
  };
}
