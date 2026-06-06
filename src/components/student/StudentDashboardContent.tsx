import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { loadStudentDashboardCourses } from "@/lib/student/load-dashboard-courses";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PublishedBadge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";

export async function StudentDashboardContent() {
  const profile = await getCurrentProfile();
  const displayCourses = await loadStudentDashboardCourses(profile!.id);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${profile!.name}님, 안녕하세요`}
        description="오늘도 차근차근 학습해 볼까요?"
      />

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">
            수강 중인 강좌
          </h2>
          {displayCourses.length > 0 && (
            <span className="text-sm text-slate-500">
              {displayCourses.length}개 강좌
            </span>
          )}
        </div>

        {displayCourses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <p className="text-slate-600">아직 배정된 강좌가 없습니다.</p>
            <p className="mt-1 text-sm text-slate-500">
              학원에서 강좌 배정 후 이곳에 표시됩니다.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {displayCourses.map(
              ({
                course,
                progressPercent,
                completedLessons,
                totalLessons,
                inProgress,
              }) => (
                <div
                  key={course.id}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">
                      {course.title ?? "제목 없음"}
                    </h3>
                    {!course.is_published && (
                      <PublishedBadge published={false} />
                    )}
                  </div>
                  {course.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                      {course.description}
                    </p>
                  )}
                  <div className="mt-4">
                    <ProgressBar
                      percent={progressPercent}
                      label={`${completedLessons} / ${totalLessons} 영상 완료`}
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <ButtonLink
                      href={`/student/courses/${course.id}`}
                      variant="primary"
                      size="sm"
                    >
                      {inProgress ? "이어서 학습" : "학습하기"}
                    </ButtonLink>
                    <Link
                      href={`/student/courses/${course.id}`}
                      className="inline-flex h-8 items-center rounded-lg px-3 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      영상 목록
                    </Link>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}
