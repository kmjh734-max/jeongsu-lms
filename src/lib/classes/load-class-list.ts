import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchInChunks } from "@/lib/classes/fetch-chunks";
import { weekMondayIso } from "@/lib/classes/week";
import { formatDaysOfWeek } from "@/lib/listening/schedule/days-of-week";
import { unwrapRelation } from "@/lib/progress/enrollment-progress";

export interface ClassListRow {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  teacherId: string | null;
  teacherName: string | null;
  studentCount: number;
  courseTitles: string[];
  vocabSetCount: number;
  /** 진행 중인 듣기 스케줄 요일 ("매일", "월·수·금") — 없으면 null */
  listeningDays: string | null;
  /** 이번 주 수행: 듣기 과제가 있으면 듣기 완료율, 없으면 영상 진도 평균 */
  performance: { percent: number; source: "listening" | "video" } | null;
}

type ClassRow = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  teacher_id: string | null;
  teacher: { id: string; name: string } | { id: string; name: string }[] | null;
};

type ScheduleRow = {
  id: string;
  target_class_id: string | null;
  days_of_week: number[] | null;
  end_date: string | null;
};

function listeningDaysLabel(days: Set<number>): string | null {
  if (days.size === 0) return null;
  if ([1, 2, 3, 4, 5].every((d) => days.has(d))) return "매일";
  return formatDaysOfWeek([...days]);
}

/**
 * 반 목록 한 줄에 필요한 요약을 한 번에 읽는다.
 * - supabase: 로그인한 사람 권한 (반·학생·강좌·단어 범위)
 * - admin: 듣기 스케줄·일일 과제 (반 id로만 좁혀 읽음)
 */
export async function loadClassListRows(
  supabase: SupabaseClient,
  admin: SupabaseClient,
  options: { teacherId?: string; todayIso: string }
): Promise<ClassListRow[]> {
  let classQuery = supabase
    .from("classes")
    .select(
      "id, name, description, is_active, teacher_id, teacher:profiles!classes_teacher_id_fkey(id, name)"
    )
    .order("created_at", { ascending: false });
  if (options.teacherId) classQuery = classQuery.eq("teacher_id", options.teacherId);

  const { data: classData } = await classQuery;
  const classes = (classData ?? []) as ClassRow[];
  const classIds = classes.map((c) => c.id);
  if (classIds.length === 0) return [];

  const monday = weekMondayIso(options.todayIso);

  const [members, classCourses, vocabRows, schedules] = await Promise.all([
    fetchInChunks<{ class_id: string; student_id: string }>(classIds, (ids, from, to) =>
      supabase
        .from("class_students")
        .select("class_id, student_id")
        .in("class_id", ids)
        .order("id")
        .range(from, to)
    ),
    fetchInChunks<{
      class_id: string;
      course_id: string;
      course: { title: string } | { title: string }[] | null;
    }>(classIds, (ids, from, to) =>
      supabase
        .from("class_courses")
        .select("class_id, course_id, course:courses(title)")
        .in("class_id", ids)
        .order("created_at")
        .order("id")
        .range(from, to)
    ),
    fetchInChunks<{ class_id: string; set_id: string }>(classIds, (ids, from, to) =>
      supabase
        .from("vocab_assignments")
        .select("class_id, set_id")
        .in("class_id", ids)
        .order("id")
        .range(from, to)
    ),
    fetchInChunks<ScheduleRow>(classIds, (ids, from, to) =>
      admin
        .from("listening_schedule_assignments")
        .select("id, target_class_id, days_of_week, end_date")
        .in("target_class_id", ids)
        .eq("is_active", true)
        .order("id")
        .range(from, to)
    ),
  ]);

  const studentsByClass = new Map<string, Set<string>>();
  for (const m of members) {
    const set = studentsByClass.get(m.class_id) ?? new Set<string>();
    set.add(m.student_id);
    studentsByClass.set(m.class_id, set);
  }

  const coursesByClass = new Map<string, { id: string; title: string }[]>();
  for (const cc of classCourses) {
    const list = coursesByClass.get(cc.class_id) ?? [];
    list.push({ id: cc.course_id, title: unwrapRelation(cc.course)?.title ?? "—" });
    coursesByClass.set(cc.class_id, list);
  }

  const vocabSetsByClass = new Map<string, Set<string>>();
  for (const v of vocabRows) {
    const set = vocabSetsByClass.get(v.class_id) ?? new Set<string>();
    set.add(v.set_id);
    vocabSetsByClass.set(v.class_id, set);
  }

  // 끝난 스케줄은 빼고, 반마다 요일을 합친다
  const liveSchedules = schedules.filter(
    (s) => s.target_class_id && (!s.end_date || s.end_date >= options.todayIso)
  );
  const daysByClass = new Map<string, Set<number>>();
  const classBySchedule = new Map<string, string>();
  for (const s of liveSchedules) {
    const cid = s.target_class_id!;
    classBySchedule.set(s.id, cid);
    const set = daysByClass.get(cid) ?? new Set<number>();
    for (const d of s.days_of_week ?? []) set.add(d);
    daysByClass.set(cid, set);
  }

  // 이번 주(월~오늘) 듣기 일일 과제 완료율
  const tasks = await fetchInChunks<{
    assignment_id: string;
    status: string;
    completed_count: number | null;
    total_count: number | null;
  }>(
    [...classBySchedule.keys()],
    (ids, from, to) =>
      admin
        .from("listening_daily_tasks")
        .select("assignment_id, status, completed_count, total_count")
        .in("assignment_id", ids)
        .gte("task_date", monday)
        .lte("task_date", options.todayIso)
        .order("id")
        .range(from, to),
    50
  );
  const listeningByClass = new Map<string, { sum: number; count: number }>();
  for (const t of tasks) {
    const cid = classBySchedule.get(t.assignment_id);
    if (!cid) continue;
    const total = t.total_count ?? 0;
    const ratio =
      t.status === "completed"
        ? 1
        : total > 0
          ? Math.min(1, (t.completed_count ?? 0) / total)
          : 0;
    const bucket = listeningByClass.get(cid) ?? { sum: 0, count: 0 };
    bucket.sum += ratio;
    bucket.count += 1;
    listeningByClass.set(cid, bucket);
  }

  // 듣기 과제가 없는 반은 영상 진도 평균으로 대신한다
  const videoClassIds = classIds.filter(
    (id) => !listeningByClass.has(id) && (coursesByClass.get(id)?.length ?? 0) > 0
  );
  const videoByClass = await loadVideoProgressByClass(
    supabase,
    videoClassIds,
    studentsByClass,
    coursesByClass
  );

  return classes.map((c) => {
    const listening = listeningByClass.get(c.id);
    const video = videoByClass.get(c.id);
    return {
      id: c.id,
      name: c.name,
      description: c.description,
      isActive: c.is_active,
      teacherId: c.teacher_id,
      teacherName: unwrapRelation(c.teacher)?.name ?? null,
      studentCount: studentsByClass.get(c.id)?.size ?? 0,
      courseTitles: (coursesByClass.get(c.id) ?? []).map((x) => x.title),
      vocabSetCount: vocabSetsByClass.get(c.id)?.size ?? 0,
      listeningDays: listeningDaysLabel(daysByClass.get(c.id) ?? new Set()),
      performance: listening
        ? { percent: Math.round((listening.sum / listening.count) * 100), source: "listening" }
        : video !== undefined
          ? { percent: video, source: "video" }
          : null,
    };
  });
}

