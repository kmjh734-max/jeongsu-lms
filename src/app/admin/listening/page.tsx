import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { ListeningSetsListClient } from "@/components/listening/ListeningSetsListClient";
import { loadListeningAssignmentSummaries } from "@/lib/listening/load-assignment-summaries";

export default async function AdminListeningPage() {
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
  const assignmentBySetId = await loadListeningAssignmentSummaries(
    supabase,
    setList.map((s) => s.id)
  );

  return (
    <div>
      <PageHeader
        title="듣기학습"
        description="다중 화자(ANN/M/W) 대본 · AI 문항 · TTS 음원 관리"
      />
      <div className="mt-6">
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
