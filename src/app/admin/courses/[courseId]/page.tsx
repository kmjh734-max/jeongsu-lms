import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { resolveLessonTeacherId } from "@/lib/courses/resolve-lesson-teacher-id";
import { flattenCourseLessons } from "@/lib/courses/course-lessons";
import { unwrapRelation } from "@/lib/progress/enrollment-progress";
import { loadLessonVideoMeta } from "@/lib/video/video-meta";
import { CourseManageView } from "@/components/courses/CourseManageView";
import type { Course, Lesson, Profile, Section } from "@/types/database";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default async function AdminCourseDetailPage({ params }: PageProps) {
  const { courseId } = await params;
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const [
    { data: course },
    { data: teachers },
    { data: sections },
    { data: lessons, error: lessonsError },
    { data: enrollments },
  ] = await Promise.all([
    supabase.from("courses").select("*").eq("id", courseId).single(),
    supabase.from("profiles").select("*").eq("role", "teacher").eq("is_active", true).order("name"),
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
  const meta = await loadLessonVideoMeta(flatLessons);

  return (
    <CourseManageView
      variant="admin"
      course={typedCourse}
      lessons={flatLessons}
      meta={meta}
      students={(enrollments ?? []).map((e) => {
        const s = unwrapRelation(e.student as unknown as { name: string | null; username: string | null } | null);
        return { id: e.student_id as string, name: s?.name ?? null, username: s?.username ?? null };
      })}
      teachers={(teachers ?? []) as Profile[]}
      lessonTeacherId={resolveLessonTeacherId(typedCourse.teacher_id, profile!.id)}
      listHref="/admin/courses"
      studentsHref="/admin/classes"
      lessonsError={lessonsError?.message ?? null}
    />
  );
}
