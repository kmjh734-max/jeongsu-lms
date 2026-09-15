import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { loadStudentDashboardCourses } from "@/lib/student/load-dashboard-courses";
import { PublishedBadge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/layout/NavIcon";

/** 수강 강좌 목록 */
export async function StudentDashboardContent() {
  const profile = await getCurrentProfile();
  const displayCourses = await loadStudentDashboardCourses(profile!.id);

  return (
    <div>
      <PageHeader
        title="수강 강좌"
        description={
          displayCourses.length > 0
            ? `배정된 강좌 ${displayCourses.length}개 · 영상을 90% 이상 보면 완료로 표시돼요.`
            : "학원에서 배정한 동영상 강좌를 봅니다."
        }
      />

      {displayCourses.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="text-slate-600">아직 배정된 강좌가 없어요.</p>
          <p className="mt-1 text-sm text-slate-500">
            학원에서 강좌를 배정하면 이곳에 보여요.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {displayCourses.map(
            ({ course, progressPercent, completedLessons, totalLessons, inProgress }) => {
              const finished = totalLessons > 0 && completedLessons >= totalLessons;
              return (
                <div
                  key={course.id}
                  className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card"
                >
                  <Link
                    href={`/student/courses/${course.id}`}
                    className="relative flex h-28 items-center justify-center bg-gradient-to-br from-side-active to-side text-white"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/15">
                      <Icon name="play" size={20} filled strokeWidth={1} />
                    </span>
                    {finished ? (
                      <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded bg-green-700 px-2 py-0.5 text-xs font-semibold">
                        <Icon name="check" size={12} strokeWidth={2.6} />
                        다 봤어요
                      </span>
                    ) : null}
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-900">{course.title ?? "제목 없음"}</h3>
                      {!course.is_published && <PublishedBadge published={false} />}
                    </div>
                    {course.description ? (
                      <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">{course.description}</p>
                    ) : null}
                    <div className="mt-auto pt-4">
                      <div className="mb-1.5 flex justify-between text-xs text-slate-500">
                        <span>
                          {completedLessons} / {totalLessons}강 완료
                        </span>
                        <span className="font-semibold tabular-nums text-slate-900">
                          {progressPercent}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${finished ? "bg-green-700" : "bg-brand-600"}`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <ButtonLink
                        href={`/student/courses/${course.id}`}
                        variant={finished ? "secondary" : "primary"}
                        className="mt-4 w-full"
                      >
                        {finished ? "다시 보기" : inProgress ? "이어서 학습" : "학습 시작"}
                      </ButtonLink>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}
