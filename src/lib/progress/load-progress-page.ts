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

  let enrollmentQuery = supabase
    .from("enrollments")
    .select(
      "student_id, course_id, student:profiles!enrollments_student_id_fkey(name, email), course:courses(title)"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (options?.teacherId) {
    const { data: courses } = await supabase
      .from("courses")
      .select("id")
      .eq("teacher_id", options.teacherId);

    const courseIds = (courses ?? []).map((c) => c.id);
    if (courseIds.length === 0) return [];
    enrollmentQuery = enrollmentQuery.in("course_id", courseIds);
  }

  const { data: enrollments } = await enrollmentQuery;
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
