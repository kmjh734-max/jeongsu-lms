"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { deleteWorkbooksAction } from "@/lib/exam-prep/staff-actions";

export type WorkbookListItem = {
  id: string;
  title: string;
  status: string;
  preset_type: string | null;
  updated_at: string;
  passageTitle: string | null;
};

interface WorkbookListClientProps {
  basePath: string;
  workbooks: WorkbookListItem[];
}

const STATUS_LABELS: Record<string, string> = {
  draft: "초안",
  generating: "생성중",
  review: "검수",
  approved: "승인",
  archived: "보관",
};

export function WorkbookListClient({
  basePath,
  workbooks,
}: WorkbookListClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allIds = useMemo(() => workbooks.map((w) => w.id), [workbooks]);
  const allSelected =
    allIds.length > 0 && selected.size === allIds.length;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(allIds));
  }

  function runDelete(ids: string[]) {
    if (ids.length === 0) return;
    if (
      !window.confirm(
        `선택한 워크북 ${ids.length}개를 삭제할까요?\n연결된 배정·학습 기록도 함께 삭제됩니다.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deleteWorkbooksAction(ids);
      if (!result.ok) {
        window.alert(result.message);
        return;
      }
      setSelected(new Set());
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            disabled={workbooks.length === 0}
            className="h-4 w-4 rounded border-slate-300"
          />
          전체 선택
        </label>
        <button
          type="button"
          disabled={pending || selected.size === 0}
          onClick={() => runDelete([...selected])}
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending
            ? "삭제 중…"
            : selected.size > 0
              ? `선택 삭제 (${selected.size})`
              : "선택 삭제"}
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="w-10 px-4 py-3" />
              <th className="px-4 py-3 font-medium">제목</th>
              <th className="px-4 py-3 font-medium">지문</th>
              <th className="px-4 py-3 font-medium">프리셋</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">수정일</th>
              <th className="px-4 py-3 font-medium">관리</th>
            </tr>
          </thead>
          <tbody>
            {workbooks.map((w) => (
              <tr
                key={w.id}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(w.id)}
                    onChange={() => toggle(w.id)}
                    className="h-4 w-4 rounded border-slate-300"
                    aria-label={`${w.title} 선택`}
                  />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`${basePath}/workbooks/${w.id}/edit`}
                    className="font-medium text-brand-700 hover:underline"
                  >
                    {w.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {w.passageTitle ?? "-"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {w.preset_type ?? "-"}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                    {STATUS_LABELS[w.status] ?? w.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(w.updated_at).toLocaleDateString("ko-KR")}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => runDelete([w.id])}
                    className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
            {workbooks.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  워크북이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
