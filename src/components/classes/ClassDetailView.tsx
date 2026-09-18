import Link from "next/link";
import type { ReactNode } from "react";
import {
  AddStudentButton,
  ClassCoursesPanel,
  ClassSettingsPanel,
  ClassStudentTable,
} from "@/components/classes/ClassDetailPanels";
import { Icon } from "@/components/layout/NavIcon";
import { ButtonLink } from "@/components/ui/Button";
import type { ClassPageData, ClassTab } from "@/lib/classes/load-class-page";

function Pill({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "brand" | "amber" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    brand: "bg-brand-50 text-brand-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <span className={`inline-flex h-6 items-center rounded px-2 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function SectionCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="ui-section-card">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          {description ? <p className="mt-0.5 text-sm text-slate-500">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

/** 반 상세 (관리자·강사 공용) — 머리글, [학생] [강좌·교재] [설정] 탭 */
export function ClassDetailView({
  variant,
  data,
  tab,
  vocabPanel,
}: {
  variant: "admin" | "teacher";
  data: ClassPageData;
  tab: ClassTab;
  /** 강좌·교재 탭 아래 단어장 배정 칸 (단어학습을 쓰는 학원만) */
  vocabPanel: ReactNode | null;
}) {
  const root = variant === "admin" ? "/admin" : "/teacher";
  const basePath = `${root}/classes/${data.classId}`;
  const tabs: { key: ClassTab; label: string; count?: number; href: string }[] = [
    { key: "students", label: "학생", count: data.members.length, href: basePath },
    {
      key: "courses",
      label: "강좌·교재",
      count: data.courses.length + data.vocabSetCount,
      href: `${basePath}?tab=courses`,
    },
    { key: "settings", label: "설정", href: `${basePath}?tab=settings` },
  ];

  return (
    <div>
      <Link
        href={`${root}/classes`}
        className="inline-flex items-center gap-1 text-[13px] text-slate-500 hover:text-slate-900"
      >
        <Icon name="left" size={14} />반 관리
      </Link>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 sm:text-[22px]">
            {data.name}
          </h1>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Pill>{data.teacherName ? `담당 ${data.teacherName}` : "담당 강사 없음"}</Pill>
            <Pill tone="brand">{data.members.length}명</Pill>
            {!data.isActive ? <Pill tone="amber">보관됨</Pill> : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <ButtonLink href={`${root}/reports`} variant="secondary">
            <Icon name="file" size={16} />반 리포트
          </ButtonLink>
          <AddStudentButton
            variant={variant}
            classId={data.classId}
            studentOptions={data.studentOptions}
            memberIds={data.members.map((m) => m.studentId)}
            classActive={data.isActive}
          />
        </div>
      </div>

      <nav
        aria-label="반 메뉴"
        className="mt-5 flex gap-6 overflow-x-auto border-b border-slate-200"
      >
        {tabs.map((t) => {
          const on = t.key === tab;
          return (
            <Link
              key={t.key}
              href={t.href}
              scroll={false}
              aria-current={on ? "page" : undefined}
              className={`-mb-px flex h-10 shrink-0 items-center gap-1.5 border-b-2 text-sm transition ${
                on
                  ? "border-brand-600 font-bold text-slate-900"
                  : "border-transparent font-medium text-slate-500 hover:text-slate-900"
              }`}
            >
              {t.label}
              {t.count !== undefined ? (
                <span
                  className={`text-xs font-semibold tabular-nums ${
                    on ? "text-brand-700" : "text-slate-400"
                  }`}
                >
                  {t.count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4">
        {tab === "students" ? (
          <ClassStudentTable
            variant={variant}
            classId={data.classId}
            rows={data.stats ?? []}
            todayIso={data.todayIso}
            studentInfoPath={`${root}/students`}
          />
        ) : null}

        {tab === "courses" ? (
          <div className="space-y-5">
            <SectionCard title="강좌" description="반에 배정한 동영상 강좌예요.">
              <ClassCoursesPanel
                variant={variant}
                classId={data.classId}
                classActive={data.isActive}
                classCourses={data.courses}
                courseOptions={data.courseOptions ?? []}
              />
            </SectionCard>

            {vocabPanel ? (
              <SectionCard
                title="단어장"
                description="학생마다 단어장을 배정해요."
                action={
                  <Link
                    href={`${root}/vocab/sets`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
                  >
                    단어학습에서 단어장 만들기
                    <Icon name="chevron" size={14} />
                  </Link>
                }
              >
                {vocabPanel}
              </SectionCard>
            ) : null}

            <SectionCard
              title="듣기"
              description="이 반에 걸린 듣기 과제예요. 배정·변경은 듣기학습에서 해요."
              action={
                <Link
                  href={`${root}/listening/assign`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
                >
                  듣기학습 배정
                  <Icon name="chevron" size={14} />
                </Link>
              }
            >
              {(data.schedules ?? []).length === 0 ? (
                <p className="text-sm text-slate-500">진행 중인 듣기 과제가 없어요.</p>
              ) : (
                <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {(data.schedules ?? []).map((s) => (
                    <li
                      key={s.id}
                      className="flex flex-col gap-0.5 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-900">
                        <Icon name="headphones" size={16} className="text-slate-400" />
                        <span className="truncate">{s.title}</span>
                      </span>
                      <span className="text-xs tabular-nums text-slate-500">
                        {s.daysLabel} · {s.startDate.replace(/-/g, ".")}
                        {s.endDate ? ` ~ ${s.endDate.replace(/-/g, ".")}` : " 부터"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>
        ) : null}

        {tab === "settings" ? (
          <ClassSettingsPanel
            variant={variant}
            classId={data.classId}
            initialName={data.name}
            initialDescription={data.description ?? ""}
            initialTeacherId={data.teacherId ?? ""}
            initialIsActive={data.isActive}
            initialWeekdays={data.weekdays}
            teachers={data.teachers}
          />
        ) : null}
      </div>
    </div>
  );
}
