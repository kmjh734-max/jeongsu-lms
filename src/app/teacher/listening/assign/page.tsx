import { getCurrentProfile } from "@/lib/auth/get-profile";
import { ListeningScheduleManageClient } from "@/components/listening/ListeningScheduleManageClient";
import { PageHeader } from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/server";

export default async function TeacherListeningAssignPage() {
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
    <div className="space-y-6">
      <PageHeader
        title="듣기세트 배정하기"
        description="반·학생별 스케줄 과제를 배정·취소·재활성화합니다."
      />
      <ListeningScheduleManageClient
        basePath="/teacher/listening"
        classes={classes ?? []}
        sets={sets ?? []}
      />
    </div>
  );
}
