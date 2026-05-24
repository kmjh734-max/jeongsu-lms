import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { ListeningSetManageClient } from "@/components/listening/ListeningSetManageClient";
import { ListeningAssignPanel } from "@/components/listening/ListeningAssignPanel";
import { loadListeningSetForEditor } from "@/lib/listening/load-set-editor";

export default async function TeacherListeningSetPage({
  params,
}: {
  params: Promise<{ setId: string }>;
}) {
  const { setId } = await params;
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const loaded = await loadListeningSetForEditor(supabase, setId);
  if (!loaded) notFound();

  if (
    loaded.set.teacher_id !== profile!.id &&
    loaded.set.created_by !== profile!.id
  ) {
    notFound();
  }

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name")
    .eq("teacher_id", profile!.id)
    .eq("is_active", true)
    .order("name");

  const { data: assignments } = await supabase
    .from("listening_assignments")
    .select("class_id, class:classes(name)")
    .eq("set_id", setId)
    .not("class_id", "is", null);

  const assignedClassNames = (assignments ?? [])
    .map((a) => {
      const c = a.class as { name?: string } | { name?: string }[] | null;
      if (Array.isArray(c)) return c[0]?.name;
      return c?.name;
    })
    .filter((n): n is string => !!n);

  const { data: studentAssignments } = await supabase
    .from("listening_assignments")
    .select("student_id, student:profiles!listening_assignments_student_id_fkey(name)")
    .eq("set_id", setId)
    .not("student_id", "is", null);

  const assignedStudentNames = (studentAssignments ?? [])
    .map((a) => {
      const s = a.student as { name?: string } | { name?: string }[] | null;
      if (Array.isArray(s)) return s[0]?.name;
      return s?.name;
    })
    .filter((n): n is string => !!n);

  const classIds = (classes ?? []).map((c) => c.id);
  const { data: classStudents } =
    classIds.length > 0
      ? await supabase
          .from("class_students")
          .select("student_id, student:profiles(name)")
          .in("class_id", classIds)
      : { data: [] as { student_id: string; student: { name: string } | null }[] };

  const studentMap = new Map<string, string>();
  for (const row of classStudents ?? []) {
    const name = (row.student as { name?: string } | null)?.name;
    if (name) studentMap.set(row.student_id, name);
  }
  const students = [...studentMap.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));

  return (
    <div className="space-y-6">
      <Link
        href="/teacher/listening"
        className="text-sm text-indigo-600 hover:underline"
      >
        ← 듣기 세트 목록
      </Link>
      <ListeningSetManageClient
        setId={loaded.set.id}
        title={loaded.set.title}
        isPublished={loaded.set.is_published}
        speechSpeed={loaded.set.speech_speed ?? 0.9}
        questions={loaded.questions}
        role="teacher"
      />
      <ListeningAssignPanel
        setId={setId}
        classes={classes ?? []}
        students={students}
        assignedClassNames={assignedClassNames}
        assignedStudentNames={assignedStudentNames}
        isPublished={loaded.set.is_published}
      />
    </div>
  );
}
