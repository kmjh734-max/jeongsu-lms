import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ClassVocabAssignmentRow,
  VocabSetOption,
} from "@/components/vocab/ClassVocabPanel";

export async function loadClassVocabPanelData(
  supabase: SupabaseClient,
  role: "admin" | "teacher",
  userId: string,
  classId: string
): Promise<{
  assignments: ClassVocabAssignmentRow[];
  setOptions: VocabSetOption[];
}> {
  const [assignmentsRes, setsRes] = await Promise.all([
    supabase
      .from("vocab_assignments")
      .select("id, set_id, set:vocab_sets(id, title)")
      .eq("class_id", classId)
      .is("student_id", null)
      .order("created_at", { ascending: false }),
    role === "admin"
      ? supabase
          .from("vocab_sets")
          .select("id, title, folder:vocab_folders(name)")
          .order("title")
      : supabase
          .from("vocab_sets")
          .select("id, title, folder:vocab_folders(name)")
          .or(`teacher_id.eq.${userId},created_by.eq.${userId}`)
          .order("title"),
  ]);

  const assignments: ClassVocabAssignmentRow[] = (assignmentsRes.data ?? []).map(
    (row) => {
      const set = Array.isArray(row.set) ? row.set[0] : row.set;
      return {
        id: row.id as string,
        set_id: row.set_id as string,
        title: (set as { title?: string } | null)?.title ?? "—",
      };
    }
  );

  const setOptions: VocabSetOption[] = (setsRes.data ?? []).map((row) => {
    const folder = Array.isArray(row.folder) ? row.folder[0] : row.folder;
    return {
      id: row.id as string,
      title: row.title as string,
      folder_name: (folder as { name?: string } | null)?.name ?? null,
    };
  });

  return { assignments, setOptions };
}
