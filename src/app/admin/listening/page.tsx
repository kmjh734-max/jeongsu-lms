import { ListeningStatusPanel } from "@/components/learning-status/ListeningStatusPanel";
import { ListeningSetsListClient } from "@/components/listening/ListeningSetsListClient";
import { PageHeader } from "@/components/ui/PageHeader";
import { loadListeningAssignmentSummaries } from "@/lib/listening/load-assignment-summaries";
import { listReportClasses } from "@/lib/reports/list-students";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";

export default async function AdminListeningPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const [{ data: sets }, { data: classes }] = await Promise.all([
    supabase
      .from("listening_sets")
      .select("id, title, is_published, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("classes")
      .select("id, name")
      .eq("is_active", true)
      .order("name"),
  ]);

  const setList = sets ?? [];
  const [assignmentBySetId, statusClasses] = await Promise.all([
    loadListeningAssignmentSummaries(supabase, setList.map((s) => s.id)),
    listReportClasses(supabase, "admin", profile!.id),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="듣기학습"
        description="다중 화자(ANN/M/W) 대본 · AI 문항 · TTS 음원 관리"
      />
      <ListeningStatusPanel initialClasses={statusClasses} />
      <div>
        <ListeningSetsListClient
          sets={setList}
          basePath="/admin/listening"
          classes={classes ?? []}
          schedulesPath="/admin/listening/schedules"
          assignmentBySetId={assignmentBySetId}
        />
      </div>
    </div>
  );
}
