import type { SupabaseClient } from "@supabase/supabase-js";
import { getTodayIsoKorea } from "@/lib/date/korea-today";
import { formatDaysOfWeek } from "@/lib/listening/schedule/days-of-week";
import { loadSchedulePauses } from "@/lib/listening/schedule/load-pauses";
import {
  pauseStateOn,
  type SchedulePauseView,
} from "@/lib/listening/schedule/pauses";
import type { UserRole } from "@/types/database";

export interface ScheduleAssignmentListItem {
  id: string;
  title: string;
  targetType: "class" | "student";
  targetClassId: string | null;
  targetStudentId: string | null;
  targetLabel: string;
  setCount: number;
  setTitles: string[];
  setIds: string[];
  startDate: string;
  endDate: string | null;
  daysLabel: string;
  daysOfWeek: number[];
  questionsPerDay: number;
  requireDictationPass: boolean;
  dictationPassScore: number;
  isActive: boolean;
  createdAt: string;
  /** 과제 전체가 오늘 멈춰 있으면 멈춘 날·다시 시작하는 날·멈춘 사람 */
  pause: SchedulePauseView | null;
  /** 반 배정 안에서 오늘 따로 멈춘 학생 수 */
  pausedStudentCount: number;
}

async function teacherClassIds(
  admin: SupabaseClient,
  teacherId: string,
  academyId: string
): Promise<string[]> {
  const { data } = await admin
    .from("classes")
    .select("id")
    .eq("teacher_id", teacherId)
    .eq("academy_id", academyId)
    .eq("is_active", true);
  return (data ?? []).map((r) => r.id as string);
}

