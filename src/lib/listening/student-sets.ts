import type { SupabaseClient } from "@supabase/supabase-js";

export interface StudentListeningSetItem {
  id: string;
  title: string;
  description: string | null;
  is_published: boolean;
}

/** 학생에게 배정된 듣기 세트 (반 배정 + 개별 배정) */
export async function fetchStudentListeningSets(
  supabase: SupabaseClient,
  studentId: string
): Promise<StudentListeningSetItem[]> {
  const [{ data: classMemberships }, { data: directAssignments }] =
    await Promise.all([
      supabase
        .from("class_students")
        .select("class_id")
        .eq("student_id", studentId),
      supabase
        .from("listening_assignments")
        .select("set_id")
        .eq("student_id", studentId),
    ]);

  const classIds = (classMemberships ?? []).map((r) => r.class_id);

  const { data: classAssignments } =
    classIds.length > 0
      ? await supabase
          .from("listening_assignments")
          .select("set_id")
          .in("class_id", classIds)
      : { data: [] as { set_id: string }[] };

  const setIds = [
    ...new Set([
      ...(directAssignments ?? []).map((a) => a.set_id),
      ...(classAssignments ?? []).map((a) => a.set_id),
    ]),
  ];

  if (setIds.length === 0) return [];

  const { data: sets, error } = await supabase
    .from("listening_sets")
    .select("id, title, description, is_published")
    .in("id", setIds)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) return [];

  return (sets ?? []) as StudentListeningSetItem[];
}
