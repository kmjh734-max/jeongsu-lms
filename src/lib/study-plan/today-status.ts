import type { SupabaseClient } from "@supabase/supabase-js";
import { getKoreaDayUtcBounds, getTodayIsoKorea } from "@/lib/date/korea-today";
import {
  ensureStudentTodayAndMissedTasks,
  getStudentScheduleTodaySummaryReadOnly,
} from "@/lib/listening/schedule/today-summary";
import { fetchStudentVocabSummaries } from "@/lib/vocab/student-sets";
import { studentStageSteps } from "@/lib/vocab/stage-progress-fields";
import type { StudentVocabSetSummary } from "@/types/database";

/**
 * 학습일정표 머리에 붙는 「오늘 학습 현황」 — 학생이 오늘 단어·듣기·강좌를 실제로 했는지.
 *
 * 선생님 요청(2026-10-23): 일정표에서 오늘 숙제가 제대로 이행됐는지 학습 현황도 같이
 * 나오고, 안 했으면 카톡으로 알림을 보낼 수 있게 해 달라.
 *
 * 학생 홈의 「오늘 할 일」(src/lib/student/today.ts)과 같은 기준으로 세되, 그쪽은 학생
 * 본인 세션으로 읽어서 선생님 화면에서는 못 쓴다. 여기서는 관리자 클라이언트로 읽는다.
 */
export type TodayStudyKind = "listening" | "vocab" | "course";
export type TodayStudyState = "done" | "partial" | "missing" | "none";
export const TODAY_STUDY_KIND_LABELS: Record<TodayStudyKind, string> = {
  listening: "듣기",
  vocab: "단어",
  course: "강좌",
};

export interface TodayStudyItem {
  kind: TodayStudyKind;
  state: TodayStudyState;
  /** 무엇을 해야 하는지(또는 했는지) 한 줄 — "중3 20회 1~2번" */
  title: string;
  /** 얼마나 했는지 — "0/2문항 · 밀린 과제 3일" */
  detail: string;
}

export interface TodayStudyStatus {
  todayIso: string;
  items: TodayStudyItem[];
}

function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function inDay(ts: string | null | undefined, bounds: { start: string; end: string }): boolean {
  if (!ts) return false;
  const t = new Date(ts).toISOString();
  return t >= bounds.start && t <= bounds.end;
}

async function listeningItem(admin: SupabaseClient, studentId: string, todayIso: string): Promise<TodayStudyItem> {
  // 학생이 아직 듣기 화면을 안 열었으면 오늘 과제가 없을 수 있다 — 학생 화면과 같은 과제를 먼저 만든다
  await ensureStudentTodayAndMissedTasks(admin, studentId, todayIso).catch(() => undefined);
  const summary = await getStudentScheduleTodaySummaryReadOnly(admin, studentId, todayIso).catch(() => null);
  const task = summary?.todayTask ?? null;
  const missed = summary?.missedTasks.length ?? 0;
  const missedNote = missed > 0 ? ` · 밀린 과제 ${missed}일` : "";

  if (!task) {
    return {
      kind: "listening",
      state: missed > 0 ? "missing" : "none",
      title: missed > 0 ? `밀린 듣기 과제 ${missed}일` : "오늘 배정된 듣기 과제 없음",
      detail: missed > 0 ? "오늘 과제는 없지만 못 끝낸 날이 있어요" : summary?.nextStudyDate ? `다음 과제 ${summary.nextStudyDate}` : "",
    };
  }
  const state: TodayStudyState =
    task.status === "completed" ? "done" : task.completedCount > 0 ? "partial" : "missing";
  return {
    kind: "listening",
    state,
    title: [task.setTitle || task.assignmentTitle, task.questionRangeLabel].filter(Boolean).join(" "),
    detail: `${task.completedCount}/${task.totalCount}문항${missedNote}`,
  };
}

type VocabTimes = {
  set_id: string;
  stage1_completed_at: string | null;
  stage2_completed_at: string | null;
  stage3_completed_at: string | null;
  stage4_passed_at: string | null;
};

function stagesDoneToday(t: VocabTimes | undefined, bounds: { start: string; end: string }): number {
  if (!t) return 0;
  return [t.stage1_completed_at, t.stage2_completed_at, t.stage3_completed_at, t.stage4_passed_at].filter((ts) =>
    inDay(ts, bounds),
  ).length;
}

function nextStageOf(s: StudentVocabSetSummary): { n: number; name: string } {
  const steps = studentStageSteps(s);
  const idx = steps.findIndex((st) => !st.done);
  const n = (idx === -1 ? steps.length - 1 : idx) + 1;
  return { n, name: steps[n - 1]?.name ?? "종합테스트" };
}

