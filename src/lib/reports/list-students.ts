import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReportClassOption, ReportStudentOption } from "@/lib/reports/types";
import type { UserRole } from "@/types/database";

function matchesSearch(
  student: ReportStudentOption,
  nameQuery: string,
  loginQuery: string
): boolean {
  const nameQ = nameQuery.trim().toLowerCase();
  const loginQ = loginQuery.trim().toLowerCase();

  if (nameQ && !student.name.toLowerCase().includes(nameQ)) return false;
  if (loginQ) {
    const login = (student.loginId ?? "").toLowerCase();
    if (!login.includes(loginQ)) return false;
  }
  return true;
}

export async function listReportClasses(
  supabase: SupabaseClient,
  role: UserRole,
  viewerId: string
): Promise<ReportClassOption[]> {
  let query = supabase
    .from("classes")
    .select("id, name, teacher_id")
    .order("name");

  if (role === "teacher") {
    query = query.eq("teacher_id", viewerId);
  }

  const { data } = await query;
  const rows = data ?? [];
  const names = await teacherNamesByIdOf(
    supabase,
    rows.map((c) => c.teacher_id as string | null)
  );
  return rows.map((c) => ({
    id: c.id as string,
    name: c.name as string,
    teacherId: (c.teacher_id as string | null) ?? null,
    teacherName: names.get((c.teacher_id as string | null) ?? "") ?? null,
  }));
}

/** 담당 선생님 id → 이름. 담당이 없는 반이 많아 빈 값은 걸러 낸다. */
async function teacherNamesByIdOf(
  supabase: SupabaseClient,
  ids: (string | null)[]
): Promise<Map<string, string>> {
  const want = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  if (want.length === 0) return new Map();
  const { data } = await supabase.from("profiles").select("id, name").in("id", want);
  return new Map(
    (data ?? []).map((p) => [p.id as string, (p.name as string) || "—"])
  );
}

export async function listReportStudents(
  supabase: SupabaseClient,
  role: UserRole,
  viewerId: string,
  filters: {
    classId?: string;
    nameQuery?: string;
    loginQuery?: string;
  }
): Promise<ReportStudentOption[]> {
  const classId = filters.classId?.trim();
  const nameQuery = filters.nameQuery ?? "";
  const loginQuery = filters.loginQuery ?? "";

  let studentIds: string[] | null = null;

  if (classId) {
    const { data: classStudents } = await supabase
      .from("class_students")
      .select("student_id")
      .eq("class_id", classId);

    studentIds = (classStudents ?? []).map((r) => r.student_id as string);
    if (studentIds.length === 0) return [];
  }

  const profileQuery = supabase
    .from("profiles")
    .select("id, name, username")
    .eq("role", "student")
    .eq("is_active", true)
    .order("name");

  if (role === "teacher") {
    const [{ data: createdStudents }, { data: teacherClasses }] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("id")
          .eq("role", "student")
          .eq("created_by", viewerId),
        supabase.from("classes").select("id").eq("teacher_id", viewerId),
      ]);

    const allowed = new Set<string>(
      (createdStudents ?? []).map((s) => s.id as string)
    );

    const classIds = (teacherClasses ?? []).map((c) => c.id as string);
    if (classIds.length > 0) {
      const { data: classStudents } = await supabase
        .from("class_students")
        .select("student_id")
        .in("class_id", classIds);
      for (const row of classStudents ?? []) {
        allowed.add(row.student_id as string);
      }
    }

    if (allowed.size === 0) return [];

    if (studentIds) {
      studentIds = studentIds.filter((id) => allowed.has(id));
      if (studentIds.length === 0) return [];
    } else {
      studentIds = [...allowed];
    }
  }

  const classLinksFor = (ids: string[]) =>
    supabase
      .from("class_students")
      .select("student_id, class:classes(name, teacher_id)")
      .in("student_id", ids);

  let profiles: { id: unknown; name: unknown; username: unknown }[] | null;
  let classLinks: { student_id: unknown; class: unknown }[] | null;
  if (studentIds) {
    // 학생 id 를 이미 알면 반 이름도 같이 읽는다 (아래에서 학생 id 로만 찾아 쓰므로 결과는 같다)
    const [profileRes, linkRes] = await Promise.all([
      profileQuery.in("id", studentIds),
      classLinksFor(studentIds),
    ]);
    profiles = profileRes.data;
    if (!profiles?.length) return [];
    classLinks = linkRes.data;
  } else {
    const profileRes = await profileQuery;
    profiles = profileRes.data;
    if (!profiles?.length) return [];
    const ids = profiles.map((p) => p.id as string);
    classLinks = (await classLinksFor(ids)).data;
  }

  type ClassRel = { name?: string; teacher_id?: string | null };
  const classesByStudent = new Map<string, string[]>();
  const teacherIdsByStudent = new Map<string, string[]>();
  for (const link of classLinks ?? []) {
    const studentId = link.student_id as string;
    const rel = link.class as ClassRel | ClassRel[] | null;
    const one = Array.isArray(rel) ? rel[0] : rel;
    if (!one?.name) continue;
    const list = classesByStudent.get(studentId) ?? [];
    list.push(one.name);
    classesByStudent.set(studentId, list);
    if (one.teacher_id) {
      const owned = teacherIdsByStudent.get(studentId) ?? [];
      owned.push(one.teacher_id);
      teacherIdsByStudent.set(studentId, owned);
    }
  }

  const teacherNames = await teacherNamesByIdOf(
    supabase,
    [...teacherIdsByStudent.values()].flat()
  );

  const options: ReportStudentOption[] = profiles.map((p) => ({
    id: p.id as string,
    name: (p.name as string) || "—",
    loginId: (p.username as string | null) ?? null,
    classNames: classesByStudent.get(p.id as string) ?? [],
    teacherNames: [
      ...new Set(
        (teacherIdsByStudent.get(p.id as string) ?? [])
          .map((id) => teacherNames.get(id))
          .filter((n): n is string => Boolean(n))
      ),
    ],
  }));

  return options.filter((s) => matchesSearch(s, nameQuery, loginQuery));
}
