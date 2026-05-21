import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ClassWithStudents,
  FolderAssignmentRow,
} from "@/components/vocab/FolderAssignPanel";

export async function loadFolderAssignPanelData(
  supabase: SupabaseClient,
  role: "admin" | "teacher",
  userId: string,
  folderId: string
): Promise<{
  classes: ClassWithStudents[];
  assignments: FolderAssignmentRow[];
  setCount: number;
}> {
  const [classesRes, setsRes] = await Promise.all([
    role === "admin"
      ? supabase
          .from("classes")
          .select("id, name")
          .eq("is_active", true)
          .order("name")
      : supabase
          .from("classes")
          .select("id, name")
          .eq("teacher_id", userId)
          .order("name"),
    supabase.from("vocab_sets").select("id").eq("folder_id", folderId),
  ]);

  const setIds = (setsRes.data ?? []).map((s) => s.id as string);
  const assignmentsRes =
    setIds.length > 0
      ? await supabase
          .from("vocab_assignments")
          .select(
            "id, set_id, student_id, class_id, set:vocab_sets(title), student:profiles!vocab_assignments_student_id_fkey(name), class:classes(name)"
          )
          .in("set_id", setIds)
          .not("student_id", "is", null)
          .order("created_at", { ascending: false })
      : { data: [] };

  const classList = (classesRes.data ?? []) as { id: string; name: string }[];
  const classIds = classList.map((c) => c.id);

  const { data: memberRows } =
    classIds.length > 0
      ? await supabase
          .from("class_students")
          .select(
            "class_id, student_id, student:profiles!class_students_student_id_fkey(id, name)"
          )
          .in("class_id", classIds)
      : { data: [] };

  const studentsByClass = new Map<string, { id: string; name: string }[]>();
  for (const row of memberRows ?? []) {
    const student = Array.isArray(row.student) ? row.student[0] : row.student;
    const list = studentsByClass.get(row.class_id as string) ?? [];
    list.push({
      id: row.student_id as string,
      name: (student as { name?: string } | null)?.name ?? "—",
    });
    studentsByClass.set(row.class_id as string, list);
  }

  const classes: ClassWithStudents[] = classList.map((c) => ({
    id: c.id,
    name: c.name,
    students: studentsByClass.get(c.id) ?? [],
  }));

  const assignments: FolderAssignmentRow[] = (assignmentsRes.data ?? []).map(
    (row) => {
      const set = Array.isArray(row.set) ? row.set[0] : row.set;
      const student = Array.isArray(row.student) ? row.student[0] : row.student;
      const cls = Array.isArray(row.class) ? row.class[0] : row.class;
      return {
        id: row.id as string,
        set_id: row.set_id as string,
        student_id: row.student_id as string,
        class_id: row.class_id as string,
        set_title: (set as { title?: string } | null)?.title ?? "—",
        student_name: (student as { name?: string } | null)?.name ?? "—",
        class_name: (cls as { name?: string } | null)?.name ?? "—",
      };
    }
  );

  return {
    classes,
    assignments,
    setCount: (setsRes.data ?? []).length,
  };
}
