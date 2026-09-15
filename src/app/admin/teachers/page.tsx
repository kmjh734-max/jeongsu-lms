import { createClient } from "@/lib/supabase/server";
import { loadLastSignIns } from "@/lib/accounts/last-sign-in";
import {
  StaffAccountsBoard,
  type StaffRow,
} from "@/components/accounts/StaffAccountsBoard";
import type { Profile } from "@/types/database";

export default async function AdminTeachersPage() {
  const supabase = await createClient();

  const [{ data: teachers }, { data: courses }, { data: classes }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("role", "teacher").order("name"),
      supabase
        .from("courses")
        .select("id, teacher_id")
        .not("teacher_id", "is", null),
      supabase
        .from("classes")
        .select("id, name, teacher_id")
        .eq("is_active", true)
        .not("teacher_id", "is", null)
        .order("name"),
    ]);

  const teacherList = (teachers ?? []) as Profile[];
  const lastSignIns = await loadLastSignIns(teacherList.map((t) => t.id));

  const courseCount = new Map<string, number>();
  for (const c of courses ?? []) {
    const tid = c.teacher_id as string;
    courseCount.set(tid, (courseCount.get(tid) ?? 0) + 1);
  }
  const classesByTeacher = new Map<string, { id: string; name: string }[]>();
  for (const c of classes ?? []) {
    const tid = c.teacher_id as string;
    const list = classesByTeacher.get(tid) ?? [];
    list.push({ id: c.id as string, name: c.name as string });
    classesByTeacher.set(tid, list);
  }

  const rows: StaffRow[] = teacherList.map((t) => ({
    id: t.id,
    name: t.name,
    username: t.username,
    email: t.email,
    is_active: t.is_active,
    lastSignInAt: lastSignIns[t.id] ?? null,
    classes: classesByTeacher.get(t.id) ?? [],
    courseCount: courseCount.get(t.id) ?? 0,
  }));

  return (
    <StaffAccountsBoard
      title="강사 관리"
      description="강사 계정과 담당 반을 관리합니다."
      roleLabel="강사"
      apiBasePath="/api/admin/teachers"
      users={rows}
      allowUsernameEdit={false}
      classesHref="/admin/classes"
      note="강사를 삭제하면 담당 반·강좌는 '담당 없음'이 되고, 학생 기록은 그대로 남아요."
    />
  );
}
