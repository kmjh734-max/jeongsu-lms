import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { StudentLessonWatch } from "@/components/lessons/StudentLessonWatch";
import { assertLessonUnlockedForStudent } from "@/lib/lesson-progress/assert-lesson-unlocked";
import type { Lesson } from "@/types/database";

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

  const unlock = await assertLessonUnlockedForStudent(
    supabase,
    profile!.id,
    courseId,
    lessonId
  );
  if (!unlock.ok) {
    return (
      <div>
        <Link
          href={`/student/courses/${courseId}`}
          className="text-sm text-brand-600 hover:underline"
        >
          ← 영상 목록
        </Link>
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-6 py-8 text-center">
          <p className="font-semibold text-amber-900">{unlock.message}</p>
          <p className="mt-2 text-sm text-amber-800">
            순서대로 영상을 완료하면 다음 강의가 열립니다.
          </p>
          <Link
            href={`/student/courses/${courseId}`}
            className="mt-4 inline-block text-sm font-medium text-brand-700 hover:underline"
          >
            영상 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

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

  return (
    <div>
      <Link
        href={`/student/courses/${courseId}`}
        className="text-sm text-brand-600 hover:underline"
      >
        ← 영상 목록
      </Link>

      <h2 className="mt-4 text-xl font-semibold">{typedLesson.title}</h2>
      {typedLesson.description && (
        <p className="mt-2 text-sm text-slate-600">{typedLesson.description}</p>
      )}

      <div className="mt-6">
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
      </div>
    </div>
  );
}
