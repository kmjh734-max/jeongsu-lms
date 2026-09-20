import { createClient } from "@/lib/supabase/server";
import {
  loadStudentsPageData,
  parseStudentFilters,
} from "@/lib/admin/list-students-page";
import { StudentsBoard } from "@/components/accounts/StudentsBoard";
import { StudentJoinPanel } from "@/components/accounts/StudentJoinPanel";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { ensureJoinCode } from "@/lib/academy/join-code";
import { STUDENT_DETAIL_COLUMNS } from "@/lib/accounts/student-details";

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
  const [data, profile] = await Promise.all([loadStudentsPageData(supabase, filters), getCurrentProfile()]);

  // 학생이 직접 가입하는 길: 코드와 승인 대기 목록
  const admin = createAdminClient();
  const academyId = profile?.academy_id ?? null;
  const joinCode = academyId ? await ensureJoinCode(admin, academyId) : "";
  const { data: pendingRows } = academyId
    ? await admin
        .from("profiles")
        .select(`id, name, username, created_at, ${STUDENT_DETAIL_COLUMNS}`)
        .eq("academy_id", academyId)
        .eq("role", "student")
        .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString())
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] as Record<string, unknown>[] };
  const pending = (pendingRows ?? []).map((r) => ({
    id: String(r.id),
    name: String(r.name ?? ""),
    username: String(r.username ?? ""),
    school: (r.school as string | null) ?? null,
    schoolGrade: (r.school_grade as string | null) ?? null,
    parentPhone: (r.parent_phone as string | null) ?? null,
    createdAt: String(r.created_at ?? ""),
  }));

  return (
    <>
      {joinCode ? (
        <StudentJoinPanel
          joinCode={joinCode}
          joinUrl={`https://www.engcore.co.kr/signup/student?code=${joinCode}`}
          pending={pending}
        />
      ) : null}
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
    </>
  );
}
