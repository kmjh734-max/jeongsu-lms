import type { SupabaseClient } from "@supabase/supabase-js";
import { getTodayIsoKorea } from "@/lib/date/korea-today";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAllPages, fetchByIdChunks } from "@/lib/vocab/fetch-all";

/**
 * 관리 홈·강사 홈 한 화면에 필요한 숫자를 모은다.
 * 관리자는 학원 전체(RLS), 강사는 담당 반 학생만 본다.
 */

export type HomeRole = "admin" | "teacher";

export type HomeTodoTone = "warn" | "brand" | "neutral";

export interface HomeTodo {
  key: string;
  icon: string;
  tone: HomeTodoTone;
  title: string;
  sub: string;
  actionLabel: string;
  href: string;
}

export interface HomeClassRow {
  id: string;
  name: string;
  studentCount: number;
  /** 이번 주 영상을 본 학생 비율 (반에 강좌가 없으면 null) */
  video: number | null;
  /** 이번 주 듣기 과제 완료 비율 (과제가 없으면 null) */
  listening: number | null;
  /** 이번 주 단어를 공부한 학생 비율 (단어 배정이 없으면 null) */
  vocab: number | null;
}

export interface HomeDashboardData {
  studentCount: number;
  newThisMonth: number;
  listeningToday: { done: number; total: number };
  vocabPassesThisWeek: number;
  balance: number | null;
  /** 최근 30일 쓰는 속도로 남은 크레딧을 쓸 수 있는 주 수 */
  weeksLeft: number | null;
  todos: HomeTodo[];
  classRows: HomeClassRow[];
}

const RUNNING_JOB_STATUSES = ["pending", "analyzing", "generating", "validating"];

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 한국 기준 이번 주 월요일 (YYYY-MM-DD) */
function weekStartIso(todayIso: string): string {
  const dow = new Date(`${todayIso}T12:00:00Z`).getUTCDay(); // 0=일
  return addDaysIso(todayIso, dow === 0 ? -6 : 1 - dow);
}

function koreaStartUtc(iso: string): string {
  return new Date(`${iso}T00:00:00+09:00`).toISOString();
}

function pct(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 100);
}

