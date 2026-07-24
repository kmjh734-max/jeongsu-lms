import { redirect } from "next/navigation";
import { ExamPrepStaffNav } from "@/components/exam-prep/ExamPrepStaffNav";
import { WorkbookCreateForm } from "@/components/exam-prep/WorkbookCreateForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import { createClient } from "@/lib/supabase/server";

const BASE = "/teacher/exam-prep";

export default async function TeacherExamPrepWorkbookNewPage() {
  if (!isExamPrepEnabled()) redirect("/teacher");
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "teacher" || !profile.academy_id) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("exam_passages")
    .select("id, title")
    .eq("academy_id", profile.academy_id)
    .eq("status", "ready")
    .order("title", { ascending: true });

  return (
    <div>
      <PageHeader
        title="워크북 생성"
        description="ready 상태 지문과 프리셋을 선택합니다."
      />
      <ExamPrepStaffNav basePath={BASE} current="workbooks" />
      <WorkbookCreateForm
        basePath={BASE}
        passages={(data ?? []) as { id: string; title: string }[]}
      />
    </div>
  );
}
