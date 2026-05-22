"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { DeleteFolderButton } from "@/components/vocab/DeleteFolderButton";
import { VocabClassSidebarDelete } from "@/components/vocab/VocabClassSidebarDelete";
import type { Class, VocabFolder } from "@/types/database";

export interface VocabSidebarSet {
  id: string;
  title: string;
  folder_id: string | null;
  item_count: number;
}

interface VocabSidebarProps {
  role: "admin" | "teacher";
  classes: Class[];
  folders: VocabFolder[];
  sets: VocabSidebarSet[];
  classesHref: string;
  onCreateFolder: (name: string) => Promise<{ ok: boolean; message: string }>;
  onDeleteFolder: (folderId: string) => Promise<{ ok: boolean; message: string }>;
}

function navLink(pathname: string, href: string, activeClass: string) {
  const active =
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  return active
    ? activeClass
    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900";
}

export function VocabSidebar({
  role,
  classes,
  folders,
  sets,
  classesHref,
  onCreateFolder,
  onDeleteFolder,
}: VocabSidebarProps) {
  const pathname = usePathname();
  const base = role === "admin" ? "/admin/vocab" : "/teacher/vocab";
  const [classesOpen, setClassesOpen] = useState(true);
  const [foldersOpen, setFoldersOpen] = useState(true);
  const [folderName, setFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const setsByFolder = new Map<string, VocabSidebarSet[]>();
  let unfiledCount = 0;
  for (const s of sets) {
    if (s.folder_id) {
      const list = setsByFolder.get(s.folder_id) ?? [];
      list.push(s);
      setsByFolder.set(s.folder_id, list);
    } else {
      unfiledCount++;
    }
  }

  async function handleCreateFolder() {
    if (!folderName.trim()) return;
    setCreatingFolder(true);
    setMsg(null);
    const result = await onCreateFolder(folderName.trim());
    setMsg(result.message);
    if (result.ok) setFolderName("");
    setCreatingFolder(false);
  }

  const activeNav =
    "bg-emerald-50 font-semibold text-emerald-900 ring-1 ring-emerald-200/80";

  return (
    <aside className="flex w-full shrink-0 flex-col border-r border-slate-200 bg-white lg:w-72">
      <div className="border-b border-slate-100 px-4 py-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          단어 관리
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <button
          type="button"
          onClick={() => setClassesOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm font-bold text-slate-800"
        >
          <span>나의 클래스 ({classes.length})</span>
          <span className="text-slate-400">{classesOpen ? "▾" : "▸"}</span>
        </button>
        {classesOpen && (
          <div className="mt-1 space-y-0.5">
            <Link
              href={classesHref}
              className={`block rounded-lg px-3 py-2 text-sm ${navLink(pathname, classesHref, activeNav)}`}
            >
              + 클래스 관리
            </Link>
            {classes.length === 0 ? (
              <p className="px-3 py-2 text-xs text-slate-500">
                등록된 반이 없습니다.
              </p>
            ) : (
              classes.map((cls) => {
                const href =
                  role === "admin"
                    ? `/admin/classes/${cls.id}`
                    : `/teacher/classes/${cls.id}`;
                return (
                  <div
                    key={cls.id}
                    className={`flex items-center gap-0.5 rounded-lg pr-1 ${navLink(pathname, href, activeNav)}`}
                  >
                    <Link
                      href={href}
                      className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-sm"
                    >
                      <span className="text-emerald-600" aria-hidden>
                        👥
                      </span>
                      <span className="truncate">{cls.name}</span>
                    </Link>
                    <VocabClassSidebarDelete
                      role={role}
                      classId={cls.id}
                      className={cls.name}
                    />
                  </div>
                );
              })
            )}
          </div>
        )}

        <div className="mt-6">
          <button
            type="button"
            onClick={() => setFoldersOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm font-bold text-slate-800"
          >
            <span>나의 폴더 ({folders.length})</span>
            <span className="text-slate-400">{foldersOpen ? "▾" : "▸"}</span>
          </button>
          {foldersOpen && (
            <div className="mt-2 space-y-2">
              <div className="flex gap-1.5 px-1">
                <input
                  className="ui-input min-h-0 flex-1 py-2 text-sm"
                  placeholder="새 폴더 이름"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                />
                <button
                  type="button"
                  disabled={creatingFolder}
                  onClick={handleCreateFolder}
                  className="shrink-0 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  + 폴더
                </button>
              </div>
              {msg && (
                <p className="px-1 text-xs text-slate-600" role="status">
                  {msg}
                </p>
              )}
              <Link
                href={base}
                className={`block rounded-lg px-3 py-2 text-sm ${pathname === base ? activeNav : "text-slate-600 hover:bg-slate-50"}`}
              >
                전체 보기
              </Link>
              {folders.map((folder) => {
                const href = `${base}/folder/${folder.id}`;
                const folderSets = setsByFolder.get(folder.id) ?? [];
                const active =
                  pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <div
                    key={folder.id}
                    className={`flex items-center gap-0.5 rounded-lg pr-1 ${
                      active ? activeNav : ""
                    }`}
                  >
                    <Link
                      href={href}
                      className={`flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-sm ${
                        active ? "" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span aria-hidden>📁</span>
                      <span className="truncate font-medium">{folder.name}</span>
                      <span className="ml-auto shrink-0 text-xs text-slate-400">
                        {folderSets.length}
                      </span>
                    </Link>
                    <Link
                      href={`${href}?openAssign=1`}
                      title="학생·반 배정"
                      className="shrink-0 rounded px-1.5 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      배정
                    </Link>
                    <DeleteFolderButton
                      folderId={folder.id}
                      folderName={folder.name}
                      basePath={base}
                      onDelete={onDeleteFolder}
                    />
                  </div>
                );
              })}
              {unfiledCount > 0 && (
                <p className="px-2 text-xs text-slate-400">
                  미분류 세트 {unfiledCount}개
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
