import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchInChunks } from "@/lib/classes/fetch-chunks";
import { addDaysIso, laterOf, weekdayDatesIso } from "@/lib/classes/week";
import { formatDaysOfWeek } from "@/lib/listening/schedule/days-of-week";
import {
  stage3Completed,
  stage4AttemptCount,
  stage4Passed,
} from "@/lib/vocab/stage-progress-fields";
import type { VocabStageProgress } from "@/types/database";

/** 듣기 하루: 끝냄 · 일부 · 안 함 · (앞으로/과제 없음) */
export type DayMark = "done" | "partial" | "missed" | "none";
/** 단어 단계: 끝냄 · 지금 단계 · 시험 불합격 · 아직 */
export type StageMark = "done" | "current" | "failed" | "none";

export interface ClassMember {
  id: string;
  studentId: string;
  name: string;
  username: string | null;
}

export interface ClassStudentStat extends ClassMember {
  /** 이번 주 월~금 */
  listeningWeek: DayMark[];
  vocab: { title: string; marks: StageMark[] } | null;
  video: { completed: number; total: number; percent: number } | null;
  lastStudiedAt: string | null;
}

export interface ClassListeningSchedule {
  id: string;
  title: string;
  daysLabel: string;
  startDate: string;
  endDate: string | null;
}

type TaskRow = {
  student_id: string;
  task_date: string;
  status: string;
  completed_count: number | null;
  total_count: number | null;
  completed_at: string | null;
};

type StageRow = Pick<
  VocabStageProgress,
  | "student_id"
  | "set_id"
  | "updated_at"
  | "stage1_completed"
  | "stage2_completed"
  | "stage3_completed"
  | "stage3_passed"
  | "stage3_attempt_count"
  | "stage4_passed"
  | "stage4_attempt_count"
>;

function dayMark(tasks: TaskRow[], dateIso: string, todayIso: string): DayMark {
  if (tasks.length === 0 || dateIso > todayIso) return "none";
  const allDone = tasks.every((t) => t.status === "completed");
  if (allDone) return "done";
  const anyProgress = tasks.some(
    (t) => t.status === "completed" || t.status === "in_progress" || (t.completed_count ?? 0) > 0
  );
  if (anyProgress) return "partial";
  // 오늘은 아직 끝나지 않았으니 비워 둔다
  return dateIso === todayIso ? "none" : "missed";
}

function stageMarks(p: StageRow | undefined): StageMark[] {
  if (!p) return ["none", "none", "none", "none"];
  const full = p as VocabStageProgress;
  const passed = stage4Passed(full);
  const failed = !passed && stage4AttemptCount(full) > 0;
  const marks: StageMark[] = [
    p.stage1_completed ? "done" : "none",
    p.stage2_completed ? "done" : "none",
    stage3Completed(full) ? "done" : "none",
    passed ? "done" : failed ? "failed" : "none",
  ];
  if (!passed && !failed) {
    const i = marks.indexOf("none");
    if (i >= 0) marks[i] = "current";
  }
  return marks;
}

/**
 * 반 학생 전원의 이번 주 듣기 · 최근 단어장 단계 · 영상 진도 · 마지막 학습을
 * 학생 수와 상관없이 몇 번의 묶음 조회로 읽는다.
 */
