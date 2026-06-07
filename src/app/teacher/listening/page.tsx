import { getCurrentProfile } from "@/lib/auth/get-profile";
import { ListeningStatusPanel } from "@/components/learning-status/ListeningStatusPanel";
import { ListeningSetsListClient } from "@/components/listening/ListeningSetsListClient";
import { PageHeader } from "@/components/ui/PageHeader";
import { loadListeningAssignmentSummaries } from "@/lib/listening/load-assignment-summaries";
import { listReportClasses } from "@/lib/reports/list-students";
import { createClient } from "@/lib/supabase/server";

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
  const [assignmentBySetId, statusClasses] = await Promise.all([
    loadListeningAssignmentSummaries(supabase, setList.map((s) => s.id)),
    listReportClasses(supabase, "teacher", profile!.id),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="듣기학습"
        description="다중 화자 대본으로 듣기 문항·음원을 만듭니다."
      />
      <ListeningStatusPanel initialClasses={statusClasses} />
      <div>
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
