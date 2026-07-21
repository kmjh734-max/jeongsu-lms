import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildEnrollmentProgressRows,
  normalizeEnrollmentInputs,
  type EnrollmentProgressRow,
} from "@/lib/progress/enrollment-progress";
import type { Lesson, LessonProgress, Section } from "@/types/database";

const DEFAULT_ENROLLMENT_LIMIT = 400;

export async function loadProgressPageRows(
  supabase: SupabaseClient,
  options?: { teacherId?: string; enrollmentLimit?: number }
): Promise<EnrollmentProgressRow[]> {
  const limit = options?.enrollmentLimit ?? DEFAULT_ENROLLMENT_LIMIT;

  // enrollments는 academy_id가 없어, RLS가 적용된 courses로 먼저 범위를 좁힌다
  let courseQuery = supabase.from("courses").select("id");
  if (options?.teacherId) {
    courseQuery = courseQuery.eq("teacher_id", options.teacherId);
  }
  const { data: scopedCourses } = await courseQuery;
  const scopedCourseIds = (scopedCourses ?? []).map((c) => c.id as string);
  if (scopedCourseIds.length === 0) return [];

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(
      "student_id, course_id, student:profiles!enrollments_student_id_fkey(name, email), course:courses(title)"
    )
    .in("course_id", scopedCourseIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  const enrollmentList = enrollments ?? [];
  if (enrollmentList.length === 0) return [];

  const courseIds = [...new Set(enrollmentList.map((e) => e.course_id as string))];
  const studentIds = [...new Set(enrollmentList.map((e) => e.student_id as string))];

  const [{ data: sections }, { data: lessons }] = await Promise.all([
    supabase
      .from("sections")
      .select("id, course_id, order_index")
      .in("course_id", courseIds),
    supabase
      .from("lessons")
      .select("id, course_id, title, order_index, section_id, is_published")
      .in("course_id", courseIds),
  ]);

  const lessonIds = (lessons ?? []).map((l) => l.id as string);

  let progress: Pick<
    LessonProgress,
    | "student_id"
    | "lesson_id"
    | "is_completed"
    | "last_watched_at"
    | "completed_at"
    | "progress_percent"
    | "watched_seconds"
  >[] = [];

  if (lessonIds.length > 0 && studentIds.length > 0) {
    const chunkSize = 200;
    for (let i = 0; i < studentIds.length; i += chunkSize) {
      const studentChunk = studentIds.slice(i, i + chunkSize);
      const { data: chunk } = await supabase
        .from("lesson_progress")
        .select(
          "student_id, lesson_id, is_completed, last_watched_at, completed_at, progress_percent, watched_seconds"
        )
        .in("student_id", studentChunk)
        .in("lesson_id", lessonIds);
      progress = progress.concat(chunk ?? []);
    }
  }

  const rows = buildEnrollmentProgressRows(
    normalizeEnrollmentInputs(enrollmentList),
    (sections ?? []) as Pick<Section, "id" | "course_id" | "order_index">[],
    (lessons ?? []) as Pick<
      Lesson,
      "id" | "course_id" | "title" | "order_index" | "section_id" | "is_published"
    >[],
    progress
  );

  rows.sort((a, b) => {
    const name = a.studentName.localeCompare(b.studentName, "ko");
    if (name !== 0) return name;
    return a.courseTitle.localeCompare(b.courseTitle, "ko");
  });

  return rows;
}
