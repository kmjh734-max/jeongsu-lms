import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import {
  loadStudentsPageData,
  parseStudentFilters,
} from "@/lib/admin/list-students-page";
import { StudentsBoard } from "@/components/accounts/StudentsBoard";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
    class?: string;
    status?: string;
    new?: string;
  }>;
}

export default async function TeacherStudentsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const filters = parseStudentFilters(sp);
  const profile = await getCurrentProfile();
  const teacherId = profile!.id;
  const supabase = await createClient();
  const data = await loadStudentsPageData(supabase, filters, {
    createdBy: teacherId,
    classTeacherId: teacherId,
    courseTeacherId: teacherId,
  });

  return (
    <StudentsBoard
      variant="teacher"
      title="학생 관리"
      description="내가 등록한 학생 계정을 관리하고, 담당 강좌를 배정합니다."
      rows={data.rows}
      classOptions={data.classOptions}
      courseOptions={data.courseOptions}
      filters={{ q: filters.search, classId: filters.classId, status: filters.status }}
      pagination={{ page: data.page, total: data.total, pageSize: data.pageSize }}
      apiBasePath="/api/teacher/students"
      allowUsernameEdit={false}
      allowDelete={false}
      reportsHref="/teacher/reports"
      autoOpenCreate={sp.new === "1"}
    />
  );
}
