"use client";

import { Fragment, useMemo, useState } from "react";
import { MiniBar, SearchBox, Segmented } from "@/components/classes/ClassUi";
import { Icon } from "@/components/layout/NavIcon";
import { relativeStudyDay } from "@/lib/classes/week";
import {
  formatStudyDateTime,
  matchesStudentSearch,
  type LessonProgressDetail,
} from "@/lib/progress/enrollment-progress";
import type { ProgressRow } from "@/lib/progress/load-progress-page";

type SortKey = "behind" | "name" | "recent";

/** 마지막 학습(없으면 배정일)이 이만큼 지났고 아직 다 못 봤으면 뒤처짐 */
const BEHIND_DAYS = 5;

const GRID =
  "md:grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.7fr)_minmax(0,1.3fr)_minmax(0,1.2fr)_76px_20px] md:items-center md:gap-4";

function rowKey(row: ProgressRow): string {
  return `${row.studentId}-${row.courseId}`;
}

function isBehind(row: ProgressRow, todayIso: string): boolean {
  if (row.totalLessons === 0 || row.progressPercent >= 100) return false;
  const since = relativeStudyDay(row.lastStudiedAt ?? row.enrolledAt, todayIso).daysAgo;
  return since !== null && since >= BEHIND_DAYS;
}

function after(iso: string | null, startMs: number): boolean {
  if (!iso) return false;
  const t = Date.parse(iso);
  return !Number.isNaN(t) && t >= startMs;
}

