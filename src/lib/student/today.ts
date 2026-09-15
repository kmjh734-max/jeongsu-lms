import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTodayIsoKorea } from "@/lib/date/korea-today";
import { flattenCourseLessons } from "@/lib/courses/course-lessons";
import { loadStudentDashboardCourses } from "@/lib/student/load-dashboard-courses";
import { fetchStudentVocabSummaries } from "@/lib/vocab/student-sets";
import { studentStageSteps } from "@/lib/vocab/stage-progress-fields";
import {
  getStudentListeningCalendar,
  type ListeningCalendarDay,
} from "@/lib/listening/schedule/calendar";
import {
  ensureStudentTodayAndMissedTasks,
  getStudentScheduleTodaySummaryReadOnly,
} from "@/lib/listening/schedule/today-summary";
import type { Lesson, Section, StudentVocabSetSummary } from "@/types/database";

/** 홈·왼쪽 메뉴의 '오늘 할 일' 한 줄 */
export interface StudentTodayItem {
  kind: "listening" | "vocab" | "course";
  /** 짧은 이름 (메뉴 카드용) */
  short: string;
  title: string;
  meta: string;
  done: boolean;
  percent: number;
  progressLabel: string;
  cta: string;
  href: string;
}

export interface StudentWeekDay {
  iso: string;
  label: string;
  status: "done" | "today" | "missed" | "later" | "off";
  todayLabel?: string;
}

export interface StudentTodaySummary {
  todayIso: string;
  items: StudentTodayItem[];
  doneCount: number;
  week: StudentWeekDay[];
  listeningStreak: number;
  listeningDoneThisMonth: number;
  vocabPassed: number;
}

/** 타임스탬프가 한국 날짜로 오늘인지 */
function isTodayKorea(ts: string | null | undefined, todayIso: string): boolean {
  if (!ts) return false;
  return getTodayIsoKorea(new Date(ts)) === todayIso;
}

function addDays(iso: string, delta: number): string {
  const d = new Date(`${iso}T12:00:00+09:00`);
  d.setUTCDate(d.getUTCDate() + delta);
  return getTodayIsoKorea(d);
}

/** 다음에 할 단계 번호(1부터). 시험 연계 단어장은 3단계까지. */
function vocabNextStage(s: StudentVocabSetSummary): number {
  const steps = studentStageSteps(s);
  const idx = steps.findIndex((st) => !st.done);
  return (idx === -1 ? steps.length - 1 : idx) + 1;
}

function vocabStageName(s: StudentVocabSetSummary, stage: number): string {
  return studentStageSteps(s)[stage - 1]?.name ?? "종합테스트";
}

function vocabTotalStages(s: StudentVocabSetSummary): number {
  return studentStageSteps(s).length;
}

function vocabDoneStages(s: StudentVocabSetSummary): number {
  return studentStageSteps(s).filter((st) => st.done).length;
}

type VocabTimes = {
  set_id: string;
  updated_at: string | null;
  stage1_completed_at: string | null;
  stage2_completed_at: string | null;
  stage3_completed_at: string | null;
  stage4_passed_at: string | null;
};

async function listeningPart(studentId: string, todayIso: string, ensure: boolean) {
  const admin = createAdminClient();
  // 홈에서는 오늘 과제를 먼저 만들어 둔다(듣기 화면과 같은 방식). 메뉴 카드는 읽기만.
  if (ensure) {
    await ensureStudentTodayAndMissedTasks(admin, studentId, todayIso).catch(() => undefined);
  }
  const year = Number(todayIso.slice(0, 4));
  const month = Number(todayIso.slice(5, 7));
  // 이번 주가 지난달에 걸치면 지난달 달력도 본다(연속 학습 계산에도 쓰임)
  const prevMonthDate = new Date(Date.UTC(year, month - 2, 15));
  const prevYear = prevMonthDate.getUTCFullYear();
  const prevMonth = prevMonthDate.getUTCMonth() + 1;

  const [summary, cal, prevCal] = await Promise.all([
    getStudentScheduleTodaySummaryReadOnly(admin, studentId, todayIso).catch(() => null),
    getStudentListeningCalendar(admin, studentId, year, month, todayIso)
      .then((c) => c.days)
      .catch(() => [] as ListeningCalendarDay[]),
    getStudentListeningCalendar(admin, studentId, prevYear, prevMonth, todayIso)
      .then((c) => c.days)
      .catch(() => [] as ListeningCalendarDay[]),
  ]);
  return { summary, days: [...prevCal, ...cal] };
}

