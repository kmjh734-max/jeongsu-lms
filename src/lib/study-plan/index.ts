import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 학습일정표 — 학생 한 명의 한 달 계획.
 * 엑셀 양식(정수학원 1:1 맞춤 PLAN)을 그대로 옮긴다: 주차 × 영역 × 수업 회차.
 */
export const DEFAULT_AREAS = ["영단어", "클래스카드", "문법", "독해", "듣기"];
export const WEEKS = [1, 2, 3, 4];

export type PlanEntry = { progress: string; homework: string; note: string };

/** 회차 출결 — 빈 문자열은 아직 적지 않음 */
export type Attendance = "" | "present" | "late" | "absent" | "makeup";
export const ATTENDANCE_LABELS: Record<Exclude<Attendance, "">, string> = {
  present: "출석",
  late: "지각",
  absent: "결석",
  makeup: "보강",
};
export type PlanRow = {
  id: string;
  week: number;
  area: string;
  textbook: string;
  orderIndex: number;
  entries: PlanEntry[];
};
export type StudyPlan = {
  id: string;
  studentId: string;
  year: number;
  month: number;
  sessionsPerWeek: number;
  teacherId: string | null;
  note: string;
  /** 주차별 수업 날짜: { "1": ["2026-09-01", …] } */
  sessionDates: Record<string, string[]>;
  /** 주차별 회차 출결: { "1": ["present", "absent", …] } */
  attendance: Record<string, Attendance[]>;
  rows: PlanRow[];
};

export const emptyEntry = (): PlanEntry => ({ progress: "", homework: "", note: "" });

export function fitEntries(entries: unknown, sessions: number): PlanEntry[] {
  const list = Array.isArray(entries) ? entries : [];
  return Array.from({ length: sessions }, (_, i) => {
    const e = (list[i] ?? {}) as Partial<PlanEntry>;
    return {
      progress: String(e.progress ?? ""),
      homework: String(e.homework ?? ""),
      note: String(e.note ?? ""),
    };
  });
}

/** 이 학생의 그 달 일정표. 없으면 null */
export async function loadStudyPlan(
  admin: SupabaseClient,
  studentId: string,
  year: number,
  month: number
): Promise<StudyPlan | null> {
  const { data: plan } = await admin
    .from("study_plans")
    .select("id, student_id, year, month, sessions_per_week, teacher_id, note, session_dates, attendance")
    .eq("student_id", studentId)
    .eq("year", year)
    .eq("month", month)
    .maybeSingle();
  if (!plan) return null;

  const { data: rows } = await admin
    .from("study_plan_rows")
    .select("id, week, area, textbook, order_index, entries")
    .eq("plan_id", plan.id)
    .order("week")
    .order("order_index");

  const sessions = Number(plan.sessions_per_week) || 3;
  return {
    id: plan.id as string,
    studentId: plan.student_id as string,
    year: Number(plan.year),
    month: Number(plan.month),
    sessionsPerWeek: sessions,
    teacherId: (plan.teacher_id as string | null) ?? null,
    note: String(plan.note ?? ""),
    sessionDates: (plan.session_dates ?? {}) as Record<string, string[]>,
    attendance: (plan.attendance ?? {}) as Record<string, Attendance[]>,
    rows: (rows ?? []).map((r) => ({
      id: r.id as string,
      week: Number(r.week),
      area: String(r.area ?? ""),
      textbook: String(r.textbook ?? ""),
      orderIndex: Number(r.order_index ?? 0),
      entries: fitEntries(r.entries, sessions),
    })),
  };
}

/** 지난달 것을 베껴 새 달 일정표를 만든다(교재명은 그대로, 진도·숙제는 비운다) */
export async function createStudyPlan(
  admin: SupabaseClient,
  input: {
    academyId: string;
    studentId: string;
    year: number;
    month: number;
    sessionsPerWeek: number;
    teacherId?: string | null;
    createdBy?: string | null;
    copyFrom?: { year: number; month: number } | null;
  }
): Promise<StudyPlan> {
  const { data: plan, error } = await admin
    .from("study_plans")
    .insert({
      academy_id: input.academyId,
      student_id: input.studentId,
      year: input.year,
      month: input.month,
      sessions_per_week: input.sessionsPerWeek,
      teacher_id: input.teacherId ?? null,
      created_by: input.createdBy ?? null,
    })
    .select("id")
    .single();
  if (error || !plan) throw new Error(error?.message ?? "일정표를 만들지 못했습니다.");

  const previous = input.copyFrom
    ? await loadStudyPlan(admin, input.studentId, input.copyFrom.year, input.copyFrom.month)
    : null;

  // 지난달 영역·교재명만 물려받는다
  const areas = previous
    ? [...new Map(previous.rows.filter((r) => r.week === 1).map((r) => [r.area, r.textbook])).entries()]
    : DEFAULT_AREAS.map((a) => [a, ""] as [string, string]);

  const rows = WEEKS.flatMap((week) =>
    areas.map(([area, textbook], i) => ({
      plan_id: plan.id,
      week,
      area,
      textbook,
      order_index: i,
      entries: Array.from({ length: input.sessionsPerWeek }, () => emptyEntry()),
    }))
  );
  if (rows.length > 0) await admin.from("study_plan_rows").insert(rows);

  return (await loadStudyPlan(admin, input.studentId, input.year, input.month))!;
}

/** 표 전체 저장 (행을 지웠다 다시 넣는다 — 영역을 더하거나 뺄 수 있다) */
export async function saveStudyPlanRows(
  admin: SupabaseClient,
  planId: string,
  sessionsPerWeek: number,
  rows: Array<Omit<PlanRow, "id">>,
  sessionDates?: Record<string, string[]>,
  attendance?: Record<string, Attendance[]>
): Promise<void> {
  await admin
    .from("study_plans")
    .update({
      sessions_per_week: sessionsPerWeek,
      ...(sessionDates ? { session_dates: sessionDates } : {}),
      ...(attendance ? { attendance } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", planId);
  await admin.from("study_plan_rows").delete().eq("plan_id", planId);
  if (rows.length === 0) return;
  await admin.from("study_plan_rows").insert(
    rows.map((r) => ({
      plan_id: planId,
      week: r.week,
      area: r.area,
      textbook: r.textbook,
      order_index: r.orderIndex,
      entries: fitEntries(r.entries, sessionsPerWeek),
    }))
  );
}

/** 학생이 가진 일정표 목록(최근 것부터) */
export async function listStudyPlans(
  admin: SupabaseClient,
  studentId: string
): Promise<Array<{ year: number; month: number }>> {
  const { data } = await admin
    .from("study_plans")
    .select("year, month")
    .eq("student_id", studentId)
    .order("year", { ascending: false })
    .order("month", { ascending: false })
    .limit(24);
  return (data ?? []).map((r) => ({ year: Number(r.year), month: Number(r.month) }));
}