/** 반 학생들이 반 강좌의 공개 영상을 몇 % 끝냈는지 (반 전체 평균) */
async function loadVideoProgressByClass(
  supabase: SupabaseClient,
  classIds: string[],
  studentsByClass: Map<string, Set<string>>,
  coursesByClass: Map<string, { id: string; title: string }[]>
): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  const withStudents = classIds.filter((id) => (studentsByClass.get(id)?.size ?? 0) > 0);
  if (withStudents.length === 0) return out;

  const courseIds = [
    ...new Set(withStudents.flatMap((id) => (coursesByClass.get(id) ?? []).map((c) => c.id))),
  ];
  const studentIds = [
    ...new Set(withStudents.flatMap((id) => [...(studentsByClass.get(id) ?? [])])),
  ];

  const lessons = await fetchInChunks<{ id: string; course_id: string }>(
    courseIds,
    (ids, from, to) =>
      supabase
        .from("lessons")
        .select("id, course_id")
        .in("course_id", ids)
        .eq("is_published", true)
        .order("id")
        .range(from, to)
  );
  if (lessons.length === 0) return out;

  const courseOfLesson = new Map(lessons.map((l) => [l.id, l.course_id]));
  const lessonCountByCourse = new Map<string, number>();
  for (const l of lessons) {
    lessonCountByCourse.set(l.course_id, (lessonCountByCourse.get(l.course_id) ?? 0) + 1);
  }

  const done = await fetchInChunks<{ student_id: string; lesson_id: string }>(
    studentIds,
    (ids, from, to) =>
      supabase
        .from("lesson_progress")
        .select("student_id, lesson_id")
        .in("student_id", ids)
        .eq("is_completed", true)
        .order("id")
        .range(from, to),
    50
  );

  // 학생 × 강좌별 끝낸 영상 수
  const doneByStudentCourse = new Map<string, number>();
  for (const p of done) {
    const courseId = courseOfLesson.get(p.lesson_id);
    if (!courseId) continue;
    const key = `${p.student_id}:${courseId}`;
    doneByStudentCourse.set(key, (doneByStudentCourse.get(key) ?? 0) + 1);
  }

  for (const classId of withStudents) {
    const courses = (coursesByClass.get(classId) ?? []).filter(
      (c) => (lessonCountByCourse.get(c.id) ?? 0) > 0
    );
    if (courses.length === 0) continue;
    let completed = 0;
    let total = 0;
    for (const sid of studentsByClass.get(classId) ?? []) {
      for (const c of courses) {
        total += lessonCountByCourse.get(c.id) ?? 0;
        completed += doneByStudentCourse.get(`${sid}:${c.id}`) ?? 0;
      }
    }
    if (total > 0) out.set(classId, Math.round((completed / total) * 100));
  }
  return out;
}
