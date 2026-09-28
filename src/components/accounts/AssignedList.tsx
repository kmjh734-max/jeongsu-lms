"use client";

import { useState } from "react";
import type { StudentDetailAssignment } from "@/lib/accounts/student-detail";

/** 한 번에 보여 줄 줄 수. 나머지는 접어 둔다. */
const FIRST = 5;

/**
 * 학생 서랍의 단어·듣기 칸 — 보기만 한다.
 *
 * 선생님 요청(2026-09-28): 이 화면에서는 배정하지 않는다. 배정하는 자리가 여러 곳이라
 * 헷갈렸다. 배정은 단어학습·듣기학습 세트 목록과 반 상세에서만 한다.
 * 반에서 따라온 것은 '반' 딱지로 구분한다.
 *
 * 반에 교재를 통째로 배정하면 수십 개가 따라오므로, 처음에는 몇 줄만 보여 주고
 * 나머지는 접어 둔다(선생님 지적: 예순 줄이 줄줄이 나와 알아볼 수 없었다).
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
  const [open, setOpen] = useState(false);

  if (items === null) {
    return (
      <section className="flex flex-col gap-2">
        <h3 className="text-[15px] font-bold text-slate-900">{title}</h3>
        <div className="h-[46px] animate-pulse rounded-lg bg-slate-100" aria-hidden />
      </section>
    );
  }

  const fromClass = items.filter((a) => a.fromClass).length;
  const shown = open ? items : items.slice(0, FIRST);
  const hidden = items.length - shown.length;

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-[15px] font-bold text-slate-900">
          {title} · {items.length}
        </h3>
        {fromClass > 0 ? (
          <span className="text-[11px] text-slate-400">반에서 {fromClass}개</span>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg bg-slate-50 px-3 py-4 text-center text-[13px] text-slate-500">
          {emptyText}
        </p>
      ) : (
        <>
          {shown.map((a) => (
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
          ))}
          {items.length > FIRST ? (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="self-start text-[13px] font-semibold text-brand-700 hover:underline"
            >
              {open ? "접기" : `${hidden}개 더 보기`}
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}