/** "2반 3명 · 3반 2명 · 반 없음 1명" */
function groupByClassLabel(
  studentIds: string[],
  firstClassName: (id: string) => string | null
): string {
  const counts = new Map<string, number>();
  for (const id of studentIds) {
    const name = firstClassName(id) ?? "반 없음";
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const shown = sorted.slice(0, 3).map(([n, c]) => `${n} ${c}명`);
  const rest = sorted.slice(3).reduce((s, [, c]) => s + c, 0);
  if (rest > 0) shown.push(`그 밖 ${rest}명`);
  return shown.join(" · ");
}

type ClassRow = { id: string; name: string };
type LinkRow = { class_id: string; student_id: string };
type TaskRow = { student_id: string; task_date: string; status: string };

export async function loadHomeDashboard(
  supabase: SupabaseClient,
  opts: { role: HomeRole; viewerId: string; academyId: string | null }
): Promise<HomeDashboardData> {
  const { role, viewerId, academyId } = opts;
  const base = role === "admin" ? "/admin" : "/teacher";
  const todayIso = getTodayIsoKorea();
  const weekIso = weekStartIso(todayIso);
  const weekUtc = koreaStartUtc(weekIso);
  const monthUtc = koreaStartUtc(`${todayIso.slice(0, 8)}01`);
  const now = Date.now();
  const days30Utc = new Date(now - 30 * 86_400_000).toISOString();
  const day1Utc = new Date(now - 86_400_000).toISOString();

  // 1) 반과 학생 범위
  let classQuery = supabase
    .from("classes")
    .select("id, name")
    .eq("is_active", true)
    .order("name");
  if (role === "teacher") classQuery = classQuery.eq("teacher_id", viewerId);
  const { data: classData } = await classQuery;
  const classes = (classData ?? []) as ClassRow[];
  const classIds = classes.map((c) => c.id);

  const links = classIds.length
    ? await fetchByIdChunks<LinkRow>(classIds, (ids, from, to) =>
        supabase
          .from("class_students")
          .select("class_id, student_id")
          .in("class_id", ids)
          .range(from, to)
      ).catch(() => [] as LinkRow[])
    : [];

  type StudentRow = { id: string; is_active: boolean; created_at: string };
  let students: StudentRow[];
  if (role === "admin") {
    students = await fetchAllPages<StudentRow>((from, to) =>
      supabase
        .from("profiles")
        .select("id, is_active, created_at")
        .eq("role", "student")
        .order("id")
        .range(from, to)
    ).catch(() => []);
  } else {
    const ids = [...new Set(links.map((l) => l.student_id))];
    students = await fetchByIdChunks<StudentRow>(ids, (chunk, from, to) =>
      supabase
        .from("profiles")
        .select("id, is_active, created_at")
        .in("id", chunk)
        .range(from, to)
    ).catch(() => []);
  }
  const activeIds = students.filter((s) => s.is_active !== false).map((s) => s.id);
  const activeSet = new Set(activeIds);
  const newThisMonth = students.filter(
    (s) => s.is_active !== false && s.created_at >= monthUtc
  ).length;

  const classNameById = new Map(classes.map((c) => [c.id, c.name]));
  const studentsByClass = new Map<string, Set<string>>();
  const firstClassOf = new Map<string, string>();
  for (const l of links) {
    if (!activeSet.has(l.student_id)) continue;
    const set = studentsByClass.get(l.class_id) ?? new Set<string>();
    set.add(l.student_id);
    studentsByClass.set(l.class_id, set);
    if (!firstClassOf.has(l.student_id)) {
      firstClassOf.set(l.student_id, classNameById.get(l.class_id) ?? "");
    }
  }
  const firstClassName = (id: string) => firstClassOf.get(id) || null;

  /** 관리자는 학원 전체(RLS), 강사는 담당 학생 id로 좁힌다 */
  async function scoped<T>(
    build: (
      ids: string[] | null,
      from: number,
      to: number
    ) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>
  ): Promise<T[]> {
    try {
      if (role === "admin") return await fetchAllPages<T>((f, t) => build(null, f, t));
      return await fetchByIdChunks<T>(activeIds, (chunk, f, t) => build(chunk, f, t));
    } catch {
      return [];
    }
  }

  const [
    tasks,
    vocabWeek,
    vocabFailing,
    videoWeek,
    classCourseRows,
    classVocabRows,
    jobs,
    wallet,
    spent30,
    reportInfo,
  ] = await Promise.all([
    scoped<TaskRow>((ids, from, to) => {
      let q = supabase
        .from("listening_daily_tasks")
        .select("student_id, task_date, status")
        .gte("task_date", weekIso)
        .lte("task_date", todayIso);
      if (ids) q = q.in("student_id", ids);
      return q.order("id").range(from, to);
    }),
    scoped<{ student_id: string; stage4_passed_at: string | null }>((ids, from, to) => {
      let q = supabase
        .from("vocab_stage_progress")
        .select("student_id, stage4_passed_at")
        .gte("updated_at", weekUtc);
      if (ids) q = q.in("student_id", ids);
      return q.order("id").range(from, to);
    }),
    scoped<{ student_id: string; set: { title: string } | { title: string }[] | null }>(
      (ids, from, to) => {
        let q = supabase
          .from("vocab_stage_progress")
          .select("student_id, set:vocab_sets(title)")
          .gt("stage4_attempt_count", 0)
          .eq("stage4_passed", false)
          .gte("updated_at", days30Utc);
        if (ids) q = q.in("student_id", ids);
        return q.order("id").range(from, to);
      }
    ),
    scoped<{ student_id: string }>((ids, from, to) => {
      let q = supabase
        .from("lesson_progress")
        .select("student_id")
        .gte("last_watched_at", weekUtc);
      if (ids) q = q.in("student_id", ids);
      return q.order("id").range(from, to);
    }),
    classIds.length
      ? fetchByIdChunks<{ class_id: string }>(classIds, (ids, from, to) =>
          supabase.from("class_courses").select("class_id").in("class_id", ids).range(from, to)
        ).catch(() => [])
      : Promise.resolve([] as { class_id: string }[]),
    classIds.length
      ? fetchByIdChunks<{ class_id: string | null }>(classIds, (ids, from, to) =>
          supabase.from("vocab_assignments").select("class_id").in("class_id", ids).range(from, to)
        ).catch(() => [])
      : Promise.resolve([] as { class_id: string | null }[]),
    (async () => {
      let q = supabase
        .from("question_generation_jobs")
        .select(
          "id, total_requested, total_completed, passage:english_source_passages(title)"
        )
        .in("status", RUNNING_JOB_STATUSES)
        .gte("created_at", day1Utc)
        .order("created_at", { ascending: false })
        .limit(3);
      if (role === "teacher") q = q.eq("created_by", viewerId);
      const { data } = await q;
      return (data ?? []) as Array<{
        id: string;
        total_requested: number;
        total_completed: number;
        passage: { title: string } | { title: string }[] | null;
      }>;
    })(),
    academyId
      ? supabase
          .from("academy_wallets")
          .select("balance")
          .eq("academy_id", academyId)
          .maybeSingle()
          .then(({ data }) => (data ? Number(data.balance) : 0))
      : Promise.resolve(null),
    academyId
      ? fetchAllPages<{ amount: number }>((from, to) =>
          supabase
            .from("credit_transactions")
            .select("amount")
            .eq("academy_id", academyId)
            .eq("type", "debit")
            .gte("created_at", days30Utc)
            .order("id")
            .range(from, to)
        )
          .then((rows) => rows.reduce((s, r) => s + Number(r.amount), 0))
          .catch(() => 0)
      : Promise.resolve(0),
    loadReportShareInfo(academyId, monthUtc),
  ]);

  // 2) 오늘 듣기
  const todayByStudent = new Map<string, boolean>();
  for (const t of tasks) {
    if (t.task_date !== todayIso || !activeSet.has(t.student_id)) continue;
    const done = t.status === "completed";
    todayByStudent.set(t.student_id, (todayByStudent.get(t.student_id) ?? true) && done);
  }
  const listenTotal = todayByStudent.size;
  const notDoneToday = [...todayByStudent.entries()]
    .filter(([, done]) => !done)
    .map(([id]) => id);
  const listenDone = listenTotal - notDoneToday.length;

  // 3) 이번 주 단어 합격
  const vocabPassesThisWeek = vocabWeek.filter(
    (r) => r.stage4_passed_at && r.stage4_passed_at >= weekUtc && activeSet.has(r.student_id)
  ).length;

  // 4) 오늘 챙길 일
  const todos: HomeTodo[] = [];
  if (notDoneToday.length > 0) {
    todos.push({
      key: "listening",
      icon: "alert",
      tone: "warn",
      title: `오늘 듣기를 안 한 학생 ${notDoneToday.length}명`,
      sub: groupByClassLabel(notDoneToday, firstClassName),
      actionLabel: "명단 보기",
      href: `${base}/listening/status`,
    });
  }

  const failingStudents = new Set<string>();
  const failingSets: string[] = [];
  for (const r of vocabFailing) {
    if (!activeSet.has(r.student_id)) continue;
    failingStudents.add(r.student_id);
    const set = Array.isArray(r.set) ? r.set[0] : r.set;
    if (set?.title && !failingSets.includes(set.title)) failingSets.push(set.title);
  }
  if (failingStudents.size > 0) {
    const shown = failingSets.slice(0, 2).join(" · ");
    todos.push({
      key: "vocab",
      icon: "book",
      tone: "warn",
      title: `단어 종합테스트 불합격 후 다시 안 한 학생 ${failingStudents.size}명`,
      sub:
        failingSets.length > 2 ? `${shown} 외 ${failingSets.length - 2}개` : shown,
      actionLabel: "명단 보기",
      href: `${base}/vocab/status`,
    });
  }

  for (const job of jobs) {
    const passage = Array.isArray(job.passage) ? job.passage[0] : job.passage;
    const total = Number(job.total_requested) || 0;
    const done = Number(job.total_completed) || 0;
    todos.push({
      key: `job-${job.id}`,
      icon: "pen",
      tone: "brand",
      title: total > 0 ? `변형문제 ${total}문항 만드는 중` : "변형문제 만드는 중",
      sub: `${passage?.title ?? "지문"} · ${pct(done, total)}%`,
      actionLabel: "보기",
      href: `${base}/question-generator/generations/${job.id}`,
    });
  }

  if (reportInfo) {
    const notSent = activeIds.filter((id) => !reportInfo.sentIds.has(id));
    if (notSent.length > 0) {
      const month = Number(todayIso.slice(5, 7));
      todos.push({
        key: "reports",
        icon: "file",
        tone: "neutral",
        title: `이번 달 학습 리포트 안 보낸 학생 ${notSent.length}명`,
        sub: `${month}월 리포트 · ${groupByClassLabel(notSent, firstClassName)}`,
        actionLabel: "리포트 만들기",
        href: `${base}/reports`,
      });
    }
  }

  // 5) 반별 이번 주
  const classesWithCourses = new Set(classCourseRows.map((r) => r.class_id));
  const classesWithVocab = new Set(
    classVocabRows.map((r) => r.class_id).filter((v): v is string => Boolean(v))
  );
  const watched = new Set(videoWeek.map((r) => r.student_id));
  const vocabActive = new Set(vocabWeek.map((r) => r.student_id));
  const tasksByStudent = new Map<string, { done: number; total: number }>();
  for (const t of tasks) {
    const cur = tasksByStudent.get(t.student_id) ?? { done: 0, total: 0 };
    cur.total += 1;
    if (t.status === "completed") cur.done += 1;
    tasksByStudent.set(t.student_id, cur);
  }

  const classRows: HomeClassRow[] = classes
    .map((c) => {
      const ids = [...(studentsByClass.get(c.id) ?? [])];
      const n = ids.length;
      let lDone = 0;
      let lTotal = 0;
      let vocabCount = 0;
      let videoCount = 0;
      for (const id of ids) {
        const t = tasksByStudent.get(id);
        if (t) {
          lDone += t.done;
          lTotal += t.total;
        }
        if (vocabActive.has(id)) vocabCount += 1;
        if (watched.has(id)) videoCount += 1;
      }
      return {
        id: c.id,
        name: c.name,
        studentCount: n,
        video: n > 0 && (classesWithCourses.has(c.id) || videoCount > 0) ? pct(videoCount, n) : null,
        listening: lTotal > 0 ? pct(lDone, lTotal) : null,
        vocab: n > 0 && (classesWithVocab.has(c.id) || vocabCount > 0) ? pct(vocabCount, n) : null,
      };
    })
    .filter((r) => r.studentCount > 0);

  const perWeek = (spent30 / 30) * 7;
  const weeksLeft =
    wallet !== null && perWeek > 0 ? Math.floor(wallet / perWeek) : null;

  return {
    studentCount: activeIds.length,
    newThisMonth,
    listeningToday: { done: listenDone, total: listenTotal },
    vocabPassesThisWeek,
    balance: wallet,
    weeksLeft,
    todos,
    classRows,
  };
}

/**
 * 이번 달 학습 리포트를 보낸 학생. 최근 90일 동안 리포트를 한 번도 보내지 않은 학원은
 * 이 기능을 쓰지 않는 것으로 보고 null(항목 숨김).
 */
async function loadReportShareInfo(
  academyId: string | null,
  monthUtc: string
): Promise<{ sentIds: Set<string> } | null> {
  if (!academyId) return null;
  try {
    const admin = createAdminClient();
    const since90 = new Date(Date.now() - 90 * 86_400_000).toISOString();
    const { count } = await admin
      .from("shared_reports")
      .select("id", { count: "exact", head: true })
      .eq("academy_id", academyId)
      .gte("created_at", since90);
    if (!count) return null;
    const rows = await fetchAllPages<{ student_id: string }>((from, to) =>
      admin
        .from("shared_reports")
        .select("student_id")
        .eq("academy_id", academyId)
        .gte("created_at", monthUtc)
        .order("id")
        .range(from, to)
    );
    return { sentIds: new Set(rows.map((r) => r.student_id)) };
  } catch {
    return null;
  }
}