export const loadStudentToday = cache(
  async (studentId: string, ensure = false): Promise<StudentTodaySummary> => {
    const todayIso = getTodayIsoKorea();
    const supabase = await createClient();

    const [listening, vocab, courses, vocabTimesRes, lessonDoneRes] = await Promise.all([
      listeningPart(studentId, todayIso, ensure),
      fetchStudentVocabSummaries(supabase, studentId).catch(
        () => [] as StudentVocabSetSummary[]
      ),
      loadStudentDashboardCourses(studentId).catch(() => []),
      supabase
        .from("vocab_stage_progress")
        .select(
          "set_id, updated_at, stage1_completed_at, stage2_completed_at, stage3_completed_at, stage4_passed_at"
        )
        .eq("student_id", studentId),
      supabase
        .from("lesson_progress")
        .select("lesson_id, completed_at, last_watched_at, is_completed")
        .eq("student_id", studentId)
        .order("last_watched_at", { ascending: false, nullsFirst: false })
        .limit(50),
    ]);

    const items: StudentTodayItem[] = [];

    /* 듣기 */
    const task = listening.summary?.todayTask ?? null;
    if (task) {
      const total = Math.max(1, task.totalCount);
      const done = task.status === "completed";
      items.push({
        kind: "listening",
        short: `듣기학습 ${task.totalCount}문항`,
        title: task.setTitle || task.assignmentTitle,
        meta: [task.questionRangeLabel, `${task.totalCount}문항`, task.assignmentTitle]
          .filter(Boolean)
          .join(" · "),
        done,
        percent: Math.round((task.completedCount / total) * 100),
        progressLabel: `${task.completedCount} / ${task.totalCount}문항`,
        cta: done ? "복습하기" : task.completedCount > 0 ? "이어 풀기" : "시작하기",
        href: `/student/listening/daily/${task.id}`,
      });
    }

    /* 단어 */
    const times = new Map(
      ((vocabTimesRes.data ?? []) as VocabTimes[]).map((t) => [t.set_id, t])
    );
    const usable = vocab.filter((s) => s.itemCount > 0);
    const stageDoneToday = (t: VocabTimes | undefined) =>
      Boolean(
        t &&
          [t.stage1_completed_at, t.stage2_completed_at, t.stage3_completed_at, t.stage4_passed_at].some(
            (ts) => isTodayKorea(ts, todayIso)
          )
      );
    const doneTodaySet = usable
      .filter((s) => stageDoneToday(times.get(s.set.id)))
      .sort((a, b) =>
        String(times.get(b.set.id)?.updated_at ?? "").localeCompare(
          String(times.get(a.set.id)?.updated_at ?? "")
        )
      )[0];
    const inProgress = usable
      .filter((s) => !s.stage4Passed && vocabDoneStages(s) > 0)
      .sort((a, b) =>
        String(times.get(b.set.id)?.updated_at ?? "").localeCompare(
          String(times.get(a.set.id)?.updated_at ?? "")
        )
      )[0];
    const notStarted = usable.find((s) => !s.stage4Passed && vocabDoneStages(s) === 0);
    const vocabTarget = doneTodaySet ?? inProgress ?? notStarted;
    if (vocabTarget) {
      const done = Boolean(doneTodaySet);
      const next = vocabNextStage(vocabTarget);
      const doneStages = vocabDoneStages(vocabTarget);
      const totalStages = vocabTotalStages(vocabTarget);
      items.push({
        kind: "vocab",
        short: vocabTarget.stage4Passed
          ? "단어 종합테스트"
          : done
            ? `단어 ${Math.max(1, next - 1)}단계`
            : `단어 ${next}단계`,
        title: vocabTarget.set.title,
        meta: vocabTarget.stage4Passed
          ? `${vocabTarget.itemCount}단어 · 합격`
          : `${next}단계 ${vocabStageName(vocabTarget, next)} · ${vocabTarget.itemCount}단어`,
        done,
        percent: Math.round((doneStages / totalStages) * 100),
        progressLabel: `${doneStages} / ${totalStages}단계`,
        cta: vocabTarget.stage4Passed ? "복습하기" : doneStages > 0 ? `${next}단계 이어서` : "시작하기",
        href: `/student/vocab/${vocabTarget.set.id}`,
      });
    }

    /* 강좌 */
    const lessonRows = (lessonDoneRes.data ?? []) as {
      lesson_id: string;
      completed_at: string | null;
      last_watched_at: string | null;
      is_completed: boolean;
    }[];
    const completedToday = new Set(
      lessonRows.filter((r) => r.is_completed && isTodayKorea(r.completed_at, todayIso)).map((r) => r.lesson_id)
    );
    const openCourses = courses.filter((c) => c.totalLessons > 0);
    const courseTarget =
      openCourses.find((c) => c.inProgress && c.completedLessons < c.totalLessons) ??
      openCourses.find((c) => c.completedLessons < c.totalLessons);
    if (courseTarget) {
      const courseId = courseTarget.course.id;
      const [{ data: sections }, { data: lessons }] = await Promise.all([
        supabase.from("sections").select("*").eq("course_id", courseId).order("order_index"),
        supabase
          .from("lessons")
          .select("*")
          .eq("course_id", courseId)
          .eq("is_published", true)
          .order("order_index"),
      ]);
      const flat = flattenCourseLessons((sections ?? []) as Section[], (lessons ?? []) as Lesson[]);
      const ids = flat.map((l) => l.id);
      const { data: prog } =
        ids.length > 0
          ? await supabase
              .from("lesson_progress")
              .select("lesson_id, is_completed, progress_percent")
              .eq("student_id", studentId)
              .in("lesson_id", ids)
          : { data: [] as { lesson_id: string; is_completed: boolean; progress_percent: number | null }[] };
      const progById = new Map((prog ?? []).map((p) => [p.lesson_id, p]));
      const nextIndex = flat.findIndex((l) => !progById.get(l.id)?.is_completed);
      const nextLesson = nextIndex >= 0 ? flat[nextIndex] : null;
      const doneToday = flat.some((l) => completedToday.has(l.id));
      const watched = nextLesson ? Math.round(progById.get(nextLesson.id)?.progress_percent ?? 0) : 100;
      if (nextLesson) {
        items.push({
          kind: "course",
          short: `강좌 ${nextIndex + 1}강`,
          title: courseTarget.course.title ?? "강좌",
          meta: `${nextIndex + 1}강 ${nextLesson.title}`,
          done: doneToday,
          percent: watched,
          progressLabel: `시청 ${watched}% · 완료 기준 90%`,
          cta: watched > 0 ? "이어서 보기" : "보기",
          href: `/student/courses/${courseId}/lessons/${nextLesson.id}`,
        });
      }
    }

    /* 이번 주 듣기 (월~일) */
    const byDate = new Map(listening.days.map((d) => [d.taskDate, d]));
    const todayDate = new Date(`${todayIso}T12:00:00+09:00`);
    const dow = (todayDate.getUTCDay() + 6) % 7; // 월=0
    const monday = addDays(todayIso, -dow);
    const labels = ["월", "화", "수", "목", "금", "토", "일"];
    const week: StudentWeekDay[] = labels.map((label, i) => {
      const iso = addDays(monday, i);
      const d = byDate.get(iso);
      if (iso === todayIso) {
        if (d?.taskId) {
          return {
            iso,
            label,
            status: d.status === "completed" ? "done" : "today",
            todayLabel: `${d.completedCount}/${d.totalCount}`,
          };
        }
        return { iso, label, status: "off" };
      }
      if (!d || !d.isStudyDay || (!d.taskId && iso < todayIso)) return { iso, label, status: "off" };
      if (d.status === "completed") return { iso, label, status: "done" };
      if (iso > todayIso) return { iso, label, status: "later" };
      return { iso, label, status: "missed" };
    });

    /* 연속 학습: 오늘(끝냈으면)부터 거꾸로, 배정이 없는 날은 건너뜀 */
    let streak = 0;
    const sorted = [...listening.days]
      .filter((d) => d.taskId && d.taskDate <= todayIso)
      .sort((a, b) => b.taskDate.localeCompare(a.taskDate));
    for (const d of sorted) {
      if (d.status === "completed") streak += 1;
      else if (d.taskDate === todayIso) continue;
      else break;
    }
    const monthPrefix = todayIso.slice(0, 7);
    const listeningDoneThisMonth = listening.days.filter(
      (d) => d.taskDate.startsWith(monthPrefix) && d.status === "completed"
    ).length;

    return {
      todayIso,
      items,
      doneCount: items.filter((i) => i.done).length,
      week,
      listeningStreak: streak,
      listeningDoneThisMonth,
      vocabPassed: vocab.filter((s) => s.stage4Passed).length,
    };
  }
);
