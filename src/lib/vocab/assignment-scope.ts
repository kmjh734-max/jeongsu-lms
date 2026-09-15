import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAllPages, fetchByIdChunks } from "@/lib/vocab/fetch-all";

/**
 * 배정하는 사람의 범위.
 * - 관리자: 같은 학원 학생 전체
 * - 강사: 담당 반 학생 + 직접 등록한 학생
 */
export interface AssignerScope {
  id: string;
  role: string;
  academyId: string | null;
  /** 강사만 — 담당 반 */
  classIds: Set<string> | null;
  /** 강사만 — 담당 반 학생 + 직접 등록한 학생 */
  studentIds: Set<string> | null;
}

export async function loadAssignerScope(
  actorId: string,
  admin: SupabaseClient = createAdminClient()
): Promise<AssignerScope | null> {
  const { data: actor } = await admin
    .from("profiles")
    .select("id, role, academy_id")
    .eq("id", actorId)
    .maybeSingle();
  if (!actor) return null;

  const role = actor.role as string;
  const academyId = (actor.academy_id as string | null) ?? null;
  if (role !== "teacher") {
    return { id: actorId, role, academyId, classIds: null, studentIds: null };
  }

  const [classes, created] = await Promise.all([
    fetchAllPages<{ id: string }>((from, to) =>
      admin
        .from("classes")
        .select("id")
        .eq("teacher_id", actorId)
        .order("id")
        .range(from, to)
    ),
    fetchAllPages<{ id: string }>((from, to) =>
      admin
        .from("profiles")
        .select("id")
        .eq("role", "student")
        .eq("created_by", actorId)
        .order("id")
        .range(from, to)
    ),
  ]);
  const classIds = new Set(classes.map((c) => c.id));
  const members = await fetchByIdChunks<{ student_id: string }>(
    [...classIds],
    (chunk, from, to) =>
      admin
        .from("class_students")
        .select("student_id")
        .in("class_id", chunk)
        .order("id")
        .range(from, to)
  );
  const studentIds = new Set<string>(created.map((s) => s.id));
  for (const m of members) studentIds.add(m.student_id);

  return { id: actorId, role, academyId, classIds, studentIds };
}

export type ScopedAssignmentRow = {
  id: string;
  student_id: string | null;
  class_id: string | null;
  assigned_by?: string | null;
  setTeacherId?: string | null;
};

/**
 * 강사가 보고·해제할 수 있는 배정인가.
 * 본인이 배정했거나, 본인 단어장이거나, 본인 반·학생에게 걸린 배정만.
 * (학원 공용 교재에 다른 선생님이 건 배정은 건드리지 않는다)
 */
export function teacherCanManageAssignment(
  scope: AssignerScope,
  row: ScopedAssignmentRow
): boolean {
  if (scope.role !== "teacher") return true;
  if (row.assigned_by && row.assigned_by === scope.id) return true;
  if (row.setTeacherId && row.setTeacherId === scope.id) return true;
  if (row.class_id && scope.classIds?.has(row.class_id)) return true;
  if (!row.class_id && row.student_id && scope.studentIds?.has(row.student_id)) {
    return true;
  }
  return false;
}

/** 해제 요청된 배정 id 중 이 강사가 해제할 수 있는 것만 남긴다 */
export async function filterTeacherManageableAssignmentIds(
  supabase: SupabaseClient,
  teacherId: string,
  assignmentIds: string[]
): Promise<{ allowed: string[]; denied: number }> {
  const ids = [...new Set(assignmentIds.filter(Boolean))];
  if (ids.length === 0) return { allowed: [], denied: 0 };
  const scope = await loadAssignerScope(teacherId);
  if (!scope) return { allowed: [], denied: ids.length };

  const rows = await fetchByIdChunks<{
    id: string;
    student_id: string | null;
    class_id: string | null;
    assigned_by: string | null;
    set: { teacher_id: string | null } | { teacher_id: string | null }[] | null;
  }>(ids, (chunk, from, to) =>
    supabase
      .from("vocab_assignments")
      .select("id, student_id, class_id, assigned_by, set:vocab_sets(teacher_id)")
      .in("id", chunk)
      .order("id")
      .range(from, to)
  );

  const allowed: string[] = [];
  for (const row of rows) {
    const set = Array.isArray(row.set) ? (row.set[0] ?? null) : row.set;
    if (
      teacherCanManageAssignment(scope, {
        id: row.id,
        student_id: row.student_id,
        class_id: row.class_id,
        assigned_by: row.assigned_by,
        setTeacherId: set?.teacher_id ?? null,
      })
    ) {
      allowed.push(row.id);
    }
  }
  return { allowed, denied: ids.length - allowed.length };
}
