import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListeningSetManageClient } from "@/components/listening/ListeningSetManageClient";
import { ListeningAssignPanel } from "@/components/listening/ListeningAssignPanel";
import { loadListeningSetForEditor } from "@/lib/listening/load-set-editor";

export default async function AdminListeningSetPage({
  params,
}: {
  params: Promise<{ setId: string }>;
}) {
  const { setId } = await params;
  const supabase = await createClient();
  const loaded = await loadListeningSetForEditor(supabase, setId);
  if (!loaded) notFound();

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name")
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

  return (
    <div className="space-y-6">
      <Link
        href="/admin/listening"
        className="text-sm text-indigo-600 hover:underline"
      >
        ← 듣기 세트 목록
      </Link>
      <ListeningSetManageClient
        setId={loaded.set.id}
        title={loaded.set.title}
        gradeLevel={
          loaded.set.grade_level === "middle2" ? "middle2" : "middle1"
        }
        isPublished={loaded.set.is_published}
        speechSpeed={loaded.set.speech_speed ?? 0.9}
        voiceAnnId={loaded.set.voice_ann_id ?? null}
        voiceMId={loaded.set.voice_m_id ?? null}
        voiceWId={loaded.set.voice_w_id ?? null}
        dictationSettings={{
          dictation_enabled: loaded.set.dictation_enabled ?? true,
          dictation_pass_score: loaded.set.dictation_pass_score ?? 80,
          dictation_blank_level:
            (loaded.set.dictation_blank_level as "auto" | "few" | "normal" | "many") ??
            "auto",
          dictation_randomize_on_retry: loaded.set.dictation_randomize_on_retry ?? true,
          dictation_lock_next_until_pass:
            loaded.set.dictation_lock_next_until_pass ?? true,
        }}
        questions={loaded.questions}
        role="admin"
      />
      <ListeningAssignPanel
        setId={setId}
        classes={classes ?? []}
        assignedClassNames={assignedClassNames}
        assignedStudentNames={assignedStudentNames}
        isPublished={loaded.set.is_published}
      />
    </div>
  );
}
