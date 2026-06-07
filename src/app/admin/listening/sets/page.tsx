import { ListeningSetsListClient } from "@/components/listening/ListeningSetsListClient";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { loadListeningPageData } from "@/lib/listening/load-listening-page-data";
import { createClient } from "@/lib/supabase/server";

export default async function AdminListeningSetsPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const { sets, classes, assignmentBySetId } = await loadListeningPageData(
    supabase,
    "admin",
    profile!.id
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="듣기세트 만들기"
        description="듣기 세트를 생성하고 문항·음원을 편집합니다."
      />
      <ListeningSetsListClient
        sets={sets}
        basePath="/admin/listening"
        classes={classes}
        assignmentBySetId={assignmentBySetId}
        createOnly
      />
    </div>
  );
}