export function ProgressOverview({
  rows,
  classes,
  todayIso,
  weekStart,
  truncated,
  limit,
}: {
  rows: ProgressRow[];
  classes: { id: string; name: string }[];
  todayIso: string;
  /** 이번 주 월요일 0시 (한국) */
  weekStart: string;
  truncated: boolean;
  limit: number;
}) {
  const [classFilter, setClassFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("behind");
  const [openKey, setOpenKey] = useState<string | null>(null);

  const weekStartMs = Date.parse(weekStart);

  const courseOptions = useMemo(() => {
    const titles = new Map<string, string>();
    for (const row of rows) titles.set(row.courseId, row.courseTitle);
    return [...titles.entries()].sort((a, b) => a[1].localeCompare(b[1], "ko"));
  }, [rows]);

  const behindKeys = useMemo(() => {
    const set = new Set<string>();
    for (const row of rows) if (isBehind(row, todayIso)) set.add(rowKey(row));
    return set;
  }, [rows, todayIso]);

  const filtered = useMemo(() => {
    const list = rows.filter((r) => {
      if (classFilter !== "all" && !r.classIds.includes(classFilter)) return false;
      if (courseFilter !== "all" && r.courseId !== courseFilter) return false;
      return matchesStudentSearch(r, search);
    });
    const byName = (a: ProgressRow, b: ProgressRow) =>
      a.studentName.localeCompare(b.studentName, "ko") ||
      a.courseTitle.localeCompare(b.courseTitle, "ko");
    const lastMs = (r: ProgressRow) => (r.lastStudiedAt ? Date.parse(r.lastStudiedAt) : 0);
    return [...list].sort((a, b) => {
      if (sort === "name") return byName(a, b);
      if (sort === "recent") return lastMs(b) - lastMs(a) || byName(a, b);
      const behindA = behindKeys.has(rowKey(a)) ? 0 : 1;
      const behindB = behindKeys.has(rowKey(b)) ? 0 : 1;
      return behindA - behindB || a.progressPercent - b.progressPercent || byName(a, b);
    });
  }, [rows, classFilter, courseFilter, search, sort, behindKeys]);

  const summary = useMemo(() => {
    const students = new Set<string>();
    const watchedThisWeek = new Set<string>();
    const behindStudents = new Set<string>();
    let percentSum = 0;
    let percentCount = 0;
    let completedThisWeek = 0;
    for (const row of filtered) {
      students.add(row.studentId);
      if (row.totalLessons > 0) {
        percentSum += row.progressPercent;
        percentCount += 1;
      }
      if (behindKeys.has(rowKey(row))) behindStudents.add(row.studentId);
      for (const lesson of row.lessons) {
        if (after(lesson.lastWatchedAt, weekStartMs) || after(lesson.completedAt, weekStartMs)) {
          watchedThisWeek.add(row.studentId);
        }
        if (lesson.isCompleted && after(lesson.completedAt, weekStartMs)) completedThisWeek += 1;
      }
    }
    return {
      avg: percentCount > 0 ? Math.round(percentSum / percentCount) : null,
      students: students.size,
      watched: watchedThisWeek.size,
      behind: behindStudents.size,
      completedThisWeek,
    };
  }, [filtered, behindKeys, weekStartMs]);

  const filtering = classFilter !== "all" || courseFilter !== "all" || search.trim().length > 0;

  function resetOpen<T>(fn: (v: T) => void) {
    return (v: T) => {
      fn(v);
      setOpenKey(null);
    };
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid gap-2 sm:grid-cols-3 lg:flex">
          <select
            value={classFilter}
            onChange={(e) => resetOpen(setClassFilter)(e.target.value)}
            aria-label="반"
            className="ui-select h-9 py-0 lg:w-44"
          >
            <option value="all">반: 전체</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={courseFilter}
            onChange={(e) => resetOpen(setCourseFilter)(e.target.value)}
            aria-label="강좌"
            className="ui-select h-9 py-0 lg:w-48"
          >
            <option value="all">강좌: 전체</option>
            {courseOptions.map(([id, title]) => (
              <option key={id} value={id}>
                {title}
              </option>
            ))}
          </select>
          <SearchBox
            value={search}
            onChange={resetOpen(setSearch)}
            placeholder="이름 또는 아이디"
            className="lg:w-48"
          />
        </div>
        <Segmented
          ariaLabel="정렬"
          value={sort}
          onChange={setSort}
          options={[
            { value: "behind", label: "뒤처진 순" },
            { value: "name", label: "이름순" },
            { value: "recent", label: "최근 학습순" },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="평균 진도" value={summary.avg ?? "—"} unit={summary.avg === null ? "" : "%"} />
        <StatCard
          label="이번 주 영상 본 학생"
          value={summary.watched}
          unit={`/ ${summary.students}명`}
        />
        <StatCard
          label="뒤처진 학생"
          value={summary.behind}
          unit={`명 · ${BEHIND_DAYS}일 이상 안 봄`}
          warn={summary.behind > 0}
        />
        <StatCard label="이번 주 완료한 강의" value={summary.completedThisWeek} unit="강" />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-card">
        <div
          className={`hidden rounded-t-lg border-b border-slate-200 bg-slate-50 px-[18px] py-2.5 text-xs font-semibold text-slate-500 ${GRID}`}
        >
          <span>학생</span>
          <span>반</span>
          <span>강좌</span>
          <span>진도</span>
          <span>마지막 학습</span>
          <span />
        </div>

        {filtered.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-slate-500">
            {rows.length === 0
              ? "아직 수강 중인 학생이 없어요."
              : filtering
                ? "조건에 맞는 학생이 없어요."
                : "아직 수강 중인 학생이 없어요."}
          </p>
        ) : (
          <ul>
            {filtered.map((row) => {
              const key = rowKey(row);
              const open = openKey === key;
              const behind = behindKeys.has(key);
              const last = relativeStudyDay(row.lastStudiedAt, todayIso);
              return (
                <Fragment key={key}>
                  <li className="border-t border-slate-100 first:border-t-0">
                    <button
                      type="button"
                      onClick={() => setOpenKey(open ? null : key)}
                      aria-expanded={open}
                      className={`flex w-full flex-col gap-1.5 px-4 py-3 text-left transition hover:bg-slate-50 md:min-h-[54px] md:px-[18px] md:py-2 ${
                        open ? "bg-slate-50" : ""
                      } ${GRID}`}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="truncate text-sm font-semibold text-slate-900">
                          {row.studentName}
                        </span>
                        {behind ? (
                          <span className="shrink-0 rounded bg-amber-50 px-1.5 py-0.5 text-xs font-semibold text-amber-700">
                            뒤처짐
                          </span>
                        ) : null}
                        <Icon
                          name={open ? "down" : "chevron"}
                          size={16}
                          className="ml-auto text-slate-400 md:hidden"
                        />
                      </span>
                      <span className="truncate text-[13px] text-slate-600">
                        {row.className ?? <span className="text-slate-400">반 없음</span>}
                        <span className="text-slate-400 md:hidden"> · {row.courseTitle}</span>
                      </span>
                      <span className="hidden truncate text-[13px] text-slate-800 md:block">
                        {row.courseTitle}
                      </span>
                      <MiniBar
                        percent={row.progressPercent}
                        label={
                          row.totalLessons > 0
                            ? `${row.completedLessons}/${row.totalLessons}강 · ${row.progressPercent}%`
                            : "영상 없음"
                        }
                        className="max-w-[320px] md:max-w-none"
                      />
                      <span
                        className={`text-[13px] ${
                          behind
                            ? "font-semibold text-amber-700"
                            : last.daysAgo === null
                              ? "text-slate-400"
                              : "text-slate-600"
                        }`}
                      >
                        <span className="text-slate-400 md:hidden">마지막 학습 </span>
                        {last.label}
                      </span>
                      <Icon
                        name={open ? "down" : "chevron"}
                        size={16}
                        className="hidden text-slate-400 md:block"
                      />
                    </button>
                  </li>
                  {open ? (
                    <li className="border-t border-slate-100 bg-slate-50/60 px-4 py-3 md:px-[18px]">
                      <LessonChips lessons={row.lessons} />
                    </li>
                  ) : null}
                </Fragment>
              );
            })}
          </ul>
        )}
      </div>

      {truncated ? (
        <p className="text-xs text-slate-400">최근 배정된 수강 {limit}건까지 보여요.</p>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  warn = false,
}: {
  label: string;
  value: number | string;
  unit: string;
  warn?: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3.5 shadow-card sm:px-5 sm:py-4">
      <p className="text-[13px] text-slate-500">{label}</p>
      <p className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5">
        <span
          className={`text-2xl font-bold tabular-nums tracking-tight ${
            warn ? "text-amber-700" : "text-slate-900"
          }`}
        >
          {value}
        </span>
        {unit ? <span className="text-xs text-slate-500">{unit}</span> : null}
      </p>
    </div>
  );
}

function LessonChips({ lessons }: { lessons: LessonProgressDetail[] }) {
  if (lessons.length === 0) {
    return <p className="text-sm text-slate-500">공개된 영상이 없어요.</p>;
  }
  return (
    <ul className="flex flex-wrap gap-2">
      {lessons.map((lesson) => {
        const status = lesson.isCompleted
          ? { text: "완료", cls: "text-green-700" }
          : lesson.progressPercent > 0
            ? { text: `${lesson.progressPercent}%`, cls: "text-amber-700" }
            : { text: "—", cls: "text-slate-400" };
        const tip = [
          lesson.lessonTitle,
          lesson.lastWatchedAt ? `마지막 시청 ${formatStudyDateTime(lesson.lastWatchedAt)}` : null,
          lesson.completedAt ? `완료 ${formatStudyDateTime(lesson.completedAt)}` : null,
        ]
          .filter(Boolean)
          .join("\n");
        return (
          <li
            key={lesson.lessonId}
            title={tip}
            className={`flex w-16 flex-col items-center rounded-md border bg-white py-1.5 ${
              lesson.isCompleted ? "border-green-200" : "border-slate-200"
            }`}
          >
            <span className="text-[11px] text-slate-500">{lesson.orderIndex}강</span>
            <span className={`text-xs font-semibold tabular-nums ${status.cls}`}>
              {status.text}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
