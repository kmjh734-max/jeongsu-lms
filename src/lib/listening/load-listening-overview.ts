import type { SupabaseClient } from "@supabase/supabase-js";
import type { ScheduleAssignmentListItem } from "@/lib/listening/schedule/list-assignments";
import type { UserRole } from "@/types/database";

/** 목록·배정 화면에서 쓰는 읽기 전용 요약 (문항 수, 음성 준비, 배정 대상, 진행) */

const PAGE_SIZE = 1000;
const ID_CHUNK = 50;

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export interface ListeningSetQuestionStats {
  questionCount: number;
  /** audio_url(학생 재생용 mp3)이 있는 문항 수 */
  audioReadyCount: number;
}

/** 세트별 문항 수 · 음성 준비된 문항 수 (세트 50개씩 묶어 1000행 단위로 읽음) */
export async function loadListeningSetQuestionStats(
  supabase: SupabaseClient,
  setIds: string[]
): Promise<Record<string, ListeningSetQuestionStats>> {
  const out: Record<string, ListeningSetQuestionStats> = {};
  for (const id of setIds) out[id] = { questionCount: 0, audioReadyCount: 0 };
  if (setIds.length === 0) return out;

  await Promise.all(
    chunk(setIds, ID_CHUNK).map(async (ids) => {
      for (let from = 0; ; from += PAGE_SIZE) {
        const { data, error } = await supabase
          .from("listening_questions")
          .select("id, set_id, audio_url")
          .in("set_id", ids)
          .order("id", { ascending: true })
          .range(from, from + PAGE_SIZE - 1);
        if (error || !data) break;
        for (const row of data) {
          const stats = out[row.set_id as string];
          if (!stats) continue;
          stats.questionCount += 1;
          const url = row.audio_url as string | null;
          if (typeof url === "string" && url.trim()) stats.audioReadyCount += 1;
        }
        if (data.length < PAGE_SIZE) break;
      }
    })
  );

  return out;
}

/** 진행 중인 스케줄 배정의 대상 이름을 세트별로 모은다 */
export function activeScheduleTargetsBySet(
  assignments: ScheduleAssignmentListItem[]
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const a of assignments) {
    if (!a.isActive || !a.targetLabel) continue;
    for (const setId of a.setIds) {
      const list = out[setId] ?? [];
      if (!list.includes(a.targetLabel)) list.push(a.targetLabel);
      out[setId] = list;
    }
  }
  return out;
}

async function teacherActiveClassIds(
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

/** 탭 옆 숫자: 볼 수 있는 세트 수, 진행 중인 배정 수 */
export async function loadListeningModuleCounts(
  supabase: SupabaseClient,
  admin: SupabaseClient,
  role: UserRole,
  viewerId: string,
  academyId: string | null
): Promise<{ setCount: number; activeAssignmentCount: number }> {
  let setsQuery = supabase
    .from("listening_sets")
    .select("id", { count: "exact", head: true });
  if (role === "teacher") {
    setsQuery = setsQuery.or(
      `teacher_id.eq.${viewerId},description.ilike.%curriculum_locked%`
    );
  }

  const assignmentCount = async (): Promise<number> => {
    if (!academyId) return 0;
    let query = admin
      .from("listening_schedule_assignments")
      .select("id", { count: "exact", head: true })
      .eq("academy_id", academyId)
      .eq("is_active", true);
    if (role === "teacher") {
      const classIds = await teacherActiveClassIds(admin, viewerId, academyId);
      query =
        classIds.length === 0
          ? query.eq("assigned_by", viewerId)
          : query.or(
              `assigned_by.eq.${viewerId},target_class_id.in.(${classIds.join(",")})`
            );
    }
    const { count } = await query;
    return count ?? 0;
  };

  const [{ count: setCount }, activeAssignmentCount] = await Promise.all([
    setsQuery,
    assignmentCount(),
  ]);

  return { setCount: setCount ?? 0, activeAssignmentCount };
}

export interface ScheduleAssignmentProgress {
  /** 오늘까지 과제가 나간 날 수 */
  studyDays: number;
  /** 오늘까지 나간 일일 과제 수 (학생 × 날) */
  dueTasks: number;
  completedTasks: number;
}

/** 배정별 진행: 오늘까지 나간 일일 과제 중 끝낸 비율 */
export async function loadScheduleAssignmentProgress(
  admin: SupabaseClient,
  assignmentIds: string[],
  todayIso: string
): Promise<Record<string, ScheduleAssignmentProgress>> {
  const out: Record<string, ScheduleAssignmentProgress> = {};
  const dates = new Map<string, Set<string>>();
  for (const id of assignmentIds) {
    out[id] = { studyDays: 0, dueTasks: 0, completedTasks: 0 };
    dates.set(id, new Set());
  }
  if (assignmentIds.length === 0) return out;

  await Promise.all(
    chunk(assignmentIds, ID_CHUNK).map(async (ids) => {
      // 한 번에 너무 많이 읽지 않도록 30쪽(3만 행)에서 멈춘다
      for (let page = 0; page < 30; page++) {
        const from = page * PAGE_SIZE;
        const { data, error } = await admin
          .from("listening_daily_tasks")
          .select("id, assignment_id, task_date, status")
          .in("assignment_id", ids)
          .lte("task_date", todayIso)
          .order("id", { ascending: true })
          .range(from, from + PAGE_SIZE - 1);
        if (error || !data) break;
        for (const row of data) {
          const aid = row.assignment_id as string;
          const bucket = out[aid];
          if (!bucket) continue;
          bucket.dueTasks += 1;
          if (row.status === "completed") bucket.completedTasks += 1;
          dates.get(aid)?.add(row.task_date as string);
        }
        if (data.length < PAGE_SIZE) break;
      }
    })
  );

  for (const [id, set] of dates) {
    out[id]!.studyDays = set.size;
  }
  return out;
}

/** 반별 학생 수 */
export async function loadClassStudentCounts(
  admin: SupabaseClient,
  classIds: string[]
): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const id of classIds) out[id] = 0;
  if (classIds.length === 0) return out;

  await Promise.all(
    chunk(classIds, ID_CHUNK).map(async (ids) => {
      for (let from = 0; ; from += PAGE_SIZE) {
        const { data, error } = await admin
          .from("class_students")
          .select("class_id, student_id")
          .in("class_id", ids)
          .order("student_id", { ascending: true })
          .range(from, from + PAGE_SIZE - 1);
        if (error || !data) break;
        for (const row of data) {
          const cid = row.class_id as string;
          out[cid] = (out[cid] ?? 0) + 1;
        }
        if (data.length < PAGE_SIZE) break;
      }
    })
  );
  return out;
}

/** 학생별 소속 반 이름 (여러 반이면 쉼표로) */
export async function loadStudentClassNames(
  admin: SupabaseClient,
  studentIds: string[]
): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  if (studentIds.length === 0) return out;

  const { data } = await admin
    .from("class_students")
    .select("student_id, class:classes(name)")
    .in("student_id", studentIds.slice(0, 200));

  const names = new Map<string, string[]>();
  for (const row of data ?? []) {
    const sid = row.student_id as string;
    const rel = row.class as { name?: string } | { name?: string }[] | null;
    const name = Array.isArray(rel) ? rel[0]?.name : rel?.name;
    if (!name) continue;
    const list = names.get(sid) ?? [];
    if (!list.includes(name)) list.push(name);
    names.set(sid, list);
  }
  for (const [sid, list] of names) out[sid] = list.join(", ");
  return out;
}
