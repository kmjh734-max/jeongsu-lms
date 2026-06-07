import { ListeningScheduleManageClient } from "@/components/listening/ListeningScheduleManageClient";
import { createClient } from "@/lib/supabase/server";

export default async function AdminListeningSchedulesPage() {
  const supabase = await createClient();
  const [{ data: classes }, { data: sets }] = await Promise.all([
    supabase
      .from("classes")
      .select("id, name")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("listening_sets")
      .select("id, title")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  return (
    <ListeningScheduleManageClient
      basePath="/admin/listening"
      classes={classes ?? []}
      sets={sets ?? []}
    />
  );
}
