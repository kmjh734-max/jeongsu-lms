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
        assignedClassNames={assignedClassNames}
        isPublished={loaded.set.is_published}
      />
    </div>
  );
}
