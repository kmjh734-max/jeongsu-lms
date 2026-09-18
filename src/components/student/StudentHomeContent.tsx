import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import {
  loadStudentDashboardCourses,
  type StudentDashboardCourse,
} from "@/lib/student/load-dashboard-courses";
import {
  loadStudentToday,
  type StudentTodayItem,
  type StudentTodaySummary,
} from "@/lib/student/today";
import { ButtonLink } from "@/components/ui/Button";
import { loadStudentStreak, type StudentStreak } from "@/lib/student/streak";
import { Icon } from "@/components/layout/NavIcon";

const KIND_LABEL: Record<StudentTodayItem["kind"], string> = {
  listening: "오늘의 듣기학습",
  vocab: "단어학습",
  course: "강좌",
};

const KIND_ICON: Record<StudentTodayItem["kind"], string> = {
  listening: "headphones",
  vocab: "book",
  course: "video",
};

function koreanDateLabel(iso: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date(`${iso}T12:00:00+09:00`));
}

function TodayCard({ item }: { item: StudentTodayItem }) {
  return (
    <div className="flex flex-col gap-3.5 rounded-lg border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-md ${
              item.done ? "bg-green-50 text-green-700" : "bg-brand-50 text-brand-700"
            }`}
          >
            <Icon name={KIND_ICON[item.kind]} />
          </span>
          <span className="text-[13px] font-semibold text-slate-500">
            {KIND_LABEL[item.kind]}
          </span>
        </div>
        {item.done ? (
          <span className="inline-flex items-center gap-1 rounded bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
            <Icon name="check" size={12} strokeWidth={2.6} />
            완료
          </span>
        ) : null}
      </div>
      <div className="min-w-0">
        <p className="truncate text-base font-bold text-slate-900">{item.title}</p>
        <p className="mt-1 truncate text-[13px] text-slate-500">{item.meta}</p>
      </div>
      <div>
        <div className="mb-1.5 flex justify-between text-xs text-slate-500">
          <span>{item.progressLabel}</span>
          <span className="font-semibold tabular-nums text-slate-900">{item.percent}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${item.done ? "bg-green-700" : "bg-brand-600"}`}
            style={{ width: `${Math.min(100, item.percent)}%` }}
          />
        </div>
      </div>
      <ButtonLink
        href={item.href}
        variant={item.done ? "secondary" : "primary"}
        className="w-full"
      >
        {item.cta}
      </ButtonLink>
    </div>
  );
}

export async function StudentHomeContent() {
  const profile = await getCurrentProfile();
  const [today, courses, streak] = await Promise.all([
    loadStudentToday(profile!.id, true),
    loadStudentDashboardCourses(profile!.id),
    loadStudentStreak(profile!.id).catch(() => null),
  ]);
  return <StudentHomeView name={profile!.name} today={today} courses={courses} streak={streak} />;
}

