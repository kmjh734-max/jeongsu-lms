import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { resolveLessonTeacherId } from "@/lib/courses/resolve-lesson-teacher-id";
import { flattenCourseLessons } from "@/lib/courses/course-lessons";
import { unwrapRelation } from "@/lib/progress/enrollment-progress";
import { loadLessonVideoMeta } from "@/lib/video/video-meta";
import { loadCourseCategories } from "@/lib/courses/course-categories";
import { CourseManageView } from "@/components/courses/CourseManageView";
import type { Course, Lesson, Section } from "@/types/database";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default async function TeacherCoursePage({ params }: PageProps) {
  const { courseId } = await params;
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  // 담당 강좌 확인과 목록 읽기를 한 번에
  const [{ data: course }, { data: sections }, { data: lessons, error: lessonsError }, { data: enrollments }] =
    await Promise.all([
      supabase.from("courses").select("*").eq("id", courseId).eq("teacher_id", profile!.id).maybeSingle(),
      supabase.from("sections").select("*").eq("course_id", courseId).order("order_index"),
      supabase.from("lessons").select("*").eq("course_id", courseId).order("order_index"),
      supabase
        .from("enrollments")
        .select("student_id, student:profiles!enrollments_student_id_fkey(name, username)")
        .eq("course_id", courseId),
    ]);

  if (!course) notFound();
  const typedCourse = course as Course;
  const flatLessons = flattenCourseLessons((sections ?? []) as Section[], (lessons ?? []) as Lesson[]);
  const [meta, categories] = await Promise.all([loadLessonVideoMeta(flatLessons), loadCourseCategories(supabase)]);

  return (
    <CourseManageView
      variant="teacher"
      course={typedCourse}
      lessons={flatLessons}
      meta={meta}
      students={(enrollments ?? []).map((e) => {
        const s = unwrapRelation(e.student as unknown as { name: string | null; username: string | null } | null);
        return { id: e.student_id as string, name: s?.name ?? null, username: s?.username ?? null };
      })}
      lessonTeacherId={resolveLessonTeacherId(typedCourse.teacher_id, profile!.id)}
      listHref="/teacher/courses"
      lessonsError={lessonsError?.message ?? null}
      categories={categories}
    />
  );
}
