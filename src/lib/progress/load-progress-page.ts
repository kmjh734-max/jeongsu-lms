import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchInChunks } from "@/lib/classes/fetch-chunks";
import { chunkList, fetchPagesParallel } from "@/lib/fetch-pages";
import {
  buildEnrollmentProgressRows,
  normalizeEnrollmentInputs,
  type EnrollmentProgressRow,
} from "@/lib/progress/enrollment-progress";
import type { Lesson, LessonProgress, Section } from "@/types/database";

const DEFAULT_ENROLLMENT_LIMIT = 400;

export interface ProgressRow extends EnrollmentProgressRow {
  /** 이 학생이 속한 반 (반 거르기용) */
  classIds: string[];
  /** 표에 보일 반 — 이 강좌를 배정한 반이 있으면 그 반 */
  className: string | null;
}

export interface ProgressPageData {
  rows: ProgressRow[];
  classes: { id: string; name: string }[];
  /** 수강이 너무 많아 최근 배정분만 읽었는지 */
  truncated: boolean;
  limit: number;
}

export async function loadProgressPageData(
  supabase: SupabaseClient,
  options?: { teacherId?: string; enrollmentLimit?: number }
): Promise<ProgressPageData> {
  const limit = options?.enrollmentLimit ?? DEFAULT_ENROLLMENT_LIMIT;
  const empty: ProgressPageData = { rows: [], classes: [], truncated: false, limit };

  // enrollments는 academy_id가 없어, RLS가 적용된 courses로 먼저 범위를 좁힌다
  let courseQuery = supabase.from("courses").select("id");
  let classQuery = supabase
    .from("classes")
    .select("id, name")
    .eq("is_active", true)
    .order("name");
  if (options?.teacherId) {
    courseQuery = courseQuery.eq("teacher_id", options.teacherId);
    classQuery = classQuery.eq("teacher_id", options.teacherId);
  }
  const classesPromise = Promise.resolve(classQuery).then(
    ({ data }) => (data ?? []) as { id: string; name: string }[]
  );
  // 반 학생·반 강좌는 반 목록만 있으면 되니 수강 목록을 기다리지 않고 바로 읽는다
  const classIdsPromise = classesPromise.then((rows) => rows.map((c) => c.id));
  const membersPromise = classIdsPromise.then((classIds) =>
    fetchInChunks<{ class_id: string; student_id: string }>(classIds, (ids, from, to) =>
      supabase
        .from("class_students")
        .select("class_id, student_id")
        .in("class_id", ids)
        .order("id")
        .range(from, to)
    )
  );
  const classCoursesPromise = classIdsPromise.then((classIds) =>
    fetchInChunks<{ class_id: string; course_id: string }>(classIds, (ids, from, to) =>
      supabase
        .from("class_courses")
        .select("class_id, course_id")
        .in("class_id", ids)
        .order("id")
        .range(from, to)
    )
  );
  // 결과를 쓰지 않고 끝나도 처리되지 않은 거부로 남지 않게
  membersPromise.catch(() => undefined);
  classCoursesPromise.catch(() => undefined);

  const [{ data: scopedCourses }, classes] = await Promise.all([courseQuery, classesPromise]);
  const scopedCourseIds = (scopedCourses ?? []).map((c) => c.id as string);
  if (scopedCourseIds.length === 0) return { ...empty, classes };

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(
      "student_id, course_id, created_at, student:profiles!enrollments_student_id_fkey(name, email, username), course:courses(title)"
    )
    .in("course_id", scopedCourseIds)
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  const truncated = (enrollments ?? []).length > limit;
  const enrollmentList = (enrollments ?? []).slice(0, limit);
  if (enrollmentList.length === 0) return { ...empty, classes };

  const courseIds = [...new Set(enrollmentList.map((e) => e.course_id as string))];
  const studentIds = [...new Set(enrollmentList.map((e) => e.student_id as string))];

  type ProgressPick = Pick<
    LessonProgress,
    | "student_id"
    | "lesson_id"
    | "is_completed"
    | "last_watched_at"
    | "completed_at"
    | "progress_percent"
    | "watched_seconds"
  >;

  const lessonsPromise = Promise.resolve(
    supabase
      .from("lessons")
      .select("id, course_id, title, order_index, section_id, is_published")
      .in("course_id", courseIds)
  ).then(({ data }) => data ?? []);

  // 진도는 영상 목록을 기다리지 않고 학생 id 로 바로 읽고, 이 강좌들 영상만 아래에서 남긴다.
  // (영상 id 를 주소에 싣지 않아도 되고, 학생 묶음도 동시에 1000줄씩 끝까지 읽는다)
  const progressPromise = Promise.all(
    chunkList(studentIds, 100).map((studentChunk) =>
      fetchPagesParallel<ProgressPick>((from, to, withCount) =>
        supabase
          .from("lesson_progress")
          .select(
            "student_id, lesson_id, is_completed, last_watched_at, completed_at, progress_percent, watched_seconds",
            withCount ? { count: "exact" } : undefined
          )
          .in("student_id", studentChunk)
          .order("id")
          .range(from, to)
      )
    )
  ).then((parts) => parts.flat());

  const [{ data: sections }, lessons, allProgress, members, classCourses] = await Promise.all([
    supabase
      .from("sections")
      .select("id, course_id, order_index")
      .in("course_id", courseIds),
    lessonsPromise,
    progressPromise,
    membersPromise,
    classCoursesPromise,
  ]);
  const lessonIdSet = new Set(lessons.map((l) => l.id as string));
  const progress = allProgress.filter((p) => lessonIdSet.has(p.lesson_id));

  const rows = buildEnrollmentProgressRows(
    normalizeEnrollmentInputs(enrollmentList),
    (sections ?? []) as Pick<Section, "id" | "course_id" | "order_index">[],
    lessons as Pick<
      Lesson,
      "id" | "course_id" | "title" | "order_index" | "section_id" | "is_published"
    >[],
    progress
  );

  const classNameById = new Map(classes.map((c) => [c.id, c.name]));
  const classesByStudent = new Map<string, string[]>();
  for (const m of members) {
    const list = classesByStudent.get(m.student_id) ?? [];
    list.push(m.class_id);
    classesByStudent.set(m.student_id, list);
  }
  const courseClassPairs = new Set(classCourses.map((cc) => `${cc.class_id}:${cc.course_id}`));

  return {
    rows: rows.map((row) => {
      const ids = classesByStudent.get(row.studentId) ?? [];
      const viaCourse = ids.find((id) => courseClassPairs.has(`${id}:${row.courseId}`));
      const shown = viaCourse ?? ids[0] ?? null;
      return {
        ...row,
        classIds: ids,
        className: shown ? (classNameById.get(shown) ?? null) : null,
      };
    }),
    classes,
    truncated,
    limit,
  };
}
