import { ListeningStatusPanel } from "@/components/learning-status/ListeningStatusPanel";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { loadListeningPageData } from "@/lib/listening/load-listening-page-data";
import { createClient } from "@/lib/supabase/server";

export default async function AdminListeningStatusPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const { statusClasses } = await loadListeningPageData(
    supabase,
    "admin",
    profile!.id
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="듣기학습 현황"
        description="학생별 월간 듣기학습 완료 여부를 확인합니다."
      />
      <ListeningStatusPanel initialClasses={statusClasses} />
    </div>
  );
}
