"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import {
  analysisSnippet,
  type LessonMaterialLibraryData,
} from "@/lib/lesson-materials/load-library";
import {
  copyLessonMaterialProjects,
  createLessonMaterialFolder,
  moveLessonMaterialProjects,
  permanentlyDeleteLessonMaterialProjects,
  restoreLessonMaterialProjects,
  trashLessonMaterialProjects,
} from "@/lib/lesson-materials/library-ops";
import { LessonMaterialsSelectionBar } from "@/components/lesson-materials/LessonMaterialsSelectionBar";

type FolderFilter = "all" | "unfiled" | "trash" | string;

function formatUpdatedAt(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("ko-KR", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function LessonMaterialsLibrary({
  role,
  data,
}: {
  role: "admin" | "teacher";
  data: LessonMaterialLibraryData;
}) {
  const router = useRouter();
  const base = role === "admin" ? "/admin/lesson-materials" : "/teacher/lesson-materials";
  const [folderFilter, setFolderFilter] = useState<FolderFilter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortNewest, setSortNewest] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [moveOpen, setMoveOpen] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const lastClicked = useRef<string | null>(null);

  const folderNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const f of data.folders) m.set(f.id, f.name);
    return m;
  }, [data.folders]);

  const activeProjects = useMemo(() => {
    return [...data.unfiledProjects, ...data.projects];
  }, [data.unfiledProjects, data.projects]);

  const visibleProjects = useMemo(() => {
    let list =
      folderFilter === "trash"
        ? [...data.trashedProjects]
        : folderFilter === "all"
          ? [...activeProjects]
          : folderFilter === "unfiled"
            ? [...data.unfiledProjects]
            : data.projects.filter((p) => p.folder_id === folderFilter);

    list.sort((a, b) => {
      const ta = new Date(a.updated_at).getTime();
      const tb = new Date(b.updated_at).getTime();
      return sortNewest ? tb - ta : ta - tb;
    });
    return list;
  }, [folderFilter, data, activeProjects, sortNewest]);

  const totalActive = activeProjects.length;
  const selectedIds = [...selected];
  const selectedCount = selectedIds.length;
  const inTrash = folderFilter === "trash";

  const currentFolderLabel =
    folderFilter === "all"
      ? "전체"
      : folderFilter === "unfiled"
        ? "미분류"
        : folderFilter === "trash"
          ? "휴지통"
          : (folderNameById.get(folderFilter) ?? "폴더");

  function toggleSelect(id: string, shiftKey: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (shiftKey && lastClicked.current) {
        const ids = visibleProjects.map((p) => p.id);
        const a = ids.indexOf(lastClicked.current);
        const b = ids.indexOf(id);
        if (a >= 0 && b >= 0) {
          const [from, to] = a < b ? [a, b] : [b, a];
          for (let i = from; i <= to; i++) next.add(ids[i]!);
          lastClicked.current = id;
          return next;
        }
      }
      if (next.has(id)) next.delete(id);
      else next.add(id);
      lastClicked.current = id;
      return next;
    });
  }

  function selectAllVisible(checked: boolean) {
    if (!checked) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(visibleProjects.map((p) => p.id)));
  }

  function runAction(fn: () => Promise<{ ok: boolean; message: string }>) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setMessage(res.message);
      setSelected(new Set());
      setMoveOpen(false);
      setCopyOpen(false);
      router.refresh();
    });
  }

  async function handleCreateFolder() {
    const name = folderName.trim();
    if (!name) {
      setError("폴더 이름을 입력해 주세요.");
      return;
    }
    runAction(async () => {
      const res = await createLessonMaterialFolder(role, { name });
      if (res.ok) {
        setFolderName("");
        setCreatingFolder(false);
        if (res.folderId) setFolderFilter(res.folderId);
      }
      return res;
    });
  }

  return (
    <div className="flex gap-6 pb-28">
      <aside className="w-72 shrink-0 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              자료함 폴더
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {data.folders.length}개 폴더
            </p>
          </div>
          <button
            type="button"
            title="휴지통"
            onClick={() => {
              setFolderFilter("trash");
              setSelected(new Set());
            }}
            className={`rounded-lg p-2 text-slate-500 hover:bg-slate-100 ${
              folderFilter === "trash" ? "bg-violet-50 text-violet-700" : ""
            }`}
          >
            🗑
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setCreatingFolder((v) => !v);
            setError(null);
          }}
          className="mb-3 flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-violet-300 bg-violet-50 py-2.5 text-sm font-semibold text-violet-700 hover:bg-violet-100"
        >
          + 폴더 생성
        </button>

        {creatingFolder ? (
          <div className="mb-3 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="폴더 이름"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleCreateFolder();
              }}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                disabled={pending}
                onClick={() => void handleCreateFolder()}
              >
                만들기
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setCreatingFolder(false)}
              >
                취소
              </Button>
            </div>
          </div>
        ) : null}

        <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
          <span>전체 자료 {totalActive}</span>
          <span>미분류: {data.unfiledProjects.length}</span>
        </div>

        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => {
              setFolderFilter("all");
              setSelected(new Set());
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm ${
              folderFilter === "all"
                ? "bg-violet-100 font-semibold text-violet-800"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span>전체</span>
            <span className="text-xs text-slate-500">{totalActive}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFolderFilter("unfiled");
              setSelected(new Set());
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm ${
              folderFilter === "unfiled"
                ? "bg-violet-100 font-semibold text-violet-800"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span>미분류</span>
            <span className="text-xs text-slate-500">
              {data.unfiledProjects.length}
            </span>
          </button>

          {data.folders.map((f) => {
            const count = data.projects.filter((p) => p.folder_id === f.id)
              .length;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setFolderFilter(f.id);
                  setSelected(new Set());
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm ${
                  folderFilter === f.id
                    ? "bg-violet-100 font-semibold text-violet-800"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="truncate">{f.name}</span>
                <span className="text-xs text-slate-500">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <Link
            href={`${base}/input`}
            className="inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
          >
            + 새 자료 추가
          </Link>
        </div>
      </aside>

      <main className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              {currentFolderLabel}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {visibleProjects.length}개의 자료가 있습니다
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600"
              onClick={() => setSortNewest((v) => !v)}
            >
              {sortNewest ? "최신순 ▾" : "오래된순 ▾"}
            </button>

            {selectedCount > 0 && !inTrash ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={pending}
                  onClick={() =>
                    runAction(() =>
                      trashLessonMaterialProjects(role, {
                        projectIds: selectedIds,
                      })
                    )
                  }
                >
                  휴지통 이동 ({selectedCount})
                </Button>
                <div className="relative">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={pending}
                    onClick={() => {
                      setMoveOpen((v) => !v);
                      setCopyOpen(false);
                    }}
                  >
                    선택 이동 ({selectedCount})
                  </Button>
                  {moveOpen ? (
                    <div className="absolute right-0 z-20 mt-1 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                      <button
                        type="button"
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
                        onClick={() =>
                          runAction(() =>
                            moveLessonMaterialProjects(role, {
                              projectIds: selectedIds,
                              folderId: null,
                            })
                          )
                        }
                      >
                        미분류
                      </button>
                      {data.folders.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
                          onClick={() =>
                            runAction(() =>
                              moveLessonMaterialProjects(role, {
                                projectIds: selectedIds,
                                folderId: f.id,
                              })
                            )
                          }
                        >
                          {f.name}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="relative">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={pending}
                    onClick={() => {
                      setCopyOpen((v) => !v);
                      setMoveOpen(false);
                    }}
                  >
                    복사 ({selectedCount})
                  </Button>
                  {copyOpen ? (
                    <div className="absolute right-0 z-20 mt-1 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                      <button
                        type="button"
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
                        onClick={() =>
                          runAction(() =>
                            copyLessonMaterialProjects(role, {
                              projectIds: selectedIds,
                              folderId: null,
                            })
                          )
                        }
                      >
                        미분류로 복사
                      </button>
                      {data.folders.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
                          onClick={() =>
                            runAction(() =>
                              copyLessonMaterialProjects(role, {
                                projectIds: selectedIds,
                                folderId: f.id,
                              })
                            )
                          }
                        >
                          {f.name}로 복사
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </>
            ) : null}

            {selectedCount > 0 && inTrash ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={pending}
                  onClick={() =>
                    runAction(() =>
                      restoreLessonMaterialProjects(role, {
                        projectIds: selectedIds,
                      })
                    )
                  }
                >
                  복원 ({selectedCount})
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="bg-rose-600 hover:bg-rose-700"
                  disabled={pending}
                  onClick={() => {
                    if (
                      !confirm(
                        "선택한 자료를 영구 삭제할까요? 되돌릴 수 없습니다."
                      )
                    ) {
                      return;
                    }
                    runAction(() =>
                      permanentlyDeleteLessonMaterialProjects(role, {
                        projectIds: selectedIds,
                      })
                    );
                  }}
                >
                  영구 삭제 ({selectedCount})
                </Button>
              </>
            ) : null}

            <Link
              href={`${base}/input`}
              className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-700"
            >
              + 새 자료 추가
            </Link>
          </div>
        </div>

        {error ? (
          <Alert variant="error" className="mt-3">
            {error}
          </Alert>
        ) : null}
        {message ? (
          <Alert variant="success" className="mt-3">
            {message}
          </Alert>
        ) : null}

        <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <label className="inline-flex items-center gap-2 font-semibold">
            <input
              type="checkbox"
              checked={
                visibleProjects.length > 0 &&
                visibleProjects.every((p) => selected.has(p.id))
              }
              onChange={(e) => selectAllVisible(e.target.checked)}
            />
            전체 선택
          </label>
          <span className="text-xs text-slate-400">
            Shift + 클릭으로 범위 선택
          </span>
        </div>

        <ul className="mt-3 space-y-2">
          {visibleProjects.length === 0 ? (
            <li className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
              자료가 없습니다.
            </li>
          ) : (
            visibleProjects.map((p) => {
              const checked = selected.has(p.id);
              const snippet = analysisSnippet(p.analysis_json);
              const folderLabel = p.deleted_at
                ? "휴지통"
                : p.folder_id
                  ? (folderNameById.get(p.folder_id) ?? "폴더")
                  : "미분류";
              return (
                <li
                  key={p.id}
                  className={`rounded-xl border px-4 py-3 ${
                    checked
                      ? "border-violet-300 bg-violet-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-1 cursor-grab text-slate-300" aria-hidden>
                      ⠿
                    </span>
                    <input
                      type="checkbox"
                      className="mt-1.5"
                      checked={checked}
                      onChange={(e) =>
                        toggleSelect(p.id, (e.nativeEvent as MouseEvent).shiftKey)
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        if (e.shiftKey) {
                          e.preventDefault();
                          toggleSelect(p.id, true);
                        }
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      {inTrash ? (
                        <div className="truncate font-semibold text-slate-900">
                          {p.title}
                        </div>
                      ) : (
                        <Link
                          href={`${base}/project/${p.id}`}
                          className="truncate font-semibold text-slate-900 hover:text-violet-700"
                        >
                          {p.title}
                        </Link>
                      )}
                      {snippet ? (
                        <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                          {snippet}
                        </p>
                      ) : null}
                    </div>
                    <div className="shrink-0 text-right text-xs text-slate-500">
                      <div>{formatUpdatedAt(p.updated_at)}</div>
                      <div className="mt-1">
                        문장 {data.itemCountByProjectId[p.id] ?? 0}개 ·{" "}
                        {folderLabel}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </main>

      {!inTrash ? (
        <LessonMaterialsSelectionBar
          role={role}
          selectedCount={selectedCount}
          selectedIds={selectedIds}
        />
      ) : null}
    </div>
  );
}
