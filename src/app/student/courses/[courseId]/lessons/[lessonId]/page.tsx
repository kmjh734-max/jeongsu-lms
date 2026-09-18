import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { StudentLessonWatch } from "@/components/lessons/StudentLessonWatch";
import { Icon } from "@/components/layout/NavIcon";
import { flattenCourseLessons } from "@/lib/courses/course-lessons";
import { formatDuration } from "@/lib/video/format-duration";
import { loadLessonVideoMeta } from "@/lib/video/video-meta";
import type { Lesson, Section } from "@/types/database";

interface PageProps {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default async function StudentLessonPage({ params }: PageProps) {
  const { courseId, lessonId } = await params;
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  // 한 번에 모두 가져온다 (차례로 부르면 화면이 늦게 뜬다)
  const [{ data: enrollment }, { data: course }, { data: sections }, { data: lessons }, { data: progressRows }] =
    await Promise.all([
      supabase.from("enrollments").select("id").eq("student_id", profile!.id).eq("course_id", courseId).maybeSingle(),
      supabase.from("courses").select("id, title").eq("id", courseId).maybeSingle(),
      supabase.from("sections").select("*").eq("course_id", courseId).order("order_index"),
      supabase.from("lessons").select("*").eq("course_id", courseId).eq("is_published", true).order("order_index"),
      supabase
        .from("lesson_progress")
        .select("lesson_id, is_completed, progress_percent, watched_seconds")
        .eq("student_id", profile!.id),
    ]);

  if (!enrollment) notFound();
  const flat = flattenCourseLessons((sections ?? []) as Section[], (lessons ?? []) as Lesson[]);
  const currentIndex = flat.findIndex((l) => l.id === lessonId);
  if (currentIndex < 0) notFound();
  const lesson = flat[currentIndex]!;

  const progressById = new Map((progressRows ?? []).map((p) => [p.lesson_id as string, p]));
  const progress = progressById.get(lessonId);
  const doneCount = flat.filter((l) => progressById.get(l.id)?.is_completed).length;
  const prev = flat[currentIndex - 1] ?? null;
  const next = flat[currentIndex + 1] ?? null;
  const hrefOf = (l: Lesson) => `/student/courses/${courseId}/lessons/${l.id}`;

  const meta = await loadLessonVideoMeta(flat);

  return (
    <div className="space-y-4">
      <Link
        href={`/student/courses/${courseId}`}
        className="inline-flex w-fit items-center gap-1 text-[13px] font-medium text-slate-500 hover:text-slate-900"
      >
        <Icon name="left" size={16} />
        {course?.title ?? "강의 목록"}
      </Link>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <div>
            <p className="text-xs font-bold text-brand-700">
              {currentIndex + 1}강 / 전체 {flat.length}강
              {meta[lesson.id]?.durationSeconds ? ` · ${formatDuration(meta[lesson.id]!.durationSeconds)}` : ""}
            </p>
            <h1 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900 sm:text-[22px]">{lesson.title}</h1>
            {lesson.description ? <p className="mt-1 text-sm text-slate-500">{lesson.description}</p> : null}
          </div>

          <StudentLessonWatch
            key={lessonId}
            lessonId={lessonId}
            title={lesson.title}
            videoProvider={lesson.video_provider}
            vimeoUrl={lesson.vimeo_url}
            vimeoVideoId={lesson.vimeo_video_id}
            youtubeUrl={lesson.youtube_url}
            youtubeVideoId={lesson.youtube_video_id}
            initialIsCompleted={progress?.is_completed ?? false}
            initialProgressPercent={typeof progress?.progress_percent === "number" ? progress.progress_percent : 0}
            initialWatchedSeconds={typeof progress?.watched_seconds === "number" ? progress.watched_seconds : 0}
            materialUrl={lesson.material_url}
            thumbnail={meta[lesson.id]?.thumbnail}
            durationLabel={formatDuration(meta[lesson.id]?.durationSeconds)}
            nextHref={next ? hrefOf(next) : null}
            nextTitle={next ? `${currentIndex + 2}강 ${next.title}` : null}
          />

          {prev || next ? (
            <div className="grid grid-cols-2 gap-2.5">
              {prev ? (
                <Link
                  href={hrefOf(prev)}
                  className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm hover:border-slate-300"
                >
                  <Icon name="left" size={16} className="shrink-0 text-slate-400" />
                  <span className="min-w-0">
                    <span className="block text-xs text-slate-500">이전 강의</span>
                    <span className="block truncate font-semibold text-slate-800">{prev.title}</span>
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  href={hrefOf(next)}
                  className="flex min-w-0 items-center justify-end gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-right text-sm hover:border-slate-300"
                >
                  <span className="min-w-0">
                    <span className="block text-xs text-slate-500">다음 강의</span>
                    <span className="block truncate font-semibold text-slate-800">{next.title}</span>
                  </span>
                  <Icon name="left" size={16} className="shrink-0 rotate-180 text-slate-400" />
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>

        {flat.length > 1 ? (
          <nav
            aria-label="강의 목록"
            className="rounded-xl border border-slate-200 bg-white p-2 shadow-card lg:sticky lg:top-[72px] lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto"
          >
            <div className="flex items-baseline justify-between px-2 pb-2 pt-1.5">
              <span className="text-sm font-bold text-slate-900">강의 목록</span>
              <span className="text-xs tabular-nums text-slate-500">
                {doneCount} / {flat.length} 완료
              </span>
            </div>
            <ul className="flex flex-col gap-1">
              {flat.map((l, i) => {
                const cur = l.id === lessonId;
                const p = progressById.get(l.id);
                const done = Boolean(p?.is_completed);
                const pct = typeof p?.progress_percent === "number" ? p.progress_percent : 0;
                const m = meta[l.id];
                return (
                  <li key={l.id}>
                    <Link
                      href={hrefOf(l)}
                      aria-current={cur ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-lg p-1.5 pr-2.5 text-[13px] transition ${
                        cur ? "bg-brand-50 ring-1 ring-brand-200" : "hover:bg-slate-50"
                      }`}
                    >
                      <span className="relative aspect-video w-[92px] shrink-0 overflow-hidden rounded-md bg-slate-800">
                        {m?.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.thumbnail} alt="" loading="lazy" className="h-full w-full object-cover" />
                        ) : null}
                        {m?.durationSeconds ? (
                          <span className="absolute bottom-0.5 right-0.5 rounded bg-black/75 px-1 text-[10px] font-semibold tabular-nums text-white">
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
                        <span className={`block text-[11px] font-bold ${cur ? "text-brand-700" : "text-slate-400"}`}>
                          {i + 1}강{cur ? " · 지금 보는 중" : ""}
                        </span>
                        <span
                          className={`line-clamp-2 leading-snug ${
                            cur ? "font-bold text-brand-800" : done ? "text-slate-500" : "font-medium text-slate-800"
                          }`}
                        >
                          {l.title}
                        </span>
                      </span>
                      {done ? (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-700 text-white">
                          <Icon name="check" size={11} strokeWidth={2.8} />
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
