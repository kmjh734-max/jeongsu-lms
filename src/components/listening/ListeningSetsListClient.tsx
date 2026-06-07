"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ListeningScheduleAssignModal } from "@/components/listening/ListeningScheduleAssignModal";
import { ListeningSetAssignModal } from "@/components/listening/ListeningSetAssignModal";
import type { ListeningAssignmentSummary } from "@/lib/listening/load-assignment-summaries";

export interface ListeningSetListItem {
  id: string;
  title: string;
  is_published: boolean;
  created_at: string;
}

interface ClassOption {
  id: string;
  name: string;
}

interface ListeningSetsListClientProps {
  sets: ListeningSetListItem[];
  basePath: "/admin/listening" | "/teacher/listening";
  classes?: ClassOption[];
  assignmentBySetId?: Record<string, ListeningAssignmentSummary>;
  /** 만들기 전용: 배정 UI 숨김 */
  createOnly?: boolean;
}

export function ListeningSetsListClient({
  sets,
  basePath,
  classes = [],
  assignmentBySetId = {},
  createOnly = false,
}: ListeningSetsListClientProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignSetId, setAssignSetId] = useState<string | null>(null);

  const setTitles = useMemo(() => {
    const m: Record<string, string> = {};
    for (const s of sets) m[s.id] = s.title;
    return m;
  }, [sets]);

  const allSelected = sets.length > 0 && selectedIds.size === sets.length;

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sets.map((s) => s.id)));
    }
  }

  async function createSet(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/listening/sets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      message?: string;
      set?: { id: string };
    };
    setBusy(false);
    if (!data.ok || !data.set?.id) {
      setError(data.message ?? "생성 실패");
      return;
    }
    router.push(`${basePath}/${data.set.id}`);
  }

  async function deleteSet(setId: string, setTitle: string) {
    if (
      !window.confirm(
        `「${setTitle}」 세트와 문항·음원·배정 정보를 모두 삭제합니다. 계속할까요?`
      )
    ) {
      return;
    }
    setDeletingId(setId);
    setError(null);
    const res = await fetch(`/api/listening/sets/${setId}`, { method: "DELETE" });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    setDeletingId(null);
    if (!data.ok) {
      setError(data.message ?? "삭제 실패");
      return;
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(setId);
      return next;
    });
    router.refresh();
  }

  const canBatchAssign = classes.length > 0;
  const assignTarget = assignSetId
    ? sets.find((s) => s.id === assignSetId)
    : null;

  return (
    <div className="space-y-6">
      <form
        onSubmit={createSet}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4"
      >
        <label className="flex-1 text-sm font-medium text-slate-700">
          새 듣기 세트 제목
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="예: 13회 듣기 연습"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {busy ? "만드는 중…" : "세트 만들기"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {sets.length === 0 ? (
        <p className="text-sm text-slate-600">등록된 듣기 세트가 없습니다.</p>
      ) : (
        <>
          {!createOnly && canBatchAssign && (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3 text-sm">
              <label className="flex items-center gap-2 font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                />
                전체 선택
              </label>
              <span className="text-slate-600">
                {selectedIds.size > 0
                  ? `${selectedIds.size}개 세트 선택됨`
                  : "세트를 선택해 스케줄 배정하세요"}
              </span>
              <button
                type="button"
                disabled={selectedIds.size === 0}
                onClick={() => setShowAssignModal(true)}
                className="ml-auto rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
              >
                선택 세트 배정하기
              </button>
            </div>
          )}

          <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {sets.map((set) => (
              <li key={set.id} className="flex items-center gap-2 px-4 py-3">
                {!createOnly && canBatchAssign && (
                  <input
                    type="checkbox"
                    checked={selectedIds.has(set.id)}
                    onChange={() => toggleSelect(set.id)}
                    className="shrink-0"
                    aria-label={`${set.title} 선택`}
                  />
                )}
                <Link
                  href={`${basePath}/${set.id}`}
                  className="min-w-0 flex-1 hover:text-indigo-700"
                >
                  <span className="font-medium text-slate-900">{set.title}</span>
                  <span className="ml-2 text-xs text-slate-500">
                    {set.is_published ? "공개" : "비공개"}
                  </span>
                </Link>
                {!createOnly && (
                  <button
                    type="button"
                    onClick={() => setAssignSetId(set.id)}
                    className="shrink-0 rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-800 hover:bg-indigo-100"
                  >
                    배정
                  </button>
                )}
                <Link
                  href={`${basePath}/${set.id}/print`}
                  className="shrink-0 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                >
                  출력
                </Link>
                <button
                  type="button"
                  disabled={deletingId === set.id}
                  onClick={() => deleteSet(set.id, set.title)}
                  className="shrink-0 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  {deletingId === set.id ? "삭제 중…" : "삭제"}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {assignTarget && (
        <ListeningSetAssignModal
          setId={assignTarget.id}
          setTitle={assignTarget.title}
          classes={classes}
          assignedClassNames={assignmentBySetId[assignTarget.id]?.classNames ?? []}
          assignedStudentNames={
            assignmentBySetId[assignTarget.id]?.studentNames ?? []
          }
          isPublished={assignTarget.is_published}
          onClose={() => setAssignSetId(null)}
        />
      )}

      {showAssignModal && selectedIds.size > 0 && (
        <ListeningScheduleAssignModal
          setIds={[...selectedIds]}
          setTitles={setTitles}
          classes={classes}
          onClose={() => setShowAssignModal(false)}
          onSuccess={() => {
            setSelectedIds(new Set());
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
