import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { loadStudentDashboardCourses } from "@/lib/student/load-dashboard-courses";
import { formatDuration } from "@/lib/video/format-duration";
import { loadLessonVideoMeta } from "@/lib/video/video-meta";
import { PublishedBadge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/layout/NavIcon";

/** 수강 강좌 목록 */
export async function StudentDashboardContent() {
  const profile = await getCurrentProfile();
  const displayCourses = await loadStudentDashboardCourses(profile!.id);
  const meta = await loadLessonVideoMeta(
    displayCourses.flatMap((c) => (c.nextLesson ? [c.nextLesson] : []))
  );

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
            ({ course, progressPercent, completedLessons, totalLessons, inProgress, nextLesson }) => {
              const finished = totalLessons > 0 && completedLessons >= totalLessons;
              const nm = nextLesson ? meta[nextLesson.id] : undefined;
              const watchHref = nextLesson
                ? `/student/courses/${course.id}/lessons/${nextLesson.id}`
                : `/student/courses/${course.id}`;
              return (
                <div
                  key={course.id}
                  className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card"
                >
                  <Link
                    href={watchHref}
                    className="group relative flex aspect-video items-center justify-center overflow-hidden bg-gradient-to-br from-side-active to-side text-white"
                  >
                    {nm?.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={nm.thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-[1.02]" />
                    ) : null}
                    <span className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
                    <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow">
                      <Icon name="play" size={20} filled strokeWidth={1} />
                    </span>
                    {nextLesson && !finished ? (
                      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 text-left">
                        <span className="min-w-0 truncate text-[13px] font-semibold">
                          {inProgress || completedLessons > 0 ? "이어서 · " : ""}
                          {nextLesson.number}강 {nextLesson.title}
                        </span>
                        {nm?.durationSeconds ? (
                          <span className="shrink-0 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums">
                            {formatDuration(nm.durationSeconds)}
                          </span>
                        ) : null}
                      </span>
                    ) : null}
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
                      <div className="mt-4 flex gap-2">
                        <ButtonLink
                          href={watchHref}
                          variant={finished ? "secondary" : "primary"}
                          className="flex-1"
                        >
                          {finished ? "다시 보기" : inProgress || completedLessons > 0 ? "이어서 보기" : "1강부터 보기"}
                        </ButtonLink>
                        <ButtonLink href={`/student/courses/${course.id}`} variant="secondary">
                          강의 목록
                        </ButtonLink>
                      </div>
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
