import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { CoursesBrowser, CoursesEmptyState } from "@/components/courses/CoursesBrowser";
import { loadCoursesPage, type CourseScope } from "@/lib/courses/load-courses-page";
import { purgeExpiredTrash } from "@/lib/courses/manage";

/** ?보기=보관함 · ?보기=휴지통 */
function scopeOf(v: string | undefined): CourseScope {
  return v === "보관함" ? "archived" : v === "휴지통" ? "trash" : "alive";
}

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ 보기?: string }>;
}) {
  const { 보기 } = await searchParams;
  const scope = scopeOf(보기);

  const profile = await getCurrentProfile();
  // 휴지통을 열 때 30일 지난 것을 비운다(따로 도는 일감이 없어 여기서 함께 한다)
  if (scope === "trash" && profile?.academy_id) {
    await purgeExpiredTrash(profile.academy_id);
  }

  const supabase = await createClient();
  const data = await loadCoursesPage(supabase, { scope });
  const nothingAtAll = data.counts.alive + data.counts.archived + data.counts.trash === 0;

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
      {nothingAtAll ? (
        <CoursesEmptyState newHref="/admin/courses/new" />
      ) : (
        <CoursesBrowser
          cards={data.cards}
          folders={data.folders}
          counts={data.counts}
          scope={scope}
          basePath="/admin/courses"
          canPurge
          showTeacher
        />
      )}
    </div>
  );
}
