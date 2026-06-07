import { getCurrentProfile } from "@/lib/auth/get-profile";
import { ListeningScheduleManageClient } from "@/components/listening/ListeningScheduleManageClient";
import { createClient } from "@/lib/supabase/server";

export default async function TeacherListeningSchedulesPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const [{ data: classes }, { data: sets }] = await Promise.all([
    supabase
      .from("classes")
      .select("id, name")
      .eq("teacher_id", profile!.id)
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("listening_sets")
      .select("id, title")
      .eq("teacher_id", profile!.id)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  return (
    <ListeningScheduleManageClient
      basePath="/teacher/listening"
      classes={classes ?? []}
      sets={sets ?? []}
    />
  );
}
