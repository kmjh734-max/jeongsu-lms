import type { SupabaseClient } from "@supabase/supabase-js";
import { flattenCourseLessons } from "@/lib/courses/course-lessons";
import { isLessonUnlocked } from "@/lib/lesson-progress/lesson-unlock";
import type { Lesson, Section } from "@/types/database";

/** 학생이 해당 강의를 시청·진도 저장할 수 있는지 (순차 수강) */
export async function assertLessonUnlockedForStudent(
  supabase: SupabaseClient,
  studentId: string,
  courseId: string,
  lessonId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const [{ data: sections }, { data: lessons }, { data: progress }] =
    await Promise.all([
      supabase
        .from("sections")
        .select("id, course_id, order_index")
        .eq("course_id", courseId),
      supabase
        .from("lessons")
        .select("id, course_id, title, order_index, section_id, is_published")
        .eq("course_id", courseId)
        .eq("is_published", true),
      supabase
        .from("lesson_progress")
        .select("lesson_id, is_completed")
        .eq("student_id", studentId),
    ]);

  const flat = flattenCourseLessons(
    (sections ?? []) as Section[],
    (lessons ?? []) as Lesson[]
  );
  const orderedIds = flat.map((l) => l.id);
  if (!orderedIds.includes(lessonId)) {
    return { ok: false, message: "수강할 수 없는 영상입니다." };
  }

  const completed = new Set(
    (progress ?? [])
      .filter((p) => p.is_completed)
      .map((p) => p.lesson_id as string)
  );

  if (!isLessonUnlocked(orderedIds, completed, lessonId)) {
    return {
      ok: false,
      message: "이전 영상을 완료한 후 시청할 수 있습니다.",
    };
  }

  return { ok: true };
}
