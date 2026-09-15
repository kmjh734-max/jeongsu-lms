"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MiniBar, SearchBox, Segmented } from "@/components/classes/ClassUi";
import { Icon } from "@/components/layout/NavIcon";
import type { ClassListRow } from "@/lib/classes/load-class-list";

const GRID =
  "md:grid md:grid-cols-[minmax(0,1.2fr)_64px_minmax(0,1.4fr)_minmax(0,1fr)_150px_20px] md:items-center md:gap-3.5";

function learningSummary(row: ClassListRow): string {
  const parts: string[] = [];
  if (row.vocabSetCount > 0) parts.push(`단어 ${row.vocabSetCount}`);
  if (row.listeningDays) parts.push(`듣기 ${row.listeningDays}`);
  return parts.length > 0 ? parts.join(" · ") : "배정 없음";
}

export function ClassListView({
  rows,
  basePath,
  teachers,
  emptyMessage,
}: {
  rows: ClassListRow[];
  basePath: string;
  /** 관리자만: 담당 강사 거르기 */
  teachers?: { id: string; name: string }[];
  emptyMessage: string;
}) {
  const [status, setStatus] = useState<"active" | "archived">("active");
  const [query, setQuery] = useState("");
  const [teacherId, setTeacherId] = useState("all");

  const activeCount = rows.filter((r) => r.isActive).length;
  const archivedCount = rows.length - activeCount;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (archivedCount > 0 && r.isActive !== (status === "active")) return false;
      if (archivedCount === 0 && !r.isActive) return false;
      if (q && !r.name.toLowerCase().includes(q)) return false;
      if (teacherId === "none" && r.teacherId) return false;
      if (teacherId !== "all" && teacherId !== "none" && r.teacherId !== teacherId) return false;
      return true;
    });
  }, [rows, query, teacherId, status, archivedCount]);

  const filtering = query.trim().length > 0 || teacherId !== "all";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {archivedCount > 0 ? (
          <Segmented
            ariaLabel="반 상태"
            value={status}
            onChange={setStatus}
            options={[
              { value: "active", label: `활성 ${activeCount}` },
              { value: "archived", label: `보관 ${archivedCount}` },
            ]}
          />
        ) : (
          <p className="text-sm text-slate-500">
            반 <span className="font-semibold tabular-nums text-slate-900">{activeCount}</span>개
          </p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          <SearchBox
            value={query}
            onChange={setQuery}
            placeholder="반 이름 찾기"
            className="sm:w-56"
          />
          {teachers ? (
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              aria-label="담당 강사"
              className="ui-select h-9 py-0 sm:w-40"
            >
              <option value="all">담당: 전체</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  담당: {t.name}
                </option>
              ))}
              <option value="none">담당 없음</option>
            </select>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card">
        <div
          className={`hidden border-b border-slate-200 bg-slate-50 px-[18px] py-2.5 text-xs font-semibold text-slate-500 ${GRID}`}
        >
          <span>반</span>
          <span>학생</span>
          <span>강좌</span>
          <span>단어·듣기</span>
          <span>이번 주 수행</span>
          <span />
        </div>

        {visible.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-slate-500">
            {filtering
              ? "찾는 반이 없어요."
              : status === "archived"
                ? "보관한 반이 없어요."
                : emptyMessage}
          </p>
        ) : (
          <ul>
            {visible.map((row) => (
              <li key={row.id} className="border-t border-slate-100 first:border-t-0">
                <Link
                  href={`${basePath}/${row.id}`}
                  className={`group flex flex-col gap-2 px-4 py-3.5 transition hover:bg-slate-50 md:min-h-[54px] md:px-[18px] md:py-2 ${GRID}`}
                >
                  <div className="flex min-w-0 items-start justify-between gap-3 md:block">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-brand-700">
                        {row.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {row.teacherName ? `담당 ${row.teacherName}` : "담당 강사 없음"}
                      </p>
                    </div>
                    <Icon name="chevron" size={16} className="mt-0.5 text-slate-400 md:hidden" />
                  </div>

                  <span className="text-[13px] tabular-nums text-slate-700">
                    <span className="text-slate-400 md:hidden">학생 </span>
                    {row.studentCount}명
                  </span>

                  <div className="flex min-w-0 flex-wrap gap-1">
                    {row.courseTitles.length === 0 ? (
                      <span className="text-xs text-slate-400">강좌 없음</span>
                    ) : (
                      <>
                        {row.courseTitles.slice(0, 2).map((title, i) => (
                          <span
                            key={`${title}-${i}`}
                            className="inline-flex h-[22px] max-w-full items-center truncate rounded bg-slate-100 px-[7px] text-xs text-slate-700"
                          >
                            {title}
                          </span>
                        ))}
                        {row.courseTitles.length > 2 ? (
                          <span className="inline-flex h-[22px] items-center rounded px-1 text-xs font-semibold text-slate-500">
                            +{row.courseTitles.length - 2}
                          </span>
                        ) : null}
                      </>
                    )}
                  </div>

                  <span
                    className={`text-[13px] ${
                      row.vocabSetCount > 0 || row.listeningDays ? "text-slate-700" : "text-slate-400"
                    }`}
                  >
                    {learningSummary(row)}
                  </span>

                  <div className="min-w-0 max-w-[240px] md:max-w-none">
                    {row.performance ? (
                      <>
                        <MiniBar percent={row.performance.percent} />
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {row.performance.source === "listening" ? "듣기 과제" : "영상 진도"}
                        </p>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </div>

                  <Icon name="chevron" size={16} className="hidden text-slate-400 md:block" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
