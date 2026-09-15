import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { StudentLessonWatch } from "@/components/lessons/StudentLessonWatch";
import { Icon } from "@/components/layout/NavIcon";
import { flattenCourseLessons } from "@/lib/courses/course-lessons";
import type { Lesson, Section } from "@/types/database";

interface PageProps {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default async function StudentLessonPage({ params }: PageProps) {
  const { courseId, lessonId } = await params;
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", profile!.id)
    .eq("course_id", courseId)
    .maybeSingle();

  if (!enrollment) notFound();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .eq("course_id", courseId)
    .eq("is_published", true)
    .single();

  if (!lesson) notFound();

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("is_completed, progress_percent, watched_seconds")
    .eq("student_id", profile!.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  const typedLesson = lesson as Lesson;
  const isCompleted = progress?.is_completed ?? false;
  const progressPercent =
    progress &&
    "progress_percent" in progress &&
    typeof progress.progress_percent === "number"
      ? progress.progress_percent
      : 0;

  const [{ data: course }, { data: sections }, { data: lessons }] = await Promise.all([
    supabase.from("courses").select("id, title").eq("id", courseId).maybeSingle(),
    supabase.from("sections").select("*").eq("course_id", courseId).order("order_index"),
    supabase
      .from("lessons")
      .select("*")
      .eq("course_id", courseId)
      .eq("is_published", true)
      .order("order_index"),
  ]);
  const flat = flattenCourseLessons((sections ?? []) as Section[], (lessons ?? []) as Lesson[]);
  const { data: allProgress } =
    flat.length > 0
      ? await supabase
          .from("lesson_progress")
          .select("lesson_id, is_completed")
          .eq("student_id", profile!.id)
          .in(
            "lesson_id",
            flat.map((l) => l.id)
          )
      : { data: [] as { lesson_id: string; is_completed: boolean }[] };
  const doneIds = new Set((allProgress ?? []).filter((p) => p.is_completed).map((p) => p.lesson_id));
  const currentIndex = flat.findIndex((l) => l.id === lessonId);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2.5">
        <Link
          href={`/student/courses/${courseId}`}
          className="inline-flex w-fit items-center gap-1 text-[13px] font-medium text-slate-500 hover:text-slate-900"
        >
          <Icon name="left" size={16} />
          {course?.title ?? "영상 목록"}
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-[22px]">
            {currentIndex >= 0 ? `${currentIndex + 1}강 ` : ""}
            {typedLesson.title}
          </h1>
          {typedLesson.description && (
            <p className="mt-1 text-sm text-slate-500">{typedLesson.description}</p>
          )}
        </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <StudentLessonWatch
          lessonId={lessonId}
          title={typedLesson.title}
          videoProvider={typedLesson.video_provider}
          vimeoUrl={typedLesson.vimeo_url}
          vimeoVideoId={typedLesson.vimeo_video_id}
          youtubeUrl={typedLesson.youtube_url}
          youtubeVideoId={typedLesson.youtube_video_id}
          initialIsCompleted={isCompleted}
          initialProgressPercent={progressPercent}
          initialWatchedSeconds={
            progress &&
            "watched_seconds" in progress &&
            typeof progress.watched_seconds === "number"
              ? progress.watched_seconds
              : 0
          }
          materialUrl={typedLesson.material_url}
        />

        {flat.length > 1 ? (
          <nav
            aria-label="강의 목록"
            className="rounded-lg border border-slate-200 bg-white p-2 shadow-card lg:sticky lg:top-[72px] lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto"
          >
            <div className="flex items-baseline justify-between px-2.5 pb-2 pt-1.5">
              <span className="text-sm font-bold text-slate-900">강의 목록</span>
              <span className="text-xs tabular-nums text-slate-500">
                {doneIds.size} / {flat.length} 완료
              </span>
            </div>
            <ul className="flex flex-col gap-0.5">
              {flat.map((l, i) => {
                const cur = l.id === lessonId;
                const done = doneIds.has(l.id);
                return (
                  <li key={l.id}>
                    <Link
                      href={`/student/courses/${courseId}/lessons/${l.id}`}
                      aria-current={cur ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-md px-2.5 py-2.5 text-[13px] transition ${
                        cur ? "bg-brand-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full ${
                          done
                            ? "bg-green-700 text-white"
                            : cur
                              ? "bg-brand-600 text-white"
                              : "border-[1.5px] border-slate-300"
                        }`}
                      >
                        {done ? (
                          <Icon name="check" size={12} strokeWidth={2.6} />
                        ) : cur ? (
                          <Icon name="play" size={9} filled strokeWidth={1} />
                        ) : null}
                      </span>
                      <span
                        className={`min-w-0 flex-1 truncate ${
                          cur ? "font-bold text-brand-700" : done ? "text-slate-500" : "font-medium text-slate-800"
                        }`}
                      >
                        {i + 1}강 {l.title}
                      </span>
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
