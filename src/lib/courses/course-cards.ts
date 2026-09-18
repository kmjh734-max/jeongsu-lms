import type { SupabaseClient } from "@supabase/supabase-js";
import { loadLessonVideoMeta } from "@/lib/video/video-meta";
import type { Course } from "@/types/database";

export type CourseCard = {
  course: Course;
  teacherName: string | null;
  lessonCount: number;
  studentCount: number;
  thumbnail: string | null;
  totalSeconds: number;
};

/** 강좌 목록 카드용: 영상 수·수강생 수·첫 영상 그림·전체 길이를 한 번에 모은다 */
export async function loadCourseCards(
  supabase: SupabaseClient,
  courses: (Course & { teacher?: { name: string | null } | null })[]
): Promise<CourseCard[]> {
  const ids = courses.map((c) => c.id);
  if (ids.length === 0) return [];
  const [{ data: lessons }, { data: enrollments }] = await Promise.all([
    supabase
      .from("lessons")
      .select("id, course_id, order_index, video_provider, vimeo_url, vimeo_video_id, youtube_url, youtube_video_id")
      .in("course_id", ids)
      .order("order_index"),
    supabase.from("enrollments").select("course_id").in("course_id", ids),
  ]);
  const rows = lessons ?? [];
  const meta = await loadLessonVideoMeta(rows as { id: string }[]);
  return courses.map((course) => {
    const mine = rows.filter((l) => l.course_id === course.id);
    return {
      course,
      teacherName: course.teacher?.name ?? null,
      lessonCount: mine.length,
      studentCount: (enrollments ?? []).filter((e) => e.course_id === course.id).length,
      thumbnail: mine.map((l) => meta[l.id as string]?.thumbnail).find(Boolean) ?? null,
      totalSeconds: mine.reduce((s, l) => s + (meta[l.id as string]?.durationSeconds ?? 0), 0),
    };
  });
}
