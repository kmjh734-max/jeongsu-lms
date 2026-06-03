import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { PageHeader } from "@/components/ui/PageHeader";
import { ListeningSetsListClient } from "@/components/listening/ListeningSetsListClient";

export default async function TeacherListeningPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const { data: sets } = await supabase
    .from("listening_sets")
    .select("id, title, is_published, created_at")
    .eq("teacher_id", profile!.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <PageHeader
        title="듣기학습"
        description="다중 화자 대본으로 듣기 문항·음원을 만듭니다."
      />
      <div className="mt-6">
        <ListeningSetsListClient
          sets={sets ?? []}
          basePath="/teacher/listening"
        />
      </div>
    </div>
  );
}
