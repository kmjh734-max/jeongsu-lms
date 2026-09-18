import { createAdminClient } from "@/lib/supabase/admin";
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
  // 강사 권한으로는 원장님이 등록한 학생을 읽지 못해, 서버에서 같은 학원·내 학생으로 좁혀 읽는다
  const data = await loadStudentsPageData(createAdminClient(), filters, {
    teacherVisible: { teacherId, academyId: profile!.academy_id ?? "" },
    classTeacherId: teacherId,
    courseTeacherId: teacherId,
  });

  return (
    <StudentsBoard
      variant="teacher"
      title="학생 관리"
      description="내가 등록한 학생과 내 반 학생을 관리하고, 담당 강좌를 배정합니다."
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
