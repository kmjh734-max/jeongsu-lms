import type { SupabaseClient } from "@supabase/supabase-js";
import { listListeningSetFolders } from "@/lib/listening/folder-access";
import { listScheduleAssignments } from "@/lib/listening/schedule/list-assignments";
import type { ScheduleAssignmentListItem } from "@/lib/listening/schedule/list-assignments";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/types/database";

export interface ScheduleStudentOption {
  id: string;
  name: string;
}

export interface ScheduleAssignPageData {
  assignments: ScheduleAssignmentListItem[];
  classes: { id: string; name: string }[];
  sets: { id: string; title: string; folder_id: string | null }[];
  folders: { id: string; name: string }[];
  students: ScheduleStudentOption[];
}

async function loadScheduleStudentOptions(
  supabase: SupabaseClient,
  role: UserRole,
  viewerId: string
): Promise<ScheduleStudentOption[]> {
  if (role === "teacher") {
    const { data: classes } = await supabase
      .from("classes")
      .select("id")
      .eq("teacher_id", viewerId)
      .eq("is_active", true);

    const classIds = (classes ?? []).map((c) => c.id as string);
    if (classIds.length === 0) return [];

    const { data: members } = await supabase
      .from("class_students")
      .select("student_id")
      .in("class_id", classIds);

    const studentIds = [
      ...new Set((members ?? []).map((m) => m.student_id as string)),
    ];
    if (studentIds.length === 0) return [];

    const { data } = await supabase
      .from("profiles")
      .select("id, name")
      .eq("role", "student")
      .in("id", studentIds)
      .order("name")
      .limit(500);

    return (data ?? []).map((s) => ({
      id: s.id as string,
      name: s.name as string,
    }));
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, name")
    .eq("role", "student")
    .eq("is_active", true)
    .order("name")
    .limit(500);

  return (data ?? []).map((s) => ({
    id: s.id as string,
    name: s.name as string,
  }));
}

export async function loadScheduleAssignPageData(
  supabase: SupabaseClient,
  role: UserRole,
  viewerId: string
): Promise<ScheduleAssignPageData> {
  const admin = createAdminClient();

  let setsQuery = supabase
    .from("listening_sets")
    .select("id, title, folder_id, order_index")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(200);

  let classesQuery = supabase
    .from("classes")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  if (role === "teacher") {
    setsQuery = setsQuery.eq("teacher_id", viewerId);
    classesQuery = classesQuery.eq("teacher_id", viewerId);
  }

  let folders: { id: string; name: string }[] = [];
  try {
    const rows = await listListeningSetFolders(supabase, role, viewerId);
    folders = rows.map((f) => ({ id: f.id, name: f.name }));
  } catch {
    folders = [];
  }

  const [assignments, { data: classes }, { data: sets }, students] =
    await Promise.all([
      listScheduleAssignments(admin, role, viewerId),
      classesQuery,
      setsQuery,
      loadScheduleStudentOptions(supabase, role, viewerId),
    ]);

  return {
    assignments,
    classes: classes ?? [],
    sets: (sets ?? []).map((s) => ({
      id: s.id as string,
      title: s.title as string,
      folder_id: (s.folder_id as string | null) ?? null,
    })),
    folders,
    students,
  };
}
