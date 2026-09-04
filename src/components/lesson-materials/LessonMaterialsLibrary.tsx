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
  deleteLessonMaterialFolder,
  moveLessonMaterialProjects,
  permanentlyDeleteLessonMaterialProjects,
  renameLessonMaterialFolder,
  restoreLessonMaterialProjects,
  trashLessonMaterialProjects,
} from "@/lib/lesson-materials/library-ops";
import { updateLessonMaterialProjectMeta } from "@/lib/lesson-materials/lesson-pack-actions";
import { LessonMaterialsSelectionBar } from "@/components/lesson-materials/LessonMaterialsSelectionBar";
import type { LessonMaterialFolderRow } from "@/lib/lesson-materials/load-library";

type FolderFilter = "all" | "unfiled" | "trash" | string;

type LibraryTab =
  | "materials"
  | "analysis"
  | "questions"
  | "workbook"
  | "integrated";

const LIBRARY_TABS: Array<{ id: LibraryTab; label: string }> = [
  { id: "materials", label: "자료" },
  { id: "analysis", label: "분석 및 요약서" },
  { id: "questions", label: "변형 문제" },
  { id: "workbook", label: "워크북" },
  { id: "integrated", label: "최종 통합자료" },
];

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
  const [libraryTab, setLibraryTab] = useState<LibraryTab>("materials");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortNewest, setSortNewest] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [createParentId, setCreateParentId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [editingMetaId, setEditingMetaId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [menuFolderId, setMenuFolderId] = useState<string | null>(null);
  const [moveOpen, setMoveOpen] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    () => new Set(data.folders.map((f) => f.id))
  );
  const lastClicked = useRef<string | null>(null);

  const folderNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const f of data.folders) m.set(f.id, f.name);
    return m;
  }, [data.folders]);

  const childrenByParent = useMemo(() => {
    const m = new Map<string | null, LessonMaterialFolderRow[]>();
    for (const f of data.folders) {
      const key = f.parent_id ?? null;
      const list = m.get(key) ?? [];
      list.push(f);
      m.set(key, list);
    }
    return m;
  }, [data.folders]);

  function folderProjectCount(folderId: string): number {
    return data.projects.filter((p) => p.folder_id === folderId).length;
  }

  function collectDescendantIds(folderId: string): string[] {
    const out = [folderId];
    const kids = childrenByParent.get(folderId) ?? [];
    for (const k of kids) out.push(...collectDescendantIds(k.id));
    return out;
  }

  const foldersFlat = useMemo(() => {
    const out: Array<{ folder: LessonMaterialFolderRow; depth: number }> = [];
    function walk(parentId: string | null, depth: number) {
      for (const f of childrenByParent.get(parentId) ?? []) {
        out.push({ folder: f, depth });
        walk(f.id, depth + 1);
      }
    }
    walk(null, 0);
    return out;
  }, [childrenByParent]);

  const activeProjects = useMemo(() => {
    return [...data.unfiledProjects, ...data.projects];
  }, [data.unfiledProjects, data.projects]);

  const visibleProjects = useMemo(() => {
    let list: typeof activeProjects;
    if (folderFilter === "trash") {
      list = [...data.trashedProjects];
    } else if (folderFilter === "all") {
      list = [...activeProjects];
    } else if (folderFilter === "unfiled") {
      list = [...data.unfiledProjects];
    } else {
      const ids = new Set(collectDescendantIds(folderFilter));
      list = data.projects.filter(
        (p) => p.folder_id && ids.has(p.folder_id)
      );
    }

    if (libraryTab === "analysis") {
      list = list.filter((p) => p.has_analysis);
    } else if (libraryTab === "integrated") {
      list = list.filter((p) => p.has_lesson_pack);
    } else if (libraryTab === "questions" || libraryTab === "workbook") {
      list = [];
    }

    list.sort((a, b) => {
      const ta = new Date(a.updated_at).getTime();
      const tb = new Date(b.updated_at).getTime();
      return sortNewest ? tb - ta : ta - tb;
    });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    folderFilter,
    libraryTab,
    data,
    activeProjects,
    sortNewest,
    childrenByParent,
  ]);

  const totalActive = activeProjects.length;
  const selectedIds = [...selected];
  const selectedCount = selectedIds.length;
  const inTrash = folderFilter === "trash";
  const tabComingSoon =
    libraryTab === "questions" || libraryTab === "workbook";

  const currentFolderLabel =
    folderFilter === "all"
      ? "전체"
      : folderFilter === "unfiled"
        ? "미분류"
        : folderFilter === "trash"
          ? "휴지통"
          : (folderNameById.get(folderFilter) ?? "폴더");

  const tabEmptyMessage =
    libraryTab === "analysis"
      ? "이 폴더에 분석·요약서가 없습니다. 자료를 열어 논리 흐름을 만든 뒤 저장하세요."
      : libraryTab === "integrated"
        ? "저장된 수업용 자료가 없습니다. 자료를 선택한 뒤 「수업용 자료 제작」에서 저장하세요."
        : libraryTab === "questions"
          ? "변형 문제 모음은 준비 중입니다."
          : libraryTab === "workbook"
            ? "워크북 모음은 준비 중입니다."
            : "자료가 없습니다.";

  function projectOpenHref(projectId: string) {
    if (libraryTab === "integrated") {
      return `${base}/lesson-pack?ids=${encodeURIComponent(projectId)}`;
    }
    return `${base}/project/${projectId}`;
  }

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
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) {
        setError(res.message);
        return;
      }
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
      const res = await createLessonMaterialFolder(role, {
        name,
        parentId: createParentId,
      });
      if (res.ok) {
        setFolderName("");
        setCreatingFolder(false);
        setCreateParentId(null);
        if (res.folderId) {
          setFolderFilter(res.folderId);
          if (createParentId) {
            setExpandedFolders((prev) => new Set([...prev, createParentId]));
          }
        }
      }
      return res;
    });
  }

  function startRename(folder: LessonMaterialFolderRow) {
    setRenamingId(folder.id);
    setRenameValue(folder.name);
    setMenuFolderId(null);
  }

  function commitRename() {
    if (!renamingId) return;
    const name = renameValue.trim();
    if (!name) return;
    runAction(async () => {
      const res = await renameLessonMaterialFolder(role, {
        folderId: renamingId,
        name,
      });
      if (res.ok) setRenamingId(null);
      return res;
    });
  }

  function renderFolderRow(folder: LessonMaterialFolderRow, depth: number) {
    const kids = childrenByParent.get(folder.id) ?? [];
    const expanded = expandedFolders.has(folder.id);
    const count = folderProjectCount(folder.id);
    const isActive = folderFilter === folder.id;

    return (
      <div key={folder.id}>
        <div
          className={`group flex w-full items-center gap-1 rounded-xl px-2 py-1.5 text-left text-sm ${
            isActive
              ? "bg-violet-100 font-semibold text-violet-800"
              : "text-slate-700 hover:bg-slate-50"
          }`}
          style={{ paddingLeft: 8 + depth * 14 }}
        >
          {kids.length > 0 ? (
            <button
              type="button"
              className="h-5 w-5 shrink-0 text-xs text-slate-400"
              onClick={() =>
                setExpandedFolders((prev) => {
                  const next = new Set(prev);
                  if (next.has(folder.id)) next.delete(folder.id);
                  else next.add(folder.id);
                  return next;
                })
              }
            >
              {expanded ? "▾" : "▸"}
            </button>
          ) : (
            <span className="inline-block h-5 w-5 shrink-0" />
          )}
          {renamingId === folder.id ? (
            <input
              className="min-w-0 flex-1 rounded border border-violet-300 px-2 py-0.5 text-sm"
              value={renameValue}
              autoFocus
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") setRenamingId(null);
              }}
              onBlur={() => commitRename()}
            />
          ) : (
            <button
              type="button"
              className="min-w-0 flex-1 truncate text-left"
              onClick={() => {
                setFolderFilter(folder.id);
                setSelected(new Set());
                setMenuFolderId(null);
              }}
            >
              {folder.name}
            </button>
          )}
          <span className="text-xs text-slate-500">{count}</span>
          <div className="relative">
            <button
              type="button"
              className="rounded px-1 text-xs text-slate-400 opacity-0 group-hover:opacity-100"
              onClick={() =>
                setMenuFolderId((id) => (id === folder.id ? null : folder.id))
              }
            >
              ⋯
            </button>
            {menuFolderId === folder.id ? (
              <div className="absolute right-0 z-30 mt-1 w-36 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  className="block w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50"
                  onClick={() => startRename(folder)}
                >
                  이름 수정
                </button>
                <button
                  type="button"
                  className="block w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50"
                  onClick={() => {
                    setCreateParentId(folder.id);
                    setCreatingFolder(true);
                    setFolderName("");
                    setMenuFolderId(null);
                    setExpandedFolders((prev) => new Set([...prev, folder.id]));
                  }}
                >
                  하위 폴더 추가
                </button>
                <button
                  type="button"
                  className="block w-full px-3 py-1.5 text-left text-xs text-rose-600 hover:bg-rose-50"
                  onClick={() => {
                    if (
                      !confirm(
                        `"${folder.name}" 폴더를 삭제할까요?\n하위 폴더도 함께 삭제되고, 자료는 미분류로 이동합니다.`
                      )
                    ) {
                      return;
                    }
                    setMenuFolderId(null);
                    runAction(() =>
                      deleteLessonMaterialFolder(role, { folderId: folder.id })
                    );
                  }}
                >
                  폴더 삭제
                </button>
              </div>
            ) : null}
          </div>
        </div>
        {expanded
          ? kids.map((child) => renderFolderRow(child, depth + 1))
          : null}
      </div>
    );
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
            setCreateParentId(null);
            setError(null);
          }}
          className="mb-3 flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-violet-300 bg-violet-50 py-2.5 text-sm font-semibold text-violet-700 hover:bg-violet-100"
        >
          + 폴더 생성
        </button>

        {creatingFolder ? (
          <div className="mb-3 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            {createParentId ? (
              <p className="text-xs text-slate-500">
                상위: {folderNameById.get(createParentId) ?? "폴더"}
              </p>
            ) : null}
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder={createParentId ? "하위 폴더 이름" : "폴더 이름"}
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
                onClick={() => {
                  setCreatingFolder(false);
                  setCreateParentId(null);
                }}
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

          {(childrenByParent.get(null) ?? []).map((f) =>
            renderFolderRow(f, 0)
          )}
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

      <main className="min-w-0 flex-1 space-y-3">
        <nav
          className="flex flex-wrap gap-1 border-b border-slate-200 bg-white px-1"
          aria-label="자료 종류"
        >
          {LIBRARY_TABS.map((tab) => {
            const active = libraryTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setLibraryTab(tab.id);
                  setSelected(new Set());
                }}
                className={`-mb-px border-b-2 px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "border-violet-600 font-bold text-slate-900"
                    : "border-transparent font-medium text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-lg font-bold text-violet-700">
              {currentFolderLabel}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {tabComingSoon
                ? "준비 중"
                : `${visibleProjects.length}개의 자료가 있습니다.`}
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
                      {foldersFlat.map(({ folder: f, depth }) => (
                        <button
                          key={f.id}
                          type="button"
                          className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
                          style={{ paddingLeft: 12 + depth * 12 }}
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
                      {foldersFlat.map(({ folder: f, depth }) => (
                        <button
                          key={f.id}
                          type="button"
                          className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
                          style={{ paddingLeft: 12 + depth * 12 }}
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

        {!tabComingSoon ? (
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
        ) : null}

        <ul className="mt-3 space-y-2">
          {tabComingSoon || visibleProjects.length === 0 ? (
            <li className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
              {tabEmptyMessage}
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
              const openHref = inTrash
                ? undefined
                : projectOpenHref(p.id);
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
                      ) : editingMetaId === p.id ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            className="min-w-0 flex-1 rounded-lg border border-violet-300 px-2.5 py-1.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-violet-200"
                            value={editTitle}
                            autoFocus
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Escape") setEditingMetaId(null);
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const name = editTitle.trim();
                                if (!name) return;
                                runAction(async () => {
                                  const res =
                                    await updateLessonMaterialProjectMeta(
                                      role,
                                      { projectId: p.id, title: name }
                                    );
                                  if (res.ok) setEditingMetaId(null);
                                  return res;
                                });
                              }
                            }}
                          />
                          <Button
                            type="button"
                            size="sm"
                            disabled={pending || !editTitle.trim()}
                            onClick={() => {
                              const name = editTitle.trim();
                              if (!name) return;
                              runAction(async () => {
                                const res =
                                  await updateLessonMaterialProjectMeta(role, {
                                    projectId: p.id,
                                    title: name,
                                  });
                                if (res.ok) setEditingMetaId(null);
                                return res;
                              });
                            }}
                          >
                            저장
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => setEditingMetaId(null)}
                          >
                            취소
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-start gap-1.5">
                          <Link
                            href={openHref ?? `${base}/project/${p.id}`}
                            className="min-w-0 flex-1 truncate font-semibold text-slate-900 hover:text-violet-700"
                            target={
                              libraryTab === "integrated" ? "_blank" : undefined
                            }
                            rel={
                              libraryTab === "integrated"
                                ? "noopener noreferrer"
                                : undefined
                            }
                          >
                            {p.title}
                          </Link>
                          <button
                            type="button"
                            title="이름 변경"
                            aria-label="이름 변경"
                            className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-violet-50 hover:text-violet-700"
                            onClick={() => {
                              setEditingMetaId(p.id);
                              setEditTitle(p.title);
                            }}
                          >
                            <svg
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="h-4 w-4"
                              aria-hidden
                            >
                              <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-.793.793-2.828-2.828.793-.793ZM11.379 5.793 3 14.172V17h2.828l8.38-8.379-2.83-2.828Z" />
                            </svg>
                          </button>
                        </div>
                      )}
                      {p.title_en?.trim() ? (
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {p.title_en}
                        </p>
                      ) : null}
                      {p.source?.trim() ? (
                        <p className="mt-0.5 truncate text-xs text-slate-400">
                          출처: {p.source}
                        </p>
                      ) : null}
                      {libraryTab === "integrated" ? (
                        <p className="mt-1 text-xs font-semibold text-violet-600">
                          수업용 자료 · 클릭하여 열기
                        </p>
                      ) : snippet ? (
                        <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                          {snippet}
                        </p>
                      ) : null}
                      {libraryTab === "materials" && p.has_lesson_pack ? (
                        <p className="mt-1 text-xs text-violet-600">
                          최종 통합자료 저장됨
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
        </div>
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
