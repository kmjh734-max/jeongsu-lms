import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { CreateClassForm } from "@/components/classes/CreateClassForm";
import { DeleteClassButton } from "@/components/classes/DeleteClassButton";
import { deleteClass } from "@/app/admin/classes/actions";
import { ActiveBadge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Class, Profile } from "@/types/database";

export default async function AdminClassesPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const academyId = profile?.academy_id ?? null;
  const admin = createAdminClient();

  let teachersQuery = admin
    .from("profiles")
    .select("*")
    .eq("role", "teacher")
    .eq("is_active", true)
    .order("name");
  if (academyId) {
    teachersQuery = teachersQuery.eq("academy_id", academyId);
  }

  const [{ data: classes }, { data: teachers }, { data: studentRows }, { data: courseRows }] =
    await Promise.all([
      supabase
        .from("classes")
        .select("*, teacher:profiles!classes_teacher_id_fkey(id, name)")
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
      teachersQuery,
      supabase.from("class_students").select("class_id"),
      supabase.from("class_courses").select("class_id"),
    ]);

  const studentCountByClass = new Map<string, number>();
  for (const row of studentRows ?? []) {
    studentCountByClass.set(
      row.class_id,
      (studentCountByClass.get(row.class_id) ?? 0) + 1
    );
  }

  const courseCountByClass = new Map<string, number>();
  for (const row of courseRows ?? []) {
    courseCountByClass.set(
      row.class_id,
      (courseCountByClass.get(row.class_id) ?? 0) + 1
    );
  }

  const classList = (classes ?? []) as (Class & {
    teacher: { id: string; name: string } | null;
  })[];

  return (
    <div className="space-y-8">
      <PageHeader
        title="반 관리"
        description="반을 만들고 학생·강좌를 일괄 배정합니다."
      />

      {!academyId ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          소속 학원 정보가 없어 반을 만들 수 없습니다. EngCore Admin에서 이
          계정을 학원 관리자로 연결해 주세요.
        </div>
      ) : null}

      <div className="ui-section-card">
        <CreateClassForm teachers={(teachers ?? []) as Profile[]} />
      </div>

      <div className="ui-table-wrap">
        <table className="ui-table">
          <thead>
            <tr>
              <th className="px-4 py-3 font-medium">반 이름</th>
              <th className="px-4 py-3 font-medium">담당 강사</th>
              <th className="px-4 py-3 font-medium">학생</th>
              <th className="px-4 py-3 font-medium">강좌</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">관리</th>
            </tr>
          </thead>
          <tbody>
            {classList.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  등록된 반이 없습니다. 위에서 새 반을 만들어 주세요.
                </td>
              </tr>
            ) : (
              classList.map((cls) => (
                <tr
                  key={cls.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-4 py-3 font-medium">{cls.name}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {cls.teacher?.name ?? "미배정"}
                  </td>
                  <td className="px-4 py-3">
                    {studentCountByClass.get(cls.id) ?? 0}명
                  </td>
                  <td className="px-4 py-3">
                    {courseCountByClass.get(cls.id) ?? 0}개
                  </td>
                  <td className="px-4 py-3">
                    <ActiveBadge active={cls.is_active} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/classes/${cls.id}`}
                        className="font-medium text-brand-600 hover:underline"
                      >
                        반 관리
                      </Link>
                      <DeleteClassButton
                        classId={cls.id}
                        className={cls.name}
                        onDelete={deleteClass}
                        compact
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
