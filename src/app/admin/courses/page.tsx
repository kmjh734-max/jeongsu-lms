import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { CourseCardGrid } from "@/components/courses/CourseCardGrid";
import { loadCourseCards } from "@/lib/courses/course-cards";
import type { Course } from "@/types/database";

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*, teacher:profiles!courses_teacher_id_fkey(name)")
    .order("created_at", { ascending: false });
  const cards = await loadCourseCards(
    supabase,
    (courses ?? []) as (Course & { teacher: { name: string | null } | null })[]
  );

  return (
    <div>
      <PageHeader
        title="동영상강좌 관리"
        description="강좌를 만들고 영상을 올리면 학생이 휴대폰으로 보고, 본 만큼 기록됩니다."
        action={
          <ButtonLink href="/admin/courses/new" variant="primary" size="sm">
            + 새 강좌
          </ButtonLink>
        }
      />
      <CourseCardGrid cards={cards} hrefBase="/admin/courses" newHref="/admin/courses/new" showTeacher />
    </div>
  );
}
