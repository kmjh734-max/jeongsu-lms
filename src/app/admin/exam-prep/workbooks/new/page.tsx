import { redirect } from "next/navigation";
import { ExamPrepStaffNav } from "@/components/exam-prep/ExamPrepStaffNav";
import { WorkbookCreateForm } from "@/components/exam-prep/WorkbookCreateForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import { createClient } from "@/lib/supabase/server";

const BASE = "/admin/exam-prep";

export default async function AdminExamPrepWorkbookNewPage() {
  if (!isExamPrepEnabled()) redirect("/admin");
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin" || !profile.academy_id) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("exam_passages")
    .select("id, title, status")
    .eq("academy_id", profile.academy_id)
    .neq("status", "archived")
    .order("updated_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="워크북 생성"
        description="등록한 지문과 학습 단계를 선택합니다."
      />
      <ExamPrepStaffNav basePath={BASE} current="workbooks" />
      <WorkbookCreateForm
        basePath={BASE}
        passages={
          (data ?? []) as { id: string; title: string; status?: string }[]
        }
      />
    </div>
  );
}
