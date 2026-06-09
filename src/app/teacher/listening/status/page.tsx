import { getCurrentProfile } from "@/lib/auth/get-profile";
import { ListeningStatusPanel } from "@/components/learning-status/ListeningStatusPanel";
import { PageHeader } from "@/components/ui/PageHeader";
import { loadListeningPageData } from "@/lib/listening/load-listening-page-data";
import { createClient } from "@/lib/supabase/server";

export default async function TeacherListeningStatusPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const { statusClasses } = await loadListeningPageData(
    supabase,
    "teacher",
    profile!.id
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="듣기학습 현황"
        description="숙제 현황과 학생별 OMR 시험 결과를 각각 확인합니다."
      />
      <ListeningStatusPanel initialClasses={statusClasses} />
    </div>
  );
}