/** 연속 공부 카드 — 매일 들어오게 한다 */
function StreakCard({ streak }: { streak: StudentStreak }) {
  const n = streak.streak;
  const message = streak.studiedToday
    ? n >= 7
      ? "일주일 넘게 매일 공부하고 있어요. 정말 멋져요!"
      : n >= 3
        ? "잘하고 있어요. 내일도 이어 가요!"
        : "오늘도 공부했어요. 내일도 이어 가요!"
    : n > 0
      ? `오늘 공부하면 ${n + 1}일 연속이 돼요!`
      : "오늘 공부하면 연속 기록이 시작돼요.";
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-orange-500 text-white">
          <span className="text-2xl font-black leading-none tabular-nums">{n}</span>
          <span className="text-[11px] font-bold">일 연속</span>
        </div>
        <div>
          <p className="text-base font-extrabold text-slate-900">
            {n > 0 ? `${n}일째 공부 중` : "연속 공부 도전"}
          </p>
          <p className="mt-0.5 text-sm text-slate-600">{message}</p>
          {streak.best > n ? <p className="mt-0.5 text-xs text-slate-400">최고 기록 {streak.best}일</p> : null}
        </div>
      </div>
      <ol className="flex gap-1.5" aria-label="이번 주 공부한 날">
        {streak.week.map((d) => (
          <li key={d.iso} className="flex flex-col items-center gap-1">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                d.studied
                  ? "bg-orange-500 text-white"
                  : d.isToday
                    ? "border-2 border-dashed border-orange-400 text-orange-500"
                    : d.future
                      ? "bg-slate-50 text-slate-300"
                      : "bg-slate-100 text-slate-400"
              }`}
            >
              {d.studied ? <Icon name="check" size={14} strokeWidth={3} /> : d.label}
            </span>
            <span className={`text-[10px] ${d.isToday ? "font-bold text-orange-600" : "text-slate-400"}`}>{d.label}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function StudentHomeView({
  name,
  today,
  courses,
  streak = null,
}: {
  name: string;
  today: StudentTodaySummary;
  courses: StudentDashboardCourse[];
  streak?: StudentStreak | null;
}) {
  const { items, doneCount, week } = today;
  const hasWeek = week.some((d) => d.status !== "off");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-[22px]">
          {name}님, 안녕하세요
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {koreanDateLabel(today.todayIso)}
          {" · "}
          {items.length === 0
            ? "오늘은 할 일이 없어요"
            : doneCount === items.length
              ? "오늘 할 일을 모두 끝냈어요"
              : `오늘 할 일 ${items.length}개 중 ${doneCount}개를 끝냈어요`}
        </p>
      </div>

      {streak ? <StreakCard streak={streak} /> : null}

      {items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <TodayCard key={item.kind} item={item} />
          ))}
        </div>
      ) : null}

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-card lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-slate-900">수강 중인 강좌</h2>
            {courses.length > 0 ? (
              <Link
                href="/student/courses"
                className="text-[13px] font-semibold text-brand-700 hover:underline"
              >
                전체 보기
              </Link>
            ) : null}
          </div>
          {courses.length === 0 ? (
            <p className="mt-4 rounded-md border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
              아직 배정된 강좌가 없어요. 학원에서 강좌를 배정하면 여기에 보여요.
            </p>
          ) : (
            <ul className="mt-2">
              {courses.slice(0, 4).map(({ course, progressPercent, completedLessons, totalLessons }) => (
                <li key={course.id} className="border-t border-slate-100 first:border-t-0">
                  <Link
                    href={`/student/courses/${course.id}`}
                    className="group flex items-center gap-4 py-3.5"
                  >
                    <span className="flex h-12 w-20 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-side-active to-side text-white">
                      <Icon name="play" size={16} filled strokeWidth={1} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="truncate text-sm font-semibold text-slate-900 group-hover:text-brand-700">
                          {course.title ?? "제목 없음"}
                        </span>
                        <span className="shrink-0 text-xs tabular-nums text-slate-500">
                          {completedLessons} / {totalLessons}강
                        </span>
                      </span>
                      <span className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <span
                          className="block h-full rounded-full bg-brand-600"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </span>
                    </span>
                    <Icon name="chevron" size={16} className="text-slate-400" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-slate-900">이번 주 듣기</h2>
            <Link
              href="/student/listening"
              className="text-[13px] font-semibold text-brand-700 hover:underline"
            >
              달력 보기
            </Link>
          </div>
          {hasWeek ? (
            <div className="mb-3 mt-4 flex gap-1.5">
              {week.map((d) => (
                <div key={d.iso} className="flex flex-1 flex-col items-center gap-1.5">
                  <span
                    className={`text-xs ${
                      d.iso === today.todayIso ? "font-bold text-brand-700" : "font-medium text-slate-500"
                    }`}
                  >
                    {d.label}
                  </span>
                  <span
                    className={`flex h-10 w-full items-center justify-center rounded-md text-xs font-bold tabular-nums ${
                      d.status === "done"
                        ? "bg-green-700 text-white"
                        : d.status === "today"
                          ? "border-[1.5px] border-brand-600 bg-brand-50 text-brand-700"
                          : d.status === "missed"
                            ? "bg-amber-50 text-amber-700"
                            : d.status === "later"
                              ? "bg-slate-100"
                              : "bg-slate-50"
                    }`}
                  >
                    {d.status === "done" ? (
                      <Icon name="check" size={14} strokeWidth={2.6} />
                    ) : d.status === "today" ? (
                      d.todayLabel
                    ) : d.status === "missed" ? (
                      "!"
                    ) : null}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mb-3 mt-4 rounded-md bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">
              이번 주에는 배정된 듣기학습이 없어요.
            </p>
          )}
          {[
            { icon: "flame", label: "듣기 연속 학습", value: today.listeningStreak, unit: "일" },
            { icon: "calendar", label: "이번 달 듣기 완료", value: today.listeningDoneThisMonth, unit: "일" },
            { icon: "trophy", label: "합격한 단어장", value: today.vocabPassed, unit: "개" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 border-t border-slate-100 py-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                <Icon name={s.icon} size={17} />
              </span>
              <span className="flex-1 text-[13px] text-slate-500">{s.label}</span>
              <span className="text-lg font-bold tabular-nums text-slate-900">{s.value}</span>
              <span className="w-4 text-xs text-slate-500">{s.unit}</span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
