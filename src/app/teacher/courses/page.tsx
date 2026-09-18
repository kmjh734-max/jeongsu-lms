import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { CourseCardGrid } from "@/components/courses/CourseCardGrid";
import { loadCourseCards } from "@/lib/courses/course-cards";
import type { Course } from "@/types/database";

export default async function TeacherCoursesPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("teacher_id", profile!.id)
    .order("created_at", { ascending: false });
  const cards = await loadCourseCards(supabase, (courses ?? []) as Course[]);

  return (
    <div>
      <PageHeader
        title="동영상강좌 관리"
        description="담당 강좌의 영상과 공개 설정을 관리합니다."
        action={
          <ButtonLink href="/teacher/courses/new" variant="primary" size="sm">
            + 새 강좌
          </ButtonLink>
        }
      />
      <CourseCardGrid cards={cards} hrefBase="/teacher/courses" newHref="/teacher/courses/new" />
    </div>
  );
}