async function vocabItem(admin: SupabaseClient, studentId: string, todayIso: string): Promise<TodayStudyItem> {
  const bounds = getKoreaDayUtcBounds(todayIso);
  const [sets, { data: times }] = await Promise.all([
    fetchStudentVocabSummaries(admin, studentId).catch(() => [] as StudentVocabSetSummary[]),
    admin
      .from("vocab_stage_progress")
      .select("set_id, stage1_completed_at, stage2_completed_at, stage3_completed_at, stage4_passed_at")
      .eq("student_id", studentId)
      .gte("updated_at", bounds.start),
  ]);
  const timeBySet = new Map(((times ?? []) as VocabTimes[]).map((t) => [t.set_id, t]));
  const usable = sets.filter((s) => s.itemCount > 0);

  const doneToday = usable
    .map((s) => ({ s, n: stagesDoneToday(timeBySet.get(s.set.id), bounds) }))
    .filter((x) => x.n > 0);
  if (doneToday.length > 0) {
    return {
      kind: "vocab",
      state: "done",
      title: doneToday.map((x) => x.s.set.title).join(", "),
      detail: `오늘 ${doneToday.reduce((a, x) => a + x.n, 0)}단계 완료`,
    };
  }

  // 배정된 단어장이 없거나 다 합격했으면 「안 함」이 아니라 「할 것 없음」
  const remaining = usable.filter((s) => !s.stage4Passed);
  if (remaining.length === 0) {
    return {
      kind: "vocab",
      state: "none",
      title: usable.length === 0 ? "배정된 단어장 없음" : "배정된 단어장 모두 합격",
      detail: "",
    };
  }
  const inProgress = remaining.find((s) => studentStageSteps(s).some((st) => st.done)) ?? remaining[0]!;
  const next = nextStageOf(inProgress);
  return {
    kind: "vocab",
    state: "missing",
    title: inProgress.set.title,
    detail: `${next.n}단계 ${next.name} 할 차례 · 남은 단어장 ${remaining.length}개`,
  };
}

async function courseItem(admin: SupabaseClient, studentId: string, todayIso: string): Promise<TodayStudyItem> {
  const bounds = getKoreaDayUtcBounds(todayIso);
  const { data: enrollments } = await admin
    .from("enrollments")
    .select("course_id, course:courses(id, title, deleted_at)")
    .eq("student_id", studentId);
  const courses = (enrollments ?? [])
    .map((e) => one(e.course as unknown as { id: string; title: string | null; deleted_at: string | null } | null))
    .filter((c): c is { id: string; title: string | null; deleted_at: string | null } => Boolean(c && !c.deleted_at));
  if (courses.length === 0) {
    return { kind: "course", state: "none", title: "수강 중인 강좌 없음", detail: "" };
  }
  const courseIds = courses.map((c) => c.id);
  const { data: lessons } = await admin
    .from("lessons")
    .select("id, course_id, title, order_index")
    .in("course_id", courseIds)
    .eq("is_published", true)
    .order("order_index")
    .limit(5000);
  const lessonRows = (lessons ?? []) as { id: string; course_id: string; title: string; order_index: number }[];
  if (lessonRows.length === 0) {
    return { kind: "course", state: "none", title: "강좌에 올라온 영상 없음", detail: "" };
  }
  const lessonIds = lessonRows.map((l) => l.id);
  const { data: progress } = await admin
    .from("lesson_progress")
    .select("lesson_id, is_completed, completed_at, last_watched_at, progress_percent")
    .eq("student_id", studentId)
    .in("lesson_id", lessonIds)
    .limit(5000);
  const progRows = (progress ?? []) as {
    lesson_id: string;
    is_completed: boolean;
    completed_at: string | null;
    last_watched_at: string | null;
    progress_percent: number | null;
  }[];
  const progById = new Map(progRows.map((p) => [p.lesson_id, p]));
  const titleOf = new Map(lessonRows.map((l) => [l.id, l.title]));

  const completedToday = progRows.filter((p) => p.is_completed && inDay(p.completed_at, bounds));
  const watchedToday = progRows.filter((p) => !p.is_completed && inDay(p.last_watched_at, bounds));
  const remaining = lessonRows.filter((l) => !progById.get(l.id)?.is_completed);
  const remainNote = `남은 영상 ${remaining.length}개`;

  if (completedToday.length > 0) {
    return {
      kind: "course",
      state: "done",
      title: completedToday.map((p) => titleOf.get(p.lesson_id) ?? "영상").join(", "),
      detail: `오늘 ${completedToday.length}강 완료${watchedToday.length ? ` · 시청 중 ${watchedToday.length}강` : ""} · ${remainNote}`,
    };
  }
  if (watchedToday.length > 0) {
    const first = watchedToday[0]!;
    return {
      kind: "course",
      state: "partial",
      title: titleOf.get(first.lesson_id) ?? "영상",
      detail: `시청 ${Math.round(first.progress_percent ?? 0)}% (완료 기준 90%) · ${remainNote}`,
    };
  }
  if (remaining.length === 0) {
    return { kind: "course", state: "none", title: "강좌 영상 모두 완료", detail: "" };
  }
  const next = remaining[0]!;
  const course = courses.find((c) => c.id === next.course_id);
  return {
    kind: "course",
    state: "missing",
    title: [course?.title, next.title].filter(Boolean).join(" · "),
    detail: `다음 볼 영상 · ${remainNote}`,
  };
}

/** 오늘 이 학생이 듣기·단어·강좌를 했는지 — 관리자 클라이언트로 읽는다 */
export async function loadStudentTodayStatus(
  admin: SupabaseClient,
  studentId: string,
  todayIso = getTodayIsoKorea(),
): Promise<TodayStudyStatus> {
  const [listening, vocab, course] = await Promise.all([
    listeningItem(admin, studentId, todayIso),
    vocabItem(admin, studentId, todayIso),
    courseItem(admin, studentId, todayIso),
  ]);
  return { todayIso, items: [vocab, listening, course] };
}
