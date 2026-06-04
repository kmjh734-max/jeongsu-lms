import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { PageHeader } from "@/components/ui/PageHeader";
import { ListeningSetsListClient } from "@/components/listening/ListeningSetsListClient";
import { loadListeningAssignmentSummaries } from "@/lib/listening/load-assignment-summaries";

export default async function TeacherListeningPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const [{ data: sets }, { data: classes }] = await Promise.all([
    supabase
      .from("listening_sets")
      .select("id, title, is_published, created_at")
      .eq("teacher_id", profile!.id)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("classes")
      .select("id, name")
      .eq("teacher_id", profile!.id)
      .eq("is_active", true)
      .order("name"),
  ]);

  const setList = sets ?? [];
  const assignmentBySetId = await loadListeningAssignmentSummaries(
    supabase,
    setList.map((s) => s.id)
  );

  return (
    <div>
      <PageHeader
        title="듣기학습"
        description="다중 화자 대본으로 듣기 문항·음원을 만듭니다."
      />
      <div className="mt-6">
        <ListeningSetsListClient
          sets={setList}
          basePath="/teacher/listening"
          classes={classes ?? []}
          schedulesPath="/teacher/listening/schedules"
          assignmentBySetId={assignmentBySetId}
        />
      </div>
    </div>
  );
}
