"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { StudentDetailAssignment } from "@/lib/accounts/student-detail";

/**
 * 학생 서랍의 단어·듣기 칸.
 * 반에서 따라온 것과 이 학생에게만 준 것을 한 목록에 섞고, 반에서 온 것은 '반' 딱지로 구분한다.
 */
export function AssignSection({
  title,
  items,
  options,
  emptyText,
  pickLabel,
  loading,
  busy,
  onAssign,
  onRemove,
}: {
  title: string;
  items: StudentDetailAssignment[] | null;
  options: { id: string; title: string }[];
  emptyText: string;
  pickLabel: string;
  loading: boolean;
  busy: boolean;
  onAssign: (setId: string) => Promise<void>;
  onRemove: (assignmentId: string, title: string) => Promise<void>;
}) {
  const [picking, setPicking] = useState(false);
  const [setId, setSetId] = useState("");

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-bold text-slate-900">
          {title}
          {items ? ` · ${items.length}` : ""}
        </h3>
        {!picking ? (
          <button
            type="button"
            onClick={() => setPicking(true)}
            disabled={loading}
            className="text-[13px] font-semibold text-brand-700 hover:underline disabled:opacity-50"
          >
            + 배정
          </button>
        ) : null}
      </div>

      {picking ? (
        <div className="flex flex-col gap-2 rounded-lg border border-brand-100 bg-brand-50/50 p-3">
          {options.length === 0 ? (
            <p className="text-[13px] text-slate-600">배정할 수 있는 것을 모두 배정했어요.</p>
          ) : (
            <select
              value={setId}
              onChange={(e) => setSetId(e.target.value)}
              className="ui-select"
              aria-label={pickLabel}
            >
              <option value="">{pickLabel}</option>
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title}
                </option>
              ))}
            </select>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setPicking(false);
                setSetId("");
              }}
            >
              취소
            </Button>
            <Button
              size="sm"
              disabled={!setId || busy}
              onClick={async () => {
                await onAssign(setId);
                setPicking(false);
                setSetId("");
              }}
            >
              {busy ? "배정 중…" : "배정"}
            </Button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="h-[46px] animate-pulse rounded-lg bg-slate-100" aria-hidden />
      ) : null}
      {items && items.length === 0 ? (
        <p className="rounded-lg bg-slate-50 px-3 py-4 text-center text-[13px] text-slate-500">{emptyText}</p>
      ) : null}
      {items?.map((a) => (
        <div
          key={a.setId}
          className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2.5"
        >
          <span className="min-w-0 truncate text-[13px] font-semibold text-slate-900">{a.title}</span>
          <span className="flex shrink-0 items-center gap-2">
            {a.fromClass ? (
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500">반</span>
            ) : (
              <button
                type="button"
                onClick={() => void (a.id && onRemove(a.id, a.title))}
                disabled={busy || !a.id}
                className="text-[11px] font-semibold text-slate-400 hover:text-rose-700 disabled:opacity-50"
              >
                빼기
              </button>
            )}
          </span>
        </div>
      ))}
    </section>
  );
}
