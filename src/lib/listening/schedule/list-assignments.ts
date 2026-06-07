import type { SupabaseClient } from "@supabase/supabase-js";
import { formatDaysOfWeek } from "@/lib/listening/schedule/days-of-week";
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
  questionsPerDay: number;
  isActive: boolean;
  createdAt: string;
}

async function teacherClassIds(
  admin: SupabaseClient,
  teacherId: string
): Promise<string[]> {
  const { data } = await admin
    .from("classes")
    .select("id")
    .eq("teacher_id", teacherId)
    .eq("is_active", true);
  return (data ?? []).map((r) => r.id as string);
}

export async function listScheduleAssignments(
  admin: SupabaseClient,
  role: UserRole,
  viewerId: string
): Promise<ScheduleAssignmentListItem[]> {
  let query = admin
    .from("listening_schedule_assignments")
    .select(
      "id, title, target_type, target_class_id, target_student_id, start_date, end_date, days_of_week, questions_per_day, is_active, created_at, assigned_by"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (role === "teacher") {
    const classIds = await teacherClassIds(admin, viewerId);
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

  const [{ data: classes }, { data: students }, { data: setLinks }] =
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
    ]);

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
      questionsPerDay: row.questions_per_day as number,
      isActive: row.is_active as boolean,
      createdAt: row.created_at as string,
    };
  });
}

export async function teacherCanManageAssignment(
  admin: SupabaseClient,
  role: UserRole,
  viewerId: string,
  assignmentId: string
): Promise<boolean> {
  if (role === "admin") return true;

  const { data } = await admin
    .from("listening_schedule_assignments")
    .select("assigned_by, target_class_id")
    .eq("id", assignmentId)
    .maybeSingle();

  if (!data) return false;
  if (data.assigned_by === viewerId) return true;

  if (data.target_class_id) {
    const classIds = await teacherClassIds(admin, viewerId);
    return classIds.includes(data.target_class_id as string);
  }

  return false;
}
