"use client";

import type { StudentDetailAssignment } from "@/lib/accounts/student-detail";

/**
 * 학생 서랍의 단어·듣기 칸 — 보기만 한다.
 *
 * 선생님 요청(2026-09-28): 이 화면에서는 배정하지 않는다. 배정하는 자리가 여러 곳이라
 * 헷갈렸다. 배정은 단어학습·듣기학습 세트 목록과 반 상세에서만 한다.
 * 반에서 따라온 것은 '반' 딱지로 구분한다.
 */
export function AssignedList({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: StudentDetailAssignment[] | null;
  emptyText: string;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-[15px] font-bold text-slate-900">
        {title}
        {items ? ` · ${items.length}` : ""}
      </h3>

      {items === null ? (
        <div className="h-[46px] animate-pulse rounded-lg bg-slate-100" aria-hidden />
      ) : items.length === 0 ? (
        <p className="rounded-lg bg-slate-50 px-3 py-4 text-center text-[13px] text-slate-500">
          {emptyText}
        </p>
      ) : (
        items.map((a) => (
          <div
            key={a.setId}
            className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2.5"
          >
            <span className="min-w-0 truncate text-[13px] font-semibold text-slate-900">
              {a.title}
            </span>
            {a.fromClass ? (
              <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500">
                반
              </span>
            ) : null}
          </div>
        ))
      )}
    </section>
  );
}
