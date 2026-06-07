import { getCurrentProfile } from "@/lib/auth/get-profile";
import { ListeningScheduleManageClient } from "@/components/listening/ListeningScheduleManageClient";
import { PageHeader } from "@/components/ui/PageHeader";
import { loadScheduleAssignPageData } from "@/lib/listening/load-schedule-assign-page-data";
import { createClient } from "@/lib/supabase/server";

export default async function TeacherListeningAssignPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const { assignments, classes, sets, students } =
    await loadScheduleAssignPageData(supabase, "teacher", profile!.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="듣기세트 배정하기"
        description="반·학생별 스케줄 과제를 배정·취소·재활성화합니다."
      />
      <ListeningScheduleManageClient
        basePath="/teacher/listening"
        classes={classes}
        sets={sets}
        initialAssignments={assignments}
        initialStudents={students}
      />
    </div>
  );
}
