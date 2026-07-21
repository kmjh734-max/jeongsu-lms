"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ListeningScheduleAssignModal } from "@/components/listening/ListeningScheduleAssignModal";
import { ListeningSetAssignModal } from "@/components/listening/ListeningSetAssignModal";
import type { ListeningAssignmentSummary } from "@/lib/listening/load-assignment-summaries";
import type { ListeningSetFolderItem } from "@/lib/listening/load-listening-page-data";

export interface ListeningSetListItem {
  id: string;
  title: string;
  is_published: boolean;
  created_at: string;
  folder_id: string | null;
  order_index: number;
  is_locked?: boolean;
}

interface ClassOption {
  id: string;
  name: string;
}

type FolderFilter = "all" | "uncategorized" | string;

interface ListeningSetsListClientProps {
  sets: ListeningSetListItem[];
  folders?: ListeningSetFolderItem[];
  basePath: "/admin/listening" | "/teacher/listening";
  classes?: ClassOption[];
  assignmentBySetId?: Record<string, ListeningAssignmentSummary>;
  /** 만들기 전용: 배정 UI 숨김 */
  createOnly?: boolean;
}

export function ListeningSetsListClient({
  sets,
  folders = [],
  basePath,
  classes = [],
  assignmentBySetId = {},
  createOnly = false,
}: ListeningSetsListClientProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [folderName, setFolderName] = useState("");
  const [busy, setBusy] = useState(false);
  const [folderBusy, setFolderBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [movingSetId, setMovingSetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignSetId, setAssignSetId] = useState<string | null>(null);
  const [folderFilter, setFolderFilter] = useState<FolderFilter>("all");
  const [folderList, setFolderList] = useState(folders);
  const [localSets, setLocalSets] = useState<ListeningSetListItem[]>(sets);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dropFolder, setDropFolder] = useState<FolderFilter | null>(null);

  useEffect(() => {
    setFolderList(folders);
  }, [folders]);

  useEffect(() => {
    setLocalSets(sets);
  }, [sets]);

  const setTitles = useMemo(() => {
    const m: Record<string, string> = {};
    for (const s of sets) m[s.id] = s.title;
    return m;
  }, [sets]);

  const folderNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const f of folderList) m.set(f.id, f.name);
    return m;
  }, [folderList]);

  const countsByFolder = useMemo(() => {
    const counts = new Map<string | "uncategorized", number>();
    counts.set("uncategorized", 0);
    for (const f of folderList) counts.set(f.id, 0);
    for (const set of localSets) {
      if (!set.folder_id) {
        counts.set("uncategorized", (counts.get("uncategorized") ?? 0) + 1);
      } else {
        counts.set(set.folder_id, (counts.get(set.folder_id) ?? 0) + 1);
      }
    }
    return counts;
  }, [localSets, folderList]);

  const sortedSets = useMemo(
    () => [...localSets].sort((a, b) => a.order_index - b.order_index),
    [localSets]
  );

  const filteredSets = useMemo(() => {
    if (folderFilter === "all") return sortedSets;
    if (folderFilter === "uncategorized") {
      return sortedSets.filter((s) => !s.folder_id);
    }
    return sortedSets.filter((s) => s.folder_id === folderFilter);
  }, [sortedSets, folderFilter]);

  const activeFolderId =
    folderFilter !== "all" && folderFilter !== "uncategorized"
      ? folderFilter
      : null;

  const allSelected =
    filteredSets.length > 0 && selectedIds.size === filteredSets.length;

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
      setSelectedIds(new Set(filteredSets.map((s) => s.id)));
    }
  }

  async function createFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!folderName.trim()) return;
    setFolderBusy(true);
    setError(null);
    const res = await fetch("/api/listening/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: folderName.trim() }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      message?: string;
      folder?: ListeningSetFolderItem;
    };
    setFolderBusy(false);
    if (!data.ok || !data.folder) {
      setError(data.message ?? "폴더 생성 실패");
      return;
    }
    setFolderList((prev) => [...prev, data.folder!]);
    setFolderName("");
    setFolderFilter(data.folder.id);
    router.refresh();
  }

  async function deleteFolder(folderId: string) {
    const name = folderNameById.get(folderId) ?? "폴더";
    if (
      !window.confirm(
        `「${name}」 폴더를 삭제할까요?\n안의 세트는 미분류로 이동합니다.`
      )
    ) {
      return;
    }
    setFolderBusy(true);
    setError(null);
    const res = await fetch(`/api/listening/folders/${folderId}`, {
      method: "DELETE",
    });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    setFolderBusy(false);
    if (!data.ok) {
      setError(data.message ?? "폴더 삭제 실패");
      return;
    }
    setFolderList((prev) => prev.filter((f) => f.id !== folderId));
    if (folderFilter === folderId) setFolderFilter("all");
    router.refresh();
  }

  async function moveSetToFolder(setId: string, folderId: string | null) {
    const target = localSets.find((s) => s.id === setId);
    if (target && (target.folder_id ?? null) === folderId) return;
    setMovingSetId(setId);
    setError(null);
    setLocalSets((prev) =>
      prev.map((s) => (s.id === setId ? { ...s, folder_id: folderId } : s))
    );
    const res = await fetch(`/api/listening/sets/${setId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderId }),
    });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    setMovingSetId(null);
    if (!data.ok) {
      setError(data.message ?? "폴더 이동 실패");
    }
    router.refresh();
  }

  async function persistOrder(nextVisible: ListeningSetListItem[]) {
    // 보이는 목록이 이미 가진 order_index 슬롯을 정렬해 새 순서에 재배정한다.
    // (다른 폴더/숨겨진 세트의 순서는 건드리지 않음)
    const slots = nextVisible
      .map((s) => s.order_index)
      .sort((a, b) => a - b);
    const items = nextVisible.map((s, i) => ({
      id: s.id,
      orderIndex: slots[i] ?? i,
    }));
    const orderById = new Map(items.map((it) => [it.id, it.orderIndex]));
    setLocalSets((prev) =>
      prev.map((s) =>
        orderById.has(s.id)
          ? { ...s, order_index: orderById.get(s.id)! }
          : s
      )
    );
    setError(null);
    const res = await fetch("/api/listening/sets/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    if (!data.ok) {
      setError(data.message ?? "순서 저장 실패");
      router.refresh();
    }
  }

  function handleRowDrop(targetId: string) {
    const sourceId = dragId;
    setDragId(null);
    setDragOverId(null);
    if (!sourceId || sourceId === targetId) return;
    const current = filteredSets;
    const from = current.findIndex((s) => s.id === sourceId);
    const to = current.findIndex((s) => s.id === targetId);
    if (from === -1 || to === -1) return;
    const next = [...current];
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(to, 0, moved);
    void persistOrder(next);
  }

  function handleFolderDrop(target: FolderFilter) {
    const sourceId = dragId;
    setDragId(null);
    setDragOverId(null);
    setDropFolder(null);
    if (!sourceId || target === "all") return;
    void moveSetToFolder(
      sourceId,
      target === "uncategorized" ? null : target
    );
  }

  async function moveFolder(folderId: string, dir: -1 | 1) {
    const idx = folderList.findIndex((f) => f.id === folderId);
    const swapWith = idx + dir;
    if (idx === -1 || swapWith < 0 || swapWith >= folderList.length) return;
    const next = [...folderList];
    const tmp = next[idx]!;
    next[idx] = next[swapWith]!;
    next[swapWith] = tmp;
    const reindexed = next.map((f, i) => ({ ...f, order_index: i }));
    setFolderList(reindexed);
    setError(null);
    const res = await fetch("/api/listening/folders/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: reindexed.map((f) => ({ id: f.id, orderIndex: f.order_index })),
      }),
    });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    if (!data.ok) {
      setError(data.message ?? "폴더 순서 저장 실패");
      router.refresh();
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
      body: JSON.stringify({
        title: title.trim(),
        folderId: activeFolderId,
      }),
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
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row">
        <aside className="w-full shrink-0 space-y-3 rounded-xl border border-slate-200 bg-white p-4 lg:w-60">
          <h3 className="text-sm font-semibold text-slate-900">폴더</h3>

          <form onSubmit={createFolder} className="space-y-2">
            <input
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="예: 0605 시리즈"
              className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={folderBusy}
              className="w-full rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-800 disabled:opacity-50"
            >
              {folderBusy ? "만드는 중…" : "폴더 만들기"}
            </button>
          </form>

          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setFolderFilter("all")}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-medium ${
                folderFilter === "all"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              전체 ({localSets.length})
            </button>

            <button
              type="button"
              onClick={() => setFolderFilter("uncategorized")}
              onDragOver={(e) => {
                if (!dragId) return;
                e.preventDefault();
                setDropFolder("uncategorized");
              }}
              onDragLeave={() =>
                setDropFolder((p) => (p === "uncategorized" ? null : p))
              }
              onDrop={(e) => {
                e.preventDefault();
                handleFolderDrop("uncategorized");
              }}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-medium ${
                dropFolder === "uncategorized"
                  ? "ring-2 ring-indigo-400 ring-inset"
                  : ""
              } ${
                folderFilter === "uncategorized"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              미분류 ({countsByFolder.get("uncategorized") ?? 0})
            </button>

            {folderList.map((folder, i) => {
              const active = folderFilter === folder.id;
              return (
                <div
                  key={folder.id}
                  onDragOver={(e) => {
                    if (!dragId) return;
                    e.preventDefault();
                    setDropFolder(folder.id);
                  }}
                  onDragLeave={() =>
                    setDropFolder((p) => (p === folder.id ? null : p))
                  }
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFolderDrop(folder.id);
                  }}
                  className={`flex items-center gap-0.5 rounded-lg pr-1 ${
                    dropFolder === folder.id
                      ? "ring-2 ring-indigo-400 ring-inset"
                      : ""
                  } ${active ? "bg-indigo-600" : "hover:bg-slate-50"}`}
                >
                  <button
                    type="button"
                    onClick={() => setFolderFilter(folder.id)}
                    className={`min-w-0 flex-1 truncate rounded-lg px-3 py-2 text-left text-sm font-medium ${
                      active ? "text-white" : "text-slate-700"
                    }`}
                  >
                    {folder.name} ({countsByFolder.get(folder.id) ?? 0})
                  </button>
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() => void moveFolder(folder.id, -1)}
                    aria-label={`${folder.name} 위로`}
                    className={`shrink-0 rounded px-1 text-xs leading-none disabled:opacity-30 ${
                      active
                        ? "text-white hover:bg-white/20"
                        : "text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    disabled={i === folderList.length - 1}
                    onClick={() => void moveFolder(folder.id, 1)}
                    aria-label={`${folder.name} 아래로`}
                    className={`shrink-0 rounded px-1 text-xs leading-none disabled:opacity-30 ${
                      active
                        ? "text-white hover:bg-white/20"
                        : "text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    ▼
                  </button>
                  <button
                    type="button"
                    disabled={folderBusy}
                    onClick={() => void deleteFolder(folder.id)}
                    aria-label={`${folder.name} 삭제`}
                    className={`shrink-0 rounded px-1 text-xs leading-none disabled:opacity-30 ${
                      active
                        ? "text-white hover:bg-white/20"
                        : "text-slate-400 hover:bg-red-100 hover:text-red-600"
                    }`}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}

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
            {activeFolderId && (
              <p className="text-xs text-slate-500">
                「{folderNameById.get(activeFolderId)}」 폴더에 생성됩니다
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {busy ? "만드는 중…" : "세트 만들기"}
            </button>
          </form>

      {filteredSets.length === 0 ? (
        <p className="text-sm text-slate-600">
          {sets.length === 0
            ? "등록된 듣기 세트가 없습니다."
            : "이 폴더에 세트가 없습니다."}
        </p>
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

          <p className="text-xs text-slate-500">
            ⠿ 손잡이를 잡고 끌어 순서를 바꾸거나, 왼쪽 폴더 위로 놓아 폴더를
            이동할 수 있어요.
          </p>

          <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {filteredSets.map((set) => (
              <li
                key={set.id}
                onDragOver={(e) => {
                  if (!dragId || dragId === set.id) return;
                  e.preventDefault();
                  setDragOverId(set.id);
                }}
                onDragLeave={() =>
                  setDragOverId((p) => (p === set.id ? null : p))
                }
                onDrop={(e) => {
                  e.preventDefault();
                  handleRowDrop(set.id);
                }}
                className={`flex flex-wrap items-center gap-2 px-4 py-3 ${
                  dragId === set.id ? "opacity-50" : ""
                } ${
                  dragOverId === set.id
                    ? "border-t-2 border-t-indigo-500 bg-indigo-50/40"
                    : ""
                }`}
              >
                <span
                  draggable
                  onDragStart={() => setDragId(set.id)}
                  onDragEnd={() => {
                    setDragId(null);
                    setDragOverId(null);
                    setDropFolder(null);
                  }}
                  className="shrink-0 cursor-grab select-none px-1 text-slate-400 hover:text-slate-600 active:cursor-grabbing"
                  title="드래그하여 순서 변경 / 폴더 탭에 놓아 이동"
                  aria-label={`${set.title} 순서 이동 손잡이`}
                >
                  ⠿
                </span>
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
                  {set.is_locked ? (
                    <span className="ml-2 inline-flex rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 ring-1 ring-amber-200">
                      커리큘럼 · 잠금
                    </span>
                  ) : null}
                  {set.folder_id && folderFilter === "all" && (
                    <span className="ml-2 text-xs text-indigo-600">
                      {folderNameById.get(set.folder_id) ?? "폴더"}
                    </span>
                  )}
                </Link>
                <select
                  value={set.folder_id ?? ""}
                  disabled={movingSetId === set.id}
                  onChange={(e) =>
                    void moveSetToFolder(
                      set.id,
                      e.target.value ? e.target.value : null
                    )
                  }
                  className="shrink-0 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700"
                  aria-label={`${set.title} 폴더 이동`}
                >
                  <option value="">미분류</option>
                  {folderList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
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
                  disabled={
                    deletingId === set.id ||
                    (basePath.startsWith("/teacher") && !!set.is_locked)
                  }
                  onClick={() => deleteSet(set.id, set.title)}
                  className="shrink-0 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
                  title={
                    basePath.startsWith("/teacher") && set.is_locked
                      ? "잠긴 커리큘럼 세트는 삭제할 수 없습니다"
                      : undefined
                  }
                >
                  {deletingId === set.id ? "삭제 중…" : "삭제"}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
        </div>
      </div>

      {assignTarget && (
        <ListeningSetAssignModal
          setId={assignTarget.id}
          setTitle={assignTarget.title}
          classes={classes}
          assignedClassNames={assignmentBySetId[assignTarget.id]?.classNames ?? []}
          assignedStudentNames={
            assignmentBySetId[assignTarget.id]?.studentNames ?? []
          }
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
