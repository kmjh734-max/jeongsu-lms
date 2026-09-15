import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { ClassListView } from "@/components/classes/ClassListView";
import { PageHeader } from "@/components/ui/PageHeader";
import { loadClassListRows } from "@/lib/classes/load-class-list";
import { getTodayIsoKorea } from "@/lib/date/korea-today";

export default async function TeacherClassesPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const rows = await loadClassListRows(supabase, createAdminClient(), {
    teacherId: profile!.id,
    todayIso: getTodayIsoKorea(),
  });

  return (
    <div>
      <PageHeader
        title="반 관리"
        description="담당 반의 학생·강좌·학습을 한곳에서 관리합니다."
      />
      <ClassListView
        rows={rows}
        basePath="/teacher/classes"
        emptyMessage="담당 반이 없어요. 관리자에게 반 배정을 요청해 주세요."
      />
    </div>
  );
}
