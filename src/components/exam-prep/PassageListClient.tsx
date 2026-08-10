"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  deletePassageSetsAction,
  deletePassagesAction,
} from "@/lib/exam-prep/staff-actions";

export type PassageListItem = {
  id: string;
  title: string;
  status: string;
  passage_number: string | null;
  exam_range: string | null;
  updated_at: string;
};

export type PassageSetListItem = {
  id: string;
  title: string;
  grade: string | null;
  school_name: string | null;
  status: string;
  updated_at: string;
  passages: PassageListItem[];
};

interface PassageListClientProps {
  basePath: string;
  sets: PassageSetListItem[];
  orphans: PassageListItem[];
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    ready: "bg-green-100 text-green-800",
    archived: "bg-amber-100 text-amber-800",
  };
  const labels: Record<string, string> = {
    draft: "초안",
    ready: "준비완료",
    archived: "보관",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        styles[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}

export function PassageListClient({
  basePath,
  sets,
  orphans,
}: PassageListClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedSets, setSelectedSets] = useState<Set<string>>(new Set());
  const [selectedPassages, setSelectedPassages] = useState<Set<string>>(
    new Set()
  );

  const allSetIds = useMemo(() => sets.map((s) => s.id), [sets]);
  const allPassageIds = useMemo(() => {
    const ids: string[] = [];
    for (const set of sets) {
      for (const p of set.passages) ids.push(p.id);
    }
    for (const p of orphans) ids.push(p.id);
    return ids;
  }, [sets, orphans]);

  const selectedCount = selectedSets.size + selectedPassages.size;
  const allSelected =
    allSetIds.length + allPassageIds.length > 0 &&
    selectedSets.size === allSetIds.length &&
    selectedPassages.size === allPassageIds.length;

  function toggleSet(id: string) {
    setSelectedSets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function togglePassage(id: string) {
    setSelectedPassages((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelectedSets(new Set());
      setSelectedPassages(new Set());
      return;
    }
    setSelectedSets(new Set(allSetIds));
    setSelectedPassages(new Set(allPassageIds));
  }

  function runDelete(setIds: string[], passageIds: string[]) {
    if (setIds.length === 0 && passageIds.length === 0) return;

    const parts: string[] = [];
    if (setIds.length > 0) parts.push(`세트 ${setIds.length}개`);
    if (passageIds.length > 0) parts.push(`지문 ${passageIds.length}개`);
    if (
      !window.confirm(
        `선택한 ${parts.join(", ")}를 삭제할까요?\n연결된 워크북·배정도 함께 삭제됩니다.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      if (setIds.length > 0) {
        const setResult = await deletePassageSetsAction(setIds);
        if (!setResult.ok) {
          window.alert(setResult.message);
          return;
        }
      }

      // 세트 삭제에 이미 포함된 지문은 cascade 되므로, 남은 선택만 삭제
      const deletedBySet = new Set(
        sets
          .filter((s) => setIds.includes(s.id))
          .flatMap((s) => s.passages.map((p) => p.id))
      );
      const remainingPassages = passageIds.filter((id) => !deletedBySet.has(id));
      if (remainingPassages.length > 0) {
        const passageResult = await deletePassagesAction(remainingPassages);
        if (!passageResult.ok) {
          window.alert(passageResult.message);
          return;
        }
      }

      setSelectedSets(new Set());
      setSelectedPassages(new Set());
      router.refresh();
    });
  }

  if (sets.length === 0 && orphans.length === 0) {
    return (
      <p className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
        등록된 지문 세트가 없습니다. 「지문 세트 추가」로 시작하세요.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="h-4 w-4 rounded border-slate-300"
          />
          전체 선택
        </label>
        <button
          type="button"
          disabled={pending || selectedCount === 0}
          onClick={() =>
            runDelete([...selectedSets], [...selectedPassages])
          }
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending
            ? "삭제 중…"
            : selectedCount > 0
              ? `선택 삭제 (${selectedCount})`
              : "선택 삭제"}
        </button>
        <p className="text-xs text-slate-500">
          세트·지문을 선택해 일괄 삭제할 수 있습니다.
        </p>
      </div>

      {sets.map((set) => (
        <section
          key={set.id}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex min-w-0 items-start gap-3">
              <input
                type="checkbox"
                checked={selectedSets.has(set.id)}
                onChange={() => toggleSet(set.id)}
                className="mt-1 h-4 w-4 rounded border-slate-300"
                aria-label={`${set.title} 세트 선택`}
              />
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-slate-900">
                  {set.title}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  지문 {set.passages.length}개
                  {set.grade ? ` · ${set.grade}` : ""}
                  {set.school_name ? ` · ${set.school_name}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={set.status} />
              <button
                type="button"
                disabled={pending}
                onClick={() => runDelete([set.id], [])}
                className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                세트 삭제
              </button>
            </div>
          </header>
          <ul className="divide-y divide-slate-100">
            {set.passages.map((p, i) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <input
                    type="checkbox"
                    checked={
                      selectedSets.has(set.id) || selectedPassages.has(p.id)
                    }
                    disabled={selectedSets.has(set.id)}
                    onChange={() => togglePassage(p.id)}
                    className="h-4 w-4 rounded border-slate-300"
                    aria-label={`${p.title} 선택`}
                  />
                  <Link
                    href={`${basePath}/passages/${p.id}`}
                    className="text-sm font-medium text-brand-700 hover:underline"
                  >
                    <span className="mr-2 text-slate-400">
                      {p.passage_number
                        ? `#${p.passage_number}`
                        : `지문 ${i + 1}`}
                    </span>
                    {p.exam_range || p.title}
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={p.status} />
                  <span className="text-xs text-slate-400">
                    {new Date(p.updated_at).toLocaleDateString("ko-KR")}
                  </span>
                  <button
                    type="button"
                    disabled={pending || selectedSets.has(set.id)}
                    onClick={() => runDelete([], [p.id])}
                    className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
            {set.passages.length === 0 && (
              <li className="px-4 py-4 text-sm text-slate-500">
                이 세트에 지문이 없습니다.
              </li>
            )}
          </ul>
        </section>
      ))}

      {orphans.length > 0 && (
        <section className="overflow-hidden rounded-xl border border-dashed border-slate-300 bg-white">
          <header className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-600">
            세트 없음 (이전 등록분)
          </header>
          <ul className="divide-y divide-slate-100">
            {orphans.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedPassages.has(p.id)}
                    onChange={() => togglePassage(p.id)}
                    className="h-4 w-4 rounded border-slate-300"
                    aria-label={`${p.title} 선택`}
                  />
                  <Link
                    href={`${basePath}/passages/${p.id}`}
                    className="text-sm font-medium text-brand-700 hover:underline"
                  >
                    {p.title}
                  </Link>
                </div>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => runDelete([], [p.id])}
                  className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
