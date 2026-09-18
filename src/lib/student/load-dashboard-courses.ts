import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { fetchPagesParallel } from "@/lib/fetch-pages";
import { calculateCourseProgress } from "@/lib/progress/calculate";
import type { Course, Lesson } from "@/types/database";

export interface StudentDashboardCourse {
  course: Course;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  inProgress: boolean;
  /** 이어서 볼 강의(다 봤으면 첫 강의) — 카드에서 바로 연다 */
  nextLesson: StudentNextLesson | null;
}

export type StudentNextLesson = Pick<
  Lesson,
  "id" | "title" | "video_provider" | "vimeo_url" | "vimeo_video_id" | "youtube_url" | "youtube_video_id"
> & { number: number };

function resolveCourseFromEnrollment(
  course: Course | Course[] | null | undefined,
  courseId: string | null | undefined
): Course | null {
  if (Array.isArray(course)) {
    const match = course.find((c) => c?.id);
    if (match?.id) return match;
  } else if (course && typeof course === "object" && course.id) {
    return course;
  }
  if (courseId) {
    return { id: courseId } as Course;
  }
  return null;
}

export const loadStudentDashboardCourses = cache(
  async (studentId: string): Promise<StudentDashboardCourse[]> => {
    const supabase = await createClient();

    type ProgressRow = {
      lesson_id: string;
      is_completed: boolean;
      progress_percent: number | null;
      watched_seconds: number | null;
    };

    // 내 진도는 강좌·영상 목록을 기다리지 않고 같이 읽고, 아래에서 이 강좌 영상만 찾아 쓴다
    const [{ data: enrollments }, myProgress] = await Promise.all([
      supabase
        .from("enrollments")
        .select(
          "course_id, course:courses(id, title, description, is_published, category)"
        )
        .eq("student_id", studentId),
      fetchPagesParallel<ProgressRow>((from, to, withCount) =>
        supabase
          .from("lesson_progress")
          .select(
            "lesson_id, is_completed, progress_percent, watched_seconds",
            withCount ? { count: "exact" } : undefined
          )
          .eq("student_id", studentId)
          .order("id")
          .range(from, to)
      ),
    ]);

    const validEnrollments = (enrollments ?? [])
      .map((enrollment) => {
        const course = resolveCourseFromEnrollment(
          enrollment.course as Course | Course[] | null | undefined,
          enrollment.course_id
        );
        if (!course?.id) return null;
        return { course, courseId: course.id };
      })
      .filter(
        (item): item is { course: Course; courseId: string } => item !== null
      );

    if (validEnrollments.length === 0) return [];

    const missingCourseIds = validEnrollments
      .filter((e) => !e.course.title)
      .map((e) => e.courseId);

    const courseIds = validEnrollments.map((e) => e.courseId);

    const [{ data: fallbackCourses }, { data: allLessons }] = await Promise.all([
      missingCourseIds.length > 0
        ? supabase
            .from("courses")
            .select("id, title, description, is_published, category")
            .in("id", missingCourseIds)
        : Promise.resolve({ data: [] as Course[] }),
      supabase
        .from("lessons")
        .select(
          "id, course_id, is_published, title, order_index, video_provider, vimeo_url, vimeo_video_id, youtube_url, youtube_video_id"
        )
        .in("course_id", courseIds)
        .eq("is_published", true)
        .order("order_index"),
    ]);

    const courseById = new Map(
      (fallbackCourses ?? []).map((c) => [c.id, c as Course])
    );

    const lessonsByCourse = new Map<
      string,
      Pick<Lesson, "id" | "is_published">[]
    >();
    for (const lesson of allLessons ?? []) {
      const list = lessonsByCourse.get(lesson.course_id) ?? [];
      list.push({ id: lesson.id, is_published: lesson.is_published });
      lessonsByCourse.set(lesson.course_id, list);
    }

    const allLessonIds = new Set((allLessons ?? []).map((l) => l.id as string));
    const progressByLesson = new Map(
      myProgress
        .filter((p) => allLessonIds.has(p.lesson_id))
        .map((p) => [p.lesson_id, p])
    );

    return validEnrollments
      .map(({ course, courseId }) => {
        const fullCourse = course.title
          ? course
          : (courseById.get(courseId) ?? course);

        const lessons = lessonsByCourse.get(courseId) ?? [];
        const progress = lessons.map(
          (l) =>
            progressByLesson.get(l.id) ?? {
              lesson_id: l.id,
              is_completed: false,
              progress_percent: 0,
              watched_seconds: 0,
            }
        );

        const stats = calculateCourseProgress(lessons, progress);
        const inProgress = progress.some(
          (p) => !p.is_completed && (p.progress_percent ?? 0) > 0
        );

        const ordered = (allLessons ?? []).filter((l) => l.course_id === courseId);
        const nextIdx = ordered.findIndex((l) => !progressByLesson.get(l.id as string)?.is_completed);
        const pick = ordered[nextIdx >= 0 ? nextIdx : 0];
        const nextLesson: StudentNextLesson | null = pick
          ? {
              id: pick.id as string,
              title: pick.title as string,
              video_provider: pick.video_provider,
              vimeo_url: pick.vimeo_url,
              vimeo_video_id: pick.vimeo_video_id,
              youtube_url: pick.youtube_url,
              youtube_video_id: pick.youtube_video_id,
              number: (nextIdx >= 0 ? nextIdx : 0) + 1,
            }
          : null;

        return { course: fullCourse, inProgress, nextLesson, ...stats };
      })
      .filter((item) => item.course?.id);
  }
);
