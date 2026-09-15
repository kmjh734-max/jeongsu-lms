import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { ClassListView } from "@/components/classes/ClassListView";
import { CreateClassButton } from "@/components/classes/CreateClassForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { loadClassListRows } from "@/lib/classes/load-class-list";
import { getTodayIsoKorea } from "@/lib/date/korea-today";

export default async function AdminClassesPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const academyId = profile?.academy_id ?? null;

  const [rows, { data: teachers }] = await Promise.all([
    loadClassListRows(supabase, createAdminClient(), { todayIso: getTodayIsoKorea() }),
    supabase
      .from("profiles")
      .select("id, name")
      .eq("role", "teacher")
      .eq("is_active", true)
      .order("name"),
  ]);

  const teacherList = (teachers ?? []) as { id: string; name: string }[];

  return (
    <div>
      <PageHeader
        title="반 관리"
        description="반을 만들고 학생·강좌·학습을 한곳에서 관리합니다."
        action={<CreateClassButton teachers={teacherList} disabled={!academyId} />}
      />

      {!academyId ? (
        <p
          role="status"
          className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
        >
          소속 학원이 연결되지 않아 반을 만들 수 없어요. EngCore Admin에서 이 계정을 학원
          관리자로 연결해 주세요.
        </p>
      ) : null}

      <ClassListView
        rows={rows}
        basePath="/admin/classes"
        teachers={teacherList}
        emptyMessage="아직 반이 없어요. 오른쪽 위 '새 반'으로 만들어 보세요."
      />
    </div>
  );
}
