import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { ProgressOverview } from "@/components/progress/ProgressOverview";
import { PageHeader } from "@/components/ui/PageHeader";
import { weekStartInstant } from "@/lib/classes/week";
import { getTodayIsoKorea } from "@/lib/date/korea-today";
import { loadProgressPageData } from "@/lib/progress/load-progress-page";

export default async function TeacherProgressPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const data = await loadProgressPageData(supabase, { teacherId: profile!.id });
  const todayIso = getTodayIsoKorea();

  return (
    <div>
      <PageHeader
        title="수강 현황"
        description="내 동영상 강좌를 누가 어디까지 봤는지 봅니다."
      />
      <ProgressOverview
        rows={data.rows}
        classes={data.classes}
        teachers={data.teachers}
        todayIso={todayIso}
        weekStart={weekStartInstant(todayIso)}
        truncated={data.truncated}
        limit={data.limit}
      />
    </div>
  );
}
