import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AssignPanelAssignment,
  AssignPanelClass,
  AssignPanelStudent,
  VocabAssignPanelData,
} from "@/lib/vocab/assign-panel-types";
import { fetchByIdChunks } from "@/lib/vocab/fetch-all";
import type { VocabRole } from "@/lib/vocab/module-types";

function toStudent(
  s: { id: unknown; name: unknown; username: unknown },
  info: { ids: string[]; names: string[] } | undefined
): AssignPanelStudent {
  return {
    id: s.id as string,
    name: (s.name as string) || (s.username as string) || "—",
    username: (s.username as string | null) ?? null,
    classIds: info?.ids ?? [],
    classLabel: info?.names.length ? info.names.join(", ") : "반 없음",
  };
}

/** 배정할 수 있는 학생 — 관리자는 학원 전체, 강사는 담당 반 학생과 직접 만든 학생 */
async function loadAssignableStudents(
  supabase: SupabaseClient,
  role: VocabRole,
  userId: string,
  classRows: { id: string; name: string }[]
): Promise<AssignPanelStudent[]> {
  const classNameById = new Map(classRows.map((c) => [c.id, c.name]));
  const classIds = classRows.map((c) => c.id);

  const members = await fetchByIdChunks<{ student_id: string; class_id: string }>(
    classIds,
    (chunk, from, to) =>
      supabase
        .from("class_students")
        .select("student_id, class_id")
        .in("class_id", chunk)
        .range(from, to)
  );

  const classInfoByStudent = new Map<string, { ids: string[]; names: string[] }>();
  for (const row of members) {
    const entry = classInfoByStudent.get(row.student_id) ?? { ids: [], names: [] };
    if (!entry.ids.includes(row.class_id)) {
      entry.ids.push(row.class_id);
      entry.names.push(classNameById.get(row.class_id) ?? "—");
    }
    classInfoByStudent.set(row.student_id, entry);
  }

  if (role === "admin") {
    const { data: students } = await supabase
      .from("profiles")
      .select("id, name, username")
      .eq("role", "student")
      .eq("is_active", true)
      .order("name");
    return (students ?? []).map((s) =>
      toStudent(s, classInfoByStudent.get(s.id as string))
    );
  }

  const { data: createdStudents } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "student")
    .eq("is_active", true)
    .eq("created_by", userId);

  const ids = new Set<string>(classInfoByStudent.keys());
  for (const s of createdStudents ?? []) ids.add(s.id as string);
  if (ids.size === 0) return [];

  const profiles = await fetchByIdChunks<{ id: string; name: string; username: string | null }>(
    [...ids],
    (chunk, from, to) =>
      supabase
        .from("profiles")
        .select("id, name, username")
        .in("id", chunk)
        .eq("is_active", true)
        .range(from, to)
  );
  return profiles
    .map((s) => toStudent(s, classInfoByStudent.get(s.id)))
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

type AssignmentJoinRow = {
  id: string;
  set_id: string;
  student_id: string | null;
  class_id: string | null;
  created_at: string;
  student: { name: string | null } | { name: string | null }[] | null;
  class: { name: string | null } | { name: string | null }[] | null;
};

function one<T>(v: T | T[] | null): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

/** 배정 창 자료 — 고른 세트들의 지금 배정 + 고를 수 있는 반·학생 */
export async function loadVocabAssignPanelData(
  supabase: SupabaseClient,
  role: VocabRole,
  userId: string,
  setIds: string[]
): Promise<VocabAssignPanelData> {
  const ids = [...new Set(setIds)].filter(Boolean);
  if (ids.length === 0) {
    return { sets: [], classes: [], students: [], assignments: [] };
  }

  let classesQuery = supabase
    .from("classes")
    .select("id, name")
    .eq("is_active", true)
    .order("name");
  if (role === "teacher") classesQuery = classesQuery.eq("teacher_id", userId);

  const [setRows, classesRes, assignmentRows] = await Promise.all([
    fetchByIdChunks<{ id: string; title: string }>(ids, (chunk, from, to) =>
      supabase.from("vocab_sets").select("id, title").in("id", chunk).range(from, to)
    ),
    classesQuery,
    fetchByIdChunks<AssignmentJoinRow>(ids, (chunk, from, to) =>
      supabase
        .from("vocab_assignments")
        .select(
          "id, set_id, student_id, class_id, created_at, student:profiles!vocab_assignments_student_id_fkey(name), class:classes(name)"
        )
        .in("set_id", chunk)
        .order("created_at", { ascending: false })
        .range(from, to)
    ),
  ]);

  const classRows = (classesRes.data ?? []) as { id: string; name: string }[];
  const students = await loadAssignableStudents(supabase, role, userId, classRows);

  const studentIdsByClass = new Map<string, string[]>();
  for (const s of students) {
    for (const cid of s.classIds) {
      const list = studentIdsByClass.get(cid) ?? [];
      list.push(s.id);
      studentIdsByClass.set(cid, list);
    }
  }

  const classes: AssignPanelClass[] = classRows.map((c) => ({
    id: c.id,
    name: c.name,
    studentIds: studentIdsByClass.get(c.id) ?? [],
  }));

  const order = new Map(ids.map((id, i) => [id, i]));
  const sets = setRows.sort(
    (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)
  );

  const assignments: AssignPanelAssignment[] = assignmentRows.map((row) => ({
    id: row.id,
    set_id: row.set_id,
    student_id: row.student_id,
    class_id: row.class_id,
    created_at: row.created_at,
    student_name: one(row.student)?.name ?? "—",
    class_name: one(row.class)?.name ?? null,
  }));

  return { sets, classes, students, assignments };
}
