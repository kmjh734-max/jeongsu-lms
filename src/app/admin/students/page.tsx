import { createClient } from "@/lib/supabase/server";
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

export default async function AdminStudentsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const filters = parseStudentFilters(sp);
  const supabase = await createClient();
  const data = await loadStudentsPageData(supabase, filters);

  return (
    <StudentsBoard
      variant="admin"
      title="학생·수강"
      description="학생 계정과 수강 강좌를 관리합니다."
      rows={data.rows}
      classOptions={data.classOptions}
      courseOptions={data.courseOptions}
      filters={{ q: filters.search, classId: filters.classId, status: filters.status }}
      pagination={{ page: data.page, total: data.total, pageSize: data.pageSize }}
      apiBasePath="/api/admin/students"
      allowUsernameEdit
      allowDelete
      reportsHref="/admin/reports"
      autoOpenCreate={sp.new === "1"}
    />
  );
}
