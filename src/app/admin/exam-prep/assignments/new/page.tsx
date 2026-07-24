import { redirect } from "next/navigation";
import { AssignForm } from "@/components/exam-prep/AssignForm";
import { ExamPrepStaffNav } from "@/components/exam-prep/ExamPrepStaffNav";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import { createClient } from "@/lib/supabase/server";
import { buildStudentPickerTree } from "@/lib/ui/build-enrollment-trees";
import { parseClassStudentLinks } from "@/lib/ui/parse-class-links";
import type { Profile } from "@/types/database";

const BASE = "/admin/exam-prep";

export default async function AdminExamPrepAssignmentNewPage() {
  if (!isExamPrepEnabled()) redirect("/admin");
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin" || !profile.academy_id) {
    redirect("/login");
  }

  const supabase = await createClient();
  const academyId = profile.academy_id;

  const [
    { data: workbooks },
    { data: classes },
    { data: students },
    { data: classStudents },
  ] = await Promise.all([
    supabase
      .from("exam_workbooks")
      .select("id, title")
      .eq("academy_id", academyId)
      .eq("status", "approved")
      .order("title", { ascending: true }),
    supabase
      .from("classes")
      .select("id, name")
      .eq("academy_id", academyId)
      .order("name", { ascending: true }),
    supabase
      .from("profiles")
      .select("id, name, username, email, is_active")
      .eq("academy_id", academyId)
      .eq("role", "student")
      .order("name", { ascending: true }),
    supabase
      .from("class_students")
      .select("student_id, class_id, class:classes(id, name)")
      .limit(2000),
  ]);

  const studentList = (students ?? []).filter(
    (s) => s.is_active !== false
  ) as Profile[];
  const studentTree = buildStudentPickerTree(
    studentList,
    parseClassStudentLinks(
      classStudents as Parameters<typeof parseClassStudentLinks>[0]
    )
  );

  return (
    <div>
      <PageHeader
        title="새 배정"
        description="승인된 워크북을 학생 또는 반에 배정합니다."
      />
      <ExamPrepStaffNav basePath={BASE} current="assignments" />
      <AssignForm
        basePath={BASE}
        workbooks={(workbooks ?? []) as { id: string; title: string }[]}
        studentTree={studentTree}
        classes={(classes ?? []) as { id: string; name: string }[]}
      />
    </div>
  );
}
