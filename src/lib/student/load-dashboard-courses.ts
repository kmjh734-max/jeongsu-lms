import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { calculateCourseProgress } from "@/lib/progress/calculate";
import type { Course, Lesson } from "@/types/database";

export interface StudentDashboardCourse {
  course: Course;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  inProgress: boolean;
}

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

    const { data: enrollments } = await supabase
      .from("enrollments")
      .select(
        "course_id, course:courses(id, title, description, is_published)"
      )
      .eq("student_id", studentId);

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
            .select("id, title, description, is_published")
            .in("id", missingCourseIds)
        : Promise.resolve({ data: [] as Course[] }),
      supabase
        .from("lessons")
        .select("id, course_id, is_published")
        .in("course_id", courseIds)
        .eq("is_published", true),
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

    const allLessonIds = (allLessons ?? []).map((l) => l.id);
    const { data: allProgress } =
      allLessonIds.length > 0
        ? await supabase
            .from("lesson_progress")
            .select(
              "lesson_id, is_completed, progress_percent, watched_seconds"
            )
            .eq("student_id", studentId)
            .in("lesson_id", allLessonIds)
        : {
            data: [] as {
              lesson_id: string;
              is_completed: boolean;
              progress_percent: number | null;
              watched_seconds: number | null;
            }[],
          };

    const progressByLesson = new Map(
      (allProgress ?? []).map((p) => [p.lesson_id, p])
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

        return { course: fullCourse, inProgress, ...stats };
      })
      .filter((item) => item.course?.id);
  }
);
