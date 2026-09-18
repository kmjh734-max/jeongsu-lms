import Link from "next/link";
import { CourseSettingsForm } from "@/components/courses/CourseSettingsForm";
import { CourseStudentVisibilityBanner } from "@/components/courses/CourseStudentVisibilityBanner";
import { CourseVideoManager } from "@/components/courses/CourseVideoManager";
import { Icon } from "@/components/layout/NavIcon";
import { formatDuration } from "@/lib/video/format-duration";
import type { VideoMeta } from "@/lib/video/video-meta";
import type { Course, Lesson, Profile } from "@/types/database";

type Student = { id: string; name: string | null; username: string | null };

/** 강좌 관리 화면 (관리자·선생님 공통): 왼쪽 영상, 오른쪽 설정·수강생 */
export function CourseManageView({
  variant,
  course,
  lessons,
  meta,
  students,
  teachers,
  lessonTeacherId,
  listHref,
  studentsHref,
  lessonsError,
  categories = [],
}: {
  variant: "admin" | "teacher";
  course: Course;
  lessons: Lesson[];
  meta: Record<string, VideoMeta>;
  students: Student[];
  teachers?: Profile[];
  lessonTeacherId: string;
  listHref: string;
  studentsHref?: string;
  lessonsError?: string | null;
  categories?: string[];
}) {
  const published = lessons.filter((l) => l.is_published).length;
  const totalSeconds = lessons.reduce((s, l) => s + (meta[l.id]?.durationSeconds ?? 0), 0);

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={listHref}
          className="inline-flex items-center gap-1 text-[13px] font-medium text-slate-500 hover:text-slate-900"
        >
          <Icon name="left" size={16} />
          강좌 목록
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {course.category ? (
            <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">{course.category}</span>
          ) : null}
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-[22px]">{course.title}</h1>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              course.is_published ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
            }`}
          >
            {course.is_published ? "공개 중" : "비공개"}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          영상 {lessons.length}개{published < lessons.length ? ` (공개 ${published})` : ""}
          {totalSeconds > 0 ? ` · 총 ${formatDuration(totalSeconds)}` : ""} · 수강생 {students.length}명
        </p>
      </div>

      <CourseStudentVisibilityBanner
        courseId={course.id}
        courseTitle={course.title}
        courseIsPublished={course.is_published}
        publishedLessonCount={published}
        totalLessonCount={lessons.length}
        enrollmentCount={students.length}
      />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          {lessonsError ? (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              영상 목록을 불러오지 못했어요: {lessonsError}
            </p>
          ) : null}
          <CourseVideoManager
            courseId={course.id}
            teacherId={lessonTeacherId}
            lessons={lessons}
            apiVariant={variant}
            meta={meta}
          />
        </section>

        <div className="space-y-5 lg:sticky lg:top-[72px]">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-slate-900">강좌 설정</h2>
            <CourseSettingsForm
              variant={variant}
              course={course}
              teachers={teachers}
              listHref={listHref}
              categories={categories}
            />
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="text-sm font-bold text-slate-900">수강생 {students.length}명</h2>
              {studentsHref ? (
                <Link href={studentsHref} className="text-xs font-semibold text-brand-700 hover:underline">
                  배정하기
                </Link>
              ) : null}
            </div>
            {students.length === 0 ? (
              <p className="rounded-lg bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
                아직 배정된 학생이 없어요. 반에 강좌를 넣거나 학생에게 직접 배정하세요.
              </p>
            ) : (
              <ul className="flex flex-wrap gap-1.5">
                {students.map((s) => (
                  <li key={s.id} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {s.name ?? s.username ?? "학생"}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