export async function listScheduleAssignments(
  admin: SupabaseClient,
  role: UserRole,
  viewerId: string,
  academyId: string
): Promise<ScheduleAssignmentListItem[]> {
  let query = admin
    .from("listening_schedule_assignments")
    .select(
      "id, title, target_type, target_class_id, target_student_id, start_date, end_date, days_of_week, questions_per_day, require_dictation_pass, dictation_pass_score, is_active, created_at, updated_at, assigned_by, academy_id"
    )
    .eq("academy_id", academyId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (role === "teacher") {
    const classIds = await teacherClassIds(admin, viewerId, academyId);
    if (classIds.length === 0) {
      query = query.eq("assigned_by", viewerId);
    } else {
      query = query.or(
        `assigned_by.eq.${viewerId},target_class_id.in.(${classIds.join(",")})`
      );
    }
  }

  const { data: rows } = await query;
  if (!rows?.length) return [];

  const classIds = [
    ...new Set(
      rows
        .map((r) => r.target_class_id as string | null)
        .filter((id): id is string => Boolean(id))
    ),
  ];
  const studentIds = [
    ...new Set(
      rows
        .map((r) => r.target_student_id as string | null)
        .filter((id): id is string => Boolean(id))
    ),
  ];
  const assignmentIds = rows.map((r) => r.id as string);

  const [{ data: classes }, { data: students }, { data: setLinks }, pauseMap] =
    await Promise.all([
      classIds.length
        ? admin.from("classes").select("id, name").in("id", classIds)
        : Promise.resolve({ data: [] as { id: string; name: string }[] }),
      studentIds.length
        ? admin.from("profiles").select("id, name").in("id", studentIds)
        : Promise.resolve({ data: [] as { id: string; name: string }[] }),
      admin
        .from("listening_schedule_assignment_sets")
        .select("assignment_id, set_id, order_index, set:listening_sets(title)")
        .in("assignment_id", assignmentIds)
        .order("order_index"),
      loadSchedulePauses(admin, assignmentIds),
    ]);

  // 오늘 걸린 멈춤 — 과제 전체 / 학생별
  const todayIso = getTodayIsoKorea();
  const wholePauseById = new Map<string, NonNullable<ReturnType<typeof pauseStateOn>>>();
  const pausedStudentCountById = new Map<string, number>();
  for (const [aid, ranges] of pauseMap) {
    const whole = pauseStateOn(
      ranges.filter((r) => r.studentId === null),
      todayIso
    );
    if (whole) wholePauseById.set(aid, whole);
    const pausedStudents = new Set(
      ranges
        .filter(
          (r) =>
            r.studentId !== null &&
            r.startDate <= todayIso &&
            (r.endDate === null || todayIso < r.endDate)
        )
        .map((r) => r.studentId as string)
    );
    if (pausedStudents.size > 0) pausedStudentCountById.set(aid, pausedStudents.size);
  }
  const pauserIds = [
    ...new Set(
      [...wholePauseById.values()]
        .map((p) => p.pausedBy)
        .filter((id): id is string => Boolean(id))
    ),
  ];
  const { data: pausers } = pauserIds.length
    ? await admin.from("profiles").select("id, name").in("id", pauserIds)
    : { data: [] as { id: string; name: string }[] };
  const pauserNameById = new Map(
    (pausers ?? []).map((p) => [p.id as string, p.name as string])
  );

  const classNameById = new Map(
    (classes ?? []).map((c) => [c.id as string, c.name as string])
  );
  const studentNameById = new Map(
    (students ?? []).map((s) => [s.id as string, s.name as string])
  );

  const setsByAssignment = new Map<
    string,
    { setIds: string[]; setTitles: string[] }
  >();
  for (const link of setLinks ?? []) {
    const aid = link.assignment_id as string;
    const set = link.set as { title?: string } | { title?: string }[] | null;
    const title = Array.isArray(set)
      ? (set[0]?.title ?? "세트")
      : (set?.title ?? "세트");
    const bucket = setsByAssignment.get(aid) ?? { setIds: [], setTitles: [] };
    bucket.setIds.push(link.set_id as string);
    bucket.setTitles.push(title);
    setsByAssignment.set(aid, bucket);
  }

  return rows.map((row) => {
    const targetType = row.target_type as "class" | "student";
    let targetLabel = "";
    if (targetType === "class" && row.target_class_id) {
      targetLabel = classNameById.get(row.target_class_id as string) ?? "—";
    } else if (row.target_student_id) {
      targetLabel = studentNameById.get(row.target_student_id as string) ?? "—";
    }

    const sets = setsByAssignment.get(row.id as string) ?? {
      setIds: [],
      setTitles: [],
    };

    return {
      id: row.id as string,
      title: row.title as string,
      targetType,
      targetClassId: (row.target_class_id as string | null) ?? null,
      targetStudentId: (row.target_student_id as string | null) ?? null,
      targetLabel,
      setCount: sets.setIds.length,
      setTitles: sets.setTitles,
      setIds: sets.setIds,
      startDate: row.start_date as string,
      endDate: (row.end_date as string | null) ?? null,
      daysLabel: formatDaysOfWeek((row.days_of_week as number[]) ?? []),
      daysOfWeek: ((row.days_of_week as number[]) ?? []).slice(),
      questionsPerDay: row.questions_per_day as number,
      requireDictationPass: (row.require_dictation_pass as boolean) !== false,
      dictationPassScore: (row.dictation_pass_score as number | null) ?? 80,
      isActive: row.is_active as boolean,
      createdAt: row.created_at as string,
      pause: pauseViewOf(
        row.is_active as boolean,
        (row.updated_at as string | null) ?? null,
        wholePauseById.get(row.id as string) ?? null,
        pauserNameById
      ),
      pausedStudentCount: pausedStudentCountById.get(row.id as string) ?? 0,
    };
  });
}

function pauseViewOf(
  isActive: boolean,
  updatedAt: string | null,
  state: ReturnType<typeof pauseStateOn>,
  pauserNameById: Map<string, string>
): SchedulePauseView | null {
  if (state) {
    return {
      ...state,
      pausedByName: state.pausedBy ? (pauserNameById.get(state.pausedBy) ?? null) : null,
    };
  }
  // 예전 「잠시 쉬기」로 멈춘 과제 — 멈춘 날은 마지막으로 고친 날로 본다
  if (!isActive) {
    return {
      since: updatedAt ? getTodayIsoKorea(new Date(updatedAt)) : getTodayIsoKorea(),
      until: null,
      pausedBy: null,
      pausedAt: updatedAt,
      pausedByName: null,
      legacy: true,
    };
  }
  return null;
}

export async function teacherCanManageAssignment(
  admin: SupabaseClient,
  role: UserRole,
  viewerId: string,
  assignmentId: string,
  academyId: string
): Promise<boolean> {
  const { data } = await admin
    .from("listening_schedule_assignments")
    .select("assigned_by, target_class_id, academy_id")
    .eq("id", assignmentId)
    .maybeSingle();

  if (!data) return false;
  if (!data.academy_id || data.academy_id !== academyId) return false;

  if (role === "admin") return true;
  if (data.assigned_by === viewerId) return true;

  if (data.target_class_id) {
    const classIds = await teacherClassIds(admin, viewerId, academyId);
    return classIds.includes(data.target_class_id as string);
  }

  return false;
}