export async function loadClassStudentStats(
  supabase: SupabaseClient,
  admin: SupabaseClient,
  params: {
    classId: string;
    members: ClassMember[];
    courseIds: string[];
    todayIso: string;
  }
): Promise<ClassStudentStat[]> {
  const { classId, members, courseIds, todayIso } = params;
  const studentIds = members.map((m) => m.studentId);
  if (studentIds.length === 0) return [];

  const week = weekdayDatesIso(todayIso);
  const activitySince = addDaysIso(todayIso, -45);
  const taskFrom = week[0]! < activitySince ? week[0]! : activitySince;
  const taskTo = week[4]! > todayIso ? week[4]! : todayIso;

  const [tasks, directVocab, classVocab, stages, lessons, progress] = await Promise.all([
    fetchInChunks<TaskRow>(
      studentIds,
      (ids, from, to) =>
        admin
          .from("listening_daily_tasks")
          .select("student_id, task_date, status, completed_count, total_count, completed_at")
          .in("student_id", ids)
          .gte("task_date", taskFrom)
          .lte("task_date", taskTo)
          .order("id")
          .range(from, to),
      50
    ),
    fetchInChunks<{
      student_id: string;
      set_id: string;
      created_at: string;
      set: { title: string } | { title: string }[] | null;
    }>(studentIds, (ids, from, to) =>
      supabase
        .from("vocab_assignments")
        .select("student_id, set_id, created_at, set:vocab_sets(title)")
        .in("student_id", ids)
        .order("id")
        .range(from, to)
    ),
    supabase
      .from("vocab_assignments")
      .select("set_id, created_at, set:vocab_sets(title)")
      .eq("class_id", classId)
      .is("student_id", null)
      .order("created_at", { ascending: false })
      .limit(50),
    fetchInChunks<StageRow>(
      studentIds,
      (ids, from, to) =>
        supabase
          .from("vocab_stage_progress")
          .select(
            "student_id, set_id, updated_at, stage1_completed, stage2_completed, stage3_completed, stage3_passed, stage3_attempt_count, stage4_passed, stage4_attempt_count"
          )
          .in("student_id", ids)
          .order("id")
          .range(from, to),
      50
    ),
    fetchInChunks<{ id: string; course_id: string }>(courseIds, (ids, from, to) =>
      supabase
        .from("lessons")
        .select("id, course_id")
        .in("course_id", ids)
        .eq("is_published", true)
        .order("id")
        .range(from, to)
    ),
    fetchInChunks<{
      student_id: string;
      lesson_id: string;
      is_completed: boolean;
      last_watched_at: string | null;
      completed_at: string | null;
    }>(
      studentIds,
      (ids, from, to) =>
        supabase
          .from("lesson_progress")
          .select("student_id, lesson_id, is_completed, last_watched_at, completed_at")
          .in("student_id", ids)
          .order("id")
          .range(from, to),
      50
    ),
  ]);

  // 듣기: 학생·날짜별 과제 묶기 + 최근 학습일
  const tasksByKey = new Map<string, TaskRow[]>();
  const lastByStudent = new Map<string, string | null>();
  const bump = (sid: string, when: string | null) => {
    if (!when) return;
    lastByStudent.set(sid, laterOf(lastByStudent.get(sid) ?? null, when));
  };
  for (const t of tasks) {
    const key = `${t.student_id}:${t.task_date}`;
    const list = tasksByKey.get(key) ?? [];
    list.push(t);
    tasksByKey.set(key, list);
    if (t.task_date <= todayIso && (t.completed_count ?? 0) > 0) {
      bump(t.student_id, t.completed_at ?? t.task_date);
    }
  }

  // 단어: 학생마다 가장 최근에 배정된 단어장
  type Assigned = { setId: string; title: string; createdAt: string };
  const classWide: Assigned[] = ((classVocab.data ?? []) as {
    set_id: string;
    created_at: string;
    set: { title: string } | { title: string }[] | null;
  }[]).map((r) => ({
    setId: r.set_id,
    title: (Array.isArray(r.set) ? r.set[0]?.title : r.set?.title) ?? "—",
    createdAt: r.created_at,
  }));
  const latestClassWide = classWide[0] ?? null;
  const latestVocab = new Map<string, Assigned>();
  for (const r of directVocab) {
    const current = latestVocab.get(r.student_id);
    if (!current || r.created_at > current.createdAt) {
      latestVocab.set(r.student_id, {
        setId: r.set_id,
        title: (Array.isArray(r.set) ? r.set[0]?.title : r.set?.title) ?? "—",
        createdAt: r.created_at,
      });
    }
  }
  const stageByKey = new Map<string, StageRow>();
  for (const s of stages) {
    stageByKey.set(`${s.student_id}:${s.set_id}`, s);
    bump(s.student_id, s.updated_at ?? null);
  }

  // 영상: 반 강좌의 공개 영상 중 끝낸 수
  const classLessonIds = new Set(lessons.map((l) => l.id));
  const doneInClass = new Map<string, number>();
  for (const p of progress) {
    bump(p.student_id, laterOf(p.last_watched_at, p.completed_at));
    if (p.is_completed && classLessonIds.has(p.lesson_id)) {
      doneInClass.set(p.student_id, (doneInClass.get(p.student_id) ?? 0) + 1);
    }
  }
  const totalLessons = classLessonIds.size;

  return members.map((m) => {
    const direct = latestVocab.get(m.studentId) ?? null;
    const vocabSet =
      direct && latestClassWide
        ? direct.createdAt >= latestClassWide.createdAt
          ? direct
          : latestClassWide
        : (direct ?? latestClassWide);
    const completed = doneInClass.get(m.studentId) ?? 0;
    return {
      ...m,
      listeningWeek: week.map((d) =>
        dayMark(tasksByKey.get(`${m.studentId}:${d}`) ?? [], d, todayIso)
      ),
      vocab: vocabSet
        ? {
            title: vocabSet.title,
            marks: stageMarks(stageByKey.get(`${m.studentId}:${vocabSet.setId}`)),
          }
        : null,
      video:
        totalLessons > 0
          ? {
              completed,
              total: totalLessons,
              percent: Math.round((completed / totalLessons) * 100),
            }
          : null,
      lastStudiedAt: lastByStudent.get(m.studentId) ?? null,
    };
  });
}

/** 이 반에 걸린 진행 중 듣기 스케줄 (읽기 전용 안내용) */
export async function loadClassListeningSchedules(
  admin: SupabaseClient,
  classId: string,
  todayIso: string
): Promise<ClassListeningSchedule[]> {
  const { data } = await admin
    .from("listening_schedule_assignments")
    .select("id, title, days_of_week, start_date, end_date")
    .eq("target_class_id", classId)
    .eq("is_active", true)
    .order("start_date", { ascending: false });

  return ((data ?? []) as {
    id: string;
    title: string;
    days_of_week: number[] | null;
    start_date: string;
    end_date: string | null;
  }[])
    .filter((r) => !r.end_date || r.end_date >= todayIso)
    .map((r) => {
      const days = r.days_of_week ?? [];
      return {
        id: r.id,
        title: r.title,
        daysLabel: [1, 2, 3, 4, 5].every((d) => days.includes(d))
          ? "매일"
          : formatDaysOfWeek(days),
        startDate: r.start_date,
        endDate: r.end_date,
      };
    });
}

/** 탭 숫자용: 이 반에 배정된 단어장 수 */
export async function countClassVocabSets(
  supabase: SupabaseClient,
  classId: string
): Promise<number> {
  const { data } = await supabase
    .from("vocab_assignments")
    .select("set_id")
    .eq("class_id", classId)
    .limit(2000);
  return new Set((data ?? []).map((r) => r.set_id as string)).size;
}
