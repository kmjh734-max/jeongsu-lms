import type { SupabaseClient } from "@supabase/supabase-js";
import {
  listListeningSetFolders,
  type ListeningSetFolderRow,
} from "@/lib/listening/folder-access";
import { loadListeningAssignmentSummaries } from "@/lib/listening/load-assignment-summaries";
import { listReportClasses } from "@/lib/reports/list-students";
import type { UserRole } from "@/types/database";

export interface ListeningSetListItem {
  id: string;
  title: string;
  is_published: boolean;
  created_at: string;
  folder_id: string | null;
  order_index: number;
  is_locked?: boolean;
  description?: string | null;
}

export type ListeningSetFolderItem = ListeningSetFolderRow;

export async function loadListeningPageData(
  supabase: SupabaseClient,
  role: UserRole,
  viewerId: string
) {
  let setsQuery = supabase
    .from("listening_sets")
    .select(
      "id, title, is_published, created_at, folder_id, order_index, description"
    )
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(200);

  let classesQuery = supabase
    .from("classes")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  if (role === "teacher") {
    // 본인 세트 + 커리큘럼 잠금 세트(description 마커; is_locked 컬럼 있으면 RLS로도 허용)
    setsQuery = setsQuery.or(
      `teacher_id.eq.${viewerId},description.ilike.%curriculum_locked%`
    );
    classesQuery = classesQuery.eq("teacher_id", viewerId);
  }

  let folders: ListeningSetFolderRow[] = [];
  try {
    folders = await listListeningSetFolders(supabase, role, viewerId);
  } catch {
    folders = [];
  }

  const [{ data: sets }, { data: classes }, statusClasses] = await Promise.all([
    setsQuery,
    classesQuery,
    listReportClasses(supabase, role, viewerId),
  ]);

  const setList = ((sets ?? []) as ListeningSetListItem[]).map((s) => ({
    ...s,
    is_locked:
      s.is_locked === true ||
      (s.description ?? "").includes("curriculum_locked"),
  }));
  const assignmentBySetId = await loadListeningAssignmentSummaries(
    supabase,
    setList.map((s) => s.id)
  );

  return {
    sets: setList,
    folders,
    classes: classes ?? [],
    assignmentBySetId,
    statusClasses,
  };
}
