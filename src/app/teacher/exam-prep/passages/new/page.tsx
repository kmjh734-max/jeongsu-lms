import { redirect } from "next/navigation";
import { ExamPrepStaffNav } from "@/components/exam-prep/ExamPrepStaffNav";
import { PassageForm } from "@/components/exam-prep/PassageForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";

const BASE = "/teacher/exam-prep";

export default async function TeacherExamPrepPassageNewPage() {
  if (!isExamPrepEnabled()) redirect("/teacher");
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "teacher") redirect("/login");

  return (
    <div>
      <PageHeader
        title="지문 추가"
        description="원문을 입력하면 문장이 자동으로 분리됩니다."
      />
      <ExamPrepStaffNav basePath={BASE} current="passages" />
      <PassageForm mode="create" basePath={BASE} />
    </div>
  );
}
