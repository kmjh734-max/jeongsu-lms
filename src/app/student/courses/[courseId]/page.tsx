import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { calculateCourseProgress } from "@/lib/progress/calculate";
import { flattenCourseLessons } from "@/lib/courses/course-lessons";
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

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", profile!.id)
    .eq("course_id", courseId)
    .maybeSingle();

  if (!enrollment) notFound();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  if (!course) notFound();

  const [{ data: sections }, { data: lessons }] = await Promise.all([
    supabase
      .from("sections")
      .select("*")
      .eq("course_id", courseId)
      .order("order_index"),
    supabase
      .from("lessons")
      .select("*")
      .eq("course_id", courseId)
      .eq("is_published", true)
      .order("order_index"),
  ]);

  const sectionList = (sections ?? []) as Section[];
  const lessonList = (lessons ?? []) as Lesson[];
  const flatLessons = flattenCourseLessons(sectionList, lessonList);
  const lessonIds = flatLessons.map((l) => l.id);

  const { data: progress } =
    lessonIds.length > 0
      ? await supabase
          .from("lesson_progress")
          .select("lesson_id, is_completed")
          .eq("student_id", profile!.id)
          .in("lesson_id", lessonIds)
      : { data: [] as { lesson_id: string; is_completed: boolean }[] };
  const progressMap = new Map(
    (progress ?? []).map((p) => [p.lesson_id, p.is_completed])
  );

  const stats = calculateCourseProgress(lessonList, progress ?? []);

  const nextIndex = flatLessons.findIndex((l) => !progressMap.get(l.id));
  const nextLesson = nextIndex >= 0 ? flatLessons[nextIndex] : flatLessons[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2.5">
        <Link
          href="/student/courses"
          className="inline-flex w-fit items-center gap-1 text-[13px] font-medium text-slate-500 hover:text-slate-900"
        >
          <Icon name="left" size={16} />
          수강 강좌
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-[22px]">
              {(course as Course).title}
            </h1>
            {(course as Course).description ? (
              <p className="mt-1 text-sm text-slate-500">{(course as Course).description}</p>
            ) : null}
          </div>
          {nextLesson ? (
            <ButtonLink
              href={`/student/courses/${courseId}/lessons/${nextLesson.id}`}
              className="h-10 shrink-0 px-5"
            >
              <Icon name="play" size={14} filled strokeWidth={1} />
              {stats.completedLessons === 0
                ? "1강부터 보기"
                : nextIndex >= 0
                  ? `${nextIndex + 1}강 이어서 보기`
                  : "처음부터 다시 보기"}
            </ButtonLink>
          ) : null}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <span className="text-slate-500">
            {stats.completedLessons} / {stats.totalLessons}강 완료
          </span>
          <span className="font-bold tabular-nums text-slate-900">{stats.progressPercent}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brand-600"
            style={{ width: `${stats.progressPercent}%` }}
          />
        </div>
      </div>

      {flatLessons.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-600">
          <p>공개된 강의 영상이 없어요.</p>
          <p className="mt-1 text-slate-500">
            선생님께 영상 「학생에게 공개」 여부와 수강 배정을 확인해 주세요.
          </p>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card">
          {flatLessons.map((lesson, index) => {
            const done = progressMap.get(lesson.id);
            const isNext = index === nextIndex;
            return (
              <li key={lesson.id} className="border-t border-slate-100 first:border-t-0">
                <Link
                  href={`/student/courses/${courseId}/lessons/${lesson.id}`}
                  className={`flex items-center gap-3 px-4 py-3.5 text-sm transition hover:bg-slate-50 sm:px-5 ${
                    isNext ? "bg-brand-50/60" : ""
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      done
                        ? "bg-green-700 text-white"
                        : isNext
                          ? "bg-brand-600 text-white"
                          : "border-[1.5px] border-slate-300"
                    }`}
                  >
                    {done ? (
                      <Icon name="check" size={13} strokeWidth={2.6} />
                    ) : isNext ? (
                      <Icon name="play" size={10} filled strokeWidth={1} />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    <span className={`font-semibold ${isNext ? "text-brand-700" : "text-slate-900"}`}>
                      {index + 1}강
                    </span>{" "}
                    <span className={done ? "text-slate-500" : isNext ? "font-semibold text-brand-700" : "text-slate-800"}>
                      {lesson.title}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 text-xs font-semibold ${
                      done ? "text-green-700" : isNext ? "text-brand-700" : "text-slate-400"
                    }`}
                  >
                    {done ? "완료" : isNext ? "다음 강의" : "안 봄"}
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
