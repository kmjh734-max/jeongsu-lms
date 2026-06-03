import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { EnrollmentProgressDetailTable } from "@/components/progress/EnrollmentProgressDetailTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { loadProgressPageRows } from "@/lib/progress/load-progress-page";

export default async function TeacherProgressPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: myCourses } = await supabase
    .from("courses")
    .select("id")
    .eq("teacher_id", profile!.id);

  const courseIds = (myCourses ?? []).map((c) => c.id);

  if (courseIds.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">수강 현황</h2>
          <p className="mt-1 text-sm text-slate-600">
            담당 강좌에 배정된 학생의 영상별 학습 기록을 확인합니다.
          </p>
        </div>
        <EnrollmentProgressDetailTable rows={[]} />
      </div>
    );
  }

  const rows = await loadProgressPageRows(supabase, {
    teacherId: profile!.id,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="수강 현황"
        description="학생별·강좌별 진도와 영상별 시청 기록을 확인합니다."
      />
      <EnrollmentProgressDetailTable rows={rows} />
    </div>
  );
}
