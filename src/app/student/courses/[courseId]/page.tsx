import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { calculateCourseProgress } from "@/lib/progress/calculate";
import { flattenCourseLessons } from "@/lib/courses/course-lessons";
import { formatDuration } from "@/lib/video/format-duration";
import { loadLessonVideoMeta } from "@/lib/video/video-meta";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/layout/NavIcon";
import type { Course, Lesson, Section } from "@/types/database";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default async function StudentCoursePage({ params }: PageProps) {
  const { courseId } = await params;
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  // 한 번에 모두 가져온다
  const [{ data: enrollment }, { data: course }, { data: sections }, { data: lessons }, { data: progress }] =
    await Promise.all([
      supabase.from("enrollments").select("id").eq("student_id", profile!.id).eq("course_id", courseId).maybeSingle(),
      supabase.from("courses").select("*").eq("id", courseId).maybeSingle(),
      supabase.from("sections").select("*").eq("course_id", courseId).order("order_index"),
      supabase.from("lessons").select("*").eq("course_id", courseId).eq("is_published", true).order("order_index"),
      supabase
        .from("lesson_progress")
        .select("lesson_id, is_completed, progress_percent")
        .eq("student_id", profile!.id),
    ]);

  if (!enrollment || !course) notFound();

  const lessonList = (lessons ?? []) as Lesson[];
  const flatLessons = flattenCourseLessons((sections ?? []) as Section[], lessonList);
  const lessonIds = new Set(flatLessons.map((l) => l.id));
  const myProgress = (progress ?? []).filter((p) => lessonIds.has(p.lesson_id as string));
  const progressMap = new Map(myProgress.map((p) => [p.lesson_id as string, p]));
  const stats = calculateCourseProgress(lessonList, myProgress);
  const meta = await loadLessonVideoMeta(flatLessons);

  const nextIndex = flatLessons.findIndex((l) => !progressMap.get(l.id)?.is_completed);
  const nextLesson = nextIndex >= 0 ? flatLessons[nextIndex] : flatLessons[0];
  const totalSeconds = flatLessons.reduce((s, l) => s + (meta[l.id]?.durationSeconds ?? 0), 0);
  const typedCourse = course as Course;

  return (
    <div className="space-y-5">
      <Link
        href="/student/courses"
        className="inline-flex w-fit items-center gap-1 text-[13px] font-medium text-slate-500 hover:text-slate-900"
      >
        <Icon name="left" size={16} />
        수강 강좌
      </Link>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
        <div className="p-5">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-[22px]">{typedCourse.title}</h1>
          {typedCourse.description ? <p className="mt-1 text-sm text-slate-500">{typedCourse.description}</p> : null}
          <p className="mt-2 text-xs text-slate-500">
            전체 {flatLessons.length}강{totalSeconds > 0 ? ` · 총 ${formatDuration(totalSeconds)}` : ""}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-brand-600" style={{ width: `${stats.progressPercent}%` }} />
            </div>
            <span className="shrink-0 text-sm font-bold tabular-nums text-slate-900">
              {stats.completedLessons}/{stats.totalLessons}강 · {stats.progressPercent}%
            </span>
          </div>
          {nextLesson ? (
            <ButtonLink href={`/student/courses/${courseId}/lessons/${nextLesson.id}`} className="mt-4 h-11 w-full sm:w-auto sm:px-6">
              <Icon name="play" size={14} filled strokeWidth={1} />
              {stats.completedLessons === 0
                ? "1강부터 보기"
                : nextIndex >= 0
                  ? `${nextIndex + 1}강 이어서 보기`
                  : "처음부터 다시 보기"}
            </ButtonLink>
          ) : null}
        </div>
      </section>

      {flatLessons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-600">
          <p>아직 올라온 강의가 없어요.</p>
          <p className="mt-1 text-slate-500">강의가 올라오면 여기에 보여요.</p>
        </div>
      ) : (
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {flatLessons.map((lesson, index) => {
            const p = progressMap.get(lesson.id);
            const done = Boolean(p?.is_completed);
            const pct = typeof p?.progress_percent === "number" ? p.progress_percent : 0;
            const isNext = index === nextIndex;
            const m = meta[lesson.id];
            return (
              <li key={lesson.id}>
                <Link
                  href={`/student/courses/${courseId}/lessons/${lesson.id}`}
                  className={`flex items-center gap-3 rounded-xl border bg-white p-2 pr-3 transition hover:border-slate-300 ${
                    isNext ? "border-brand-300 ring-1 ring-brand-200" : "border-slate-200"
                  }`}
                >
                  <span className="relative aspect-video w-[120px] shrink-0 overflow-hidden rounded-lg bg-slate-800">
                    {m?.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.thumbnail} alt="" loading="lazy" className="h-full w-full object-cover" />
                    ) : null}
                    {m?.durationSeconds ? (
                      <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1 text-[10px] font-semibold tabular-nums text-white">
                        {formatDuration(m.durationSeconds)}
                      </span>
                    ) : null}
                    {!done && pct > 0 ? (
                      <span className="absolute inset-x-0 bottom-0 h-[3px] bg-white/30">
                        <span className="block h-full bg-brand-500" style={{ width: `${Math.min(100, pct)}%` }} />
                      </span>
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-xs font-bold ${isNext ? "text-brand-700" : "text-slate-400"}`}>
                      {index + 1}강{isNext ? " · 다음에 볼 강의" : ""}
                    </span>
                    <span className={`mt-0.5 line-clamp-2 text-sm leading-snug ${done ? "text-slate-500" : "font-semibold text-slate-900"}`}>
                      {lesson.title}
                    </span>
                    <span
                      className={`mt-1 block text-xs font-semibold ${
                        done ? "text-green-700" : pct > 0 ? "text-brand-700" : "text-slate-400"
                      }`}
                    >
                      {done ? "✓ 완료" : pct > 0 ? `${pct}% 봄` : "아직 안 봄"}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
