import { ListeningScheduleManageClient } from "@/components/listening/ListeningScheduleManageClient";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { loadScheduleAssignPageData } from "@/lib/listening/load-schedule-assign-page-data";
import { createClient } from "@/lib/supabase/server";

export default async function AdminListeningAssignPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const academyId = profile!.academy_id;
  if (!academyId) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        소속 학원 정보가 없습니다. EngCore Admin에서 학원에 연결해 주세요.
      </div>
    );
  }
  const { assignments, classes, sets, folders, students } =
    await loadScheduleAssignPageData(supabase, "admin", profile!.id, academyId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="듣기세트 배정하기"
        description="반·학생별 스케줄 과제를 배정·취소·재활성화합니다."
      />
      <ListeningScheduleManageClient
        basePath="/admin/listening"
        classes={classes}
        sets={sets}
        folders={folders}
        initialAssignments={assignments}
        initialStudents={students}
      />
    </div>
  );
}
