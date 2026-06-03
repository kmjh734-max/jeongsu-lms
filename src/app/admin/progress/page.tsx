import { createClient } from "@/lib/supabase/server";
import { EnrollmentProgressDetailTable } from "@/components/progress/EnrollmentProgressDetailTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { loadProgressPageRows } from "@/lib/progress/load-progress-page";

export default async function AdminProgressPage() {
  const supabase = await createClient();
  const rows = await loadProgressPageRows(supabase);

  return (
    <div className="space-y-6">
      <PageHeader
        title="수강 현황"
        description="최근 수강 배정 400건 기준으로 진도를 표시합니다. 학생 이름으로 검색할 수 있습니다."
      />
      <EnrollmentProgressDetailTable rows={rows} />
    </div>
  );
}
