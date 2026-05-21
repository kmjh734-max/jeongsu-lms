"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
}

function linkClass(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
    ? "bg-violet-100 font-semibold text-violet-900"
    : "text-slate-700 hover:bg-slate-100";
}

export function VocabSidebar({
  role,
  classes,
  folders,
  sets,
  classesHref,
  onCreateFolder,
}: VocabSidebarProps) {
  const pathname = usePathname();
  const base = role === "admin" ? "/admin/vocab" : "/teacher/vocab";
  const [classesOpen, setClassesOpen] = useState(true);
  const [foldersOpen, setFoldersOpen] = useState(true);
  const [folderName, setFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const setsByFolder = new Map<string, VocabSidebarSet[]>();
  const unfiled: VocabSidebarSet[] = [];
  for (const s of sets) {
    if (s.folder_id) {
      const list = setsByFolder.get(s.folder_id) ?? [];
      list.push(s);
      setsByFolder.set(s.folder_id, list);
    } else {
      unfiled.push(s);
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

  return (
    <aside className="flex w-full shrink-0 flex-col border-r border-slate-200 bg-white lg:w-64">
      <div className="border-b border-slate-100 px-3 py-3">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          단어 관리
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        <button
          type="button"
          onClick={() => setClassesOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm font-bold text-slate-800"
        >
          <span>나의 클래스 ({classes.length})</span>
          <span className="text-slate-400">{classesOpen ? "▾" : "▸"}</span>
        </button>
        {classesOpen && (
          <div className="mt-1 space-y-0.5 pl-1">
            <Link
              href={classesHref}
              className={`block rounded px-2 py-1.5 text-sm ${linkClass(pathname, classesHref)}`}
            >
              + 클래스 관리
            </Link>
            {classes.length === 0 ? (
              <p className="px-2 py-2 text-xs text-slate-500">
                등록된 반이 없습니다.
              </p>
            ) : (
              classes.map((cls) => {
                const href =
                  role === "admin"
                    ? `/admin/classes/${cls.id}`
                    : `/teacher/classes/${cls.id}`;
                return (
                  <Link
                    key={cls.id}
                    href={href}
                    className={`flex items-center gap-2 rounded px-2 py-1.5 text-sm ${linkClass(pathname, href)}`}
                  >
                    <span className="text-violet-500" aria-hidden>
                      👥
                    </span>
                    <span className="truncate">{cls.name}</span>
                  </Link>
                );
              })
            )}
          </div>
        )}

        <div className="mt-5">
          <button
            type="button"
            onClick={() => setFoldersOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm font-bold text-slate-800"
          >
            <span>나의 폴더 ({folders.length})</span>
            <span className="text-slate-400">{foldersOpen ? "▾" : "▸"}</span>
          </button>
          {foldersOpen && (
            <div className="mt-1 space-y-2 pl-1">
              <div className="flex gap-1 px-1">
                <input
                  className="ui-input min-h-0 flex-1 py-1 text-xs"
                  placeholder="새 폴더 이름"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                />
                <button
                  type="button"
                  disabled={creatingFolder}
                  onClick={handleCreateFolder}
                  className="shrink-0 rounded border-2 border-violet-500 px-2 py-1 text-xs font-bold text-violet-700 hover:bg-violet-50"
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
                className={`block rounded px-2 py-1.5 text-sm ${pathname === base ? "bg-violet-100 font-semibold text-violet-900" : "text-slate-600 hover:bg-slate-100"}`}
              >
                전체 보기
              </Link>
              {folders.map((folder) => {
                const href = `${base}/folder/${folder.id}`;
                const folderSets = setsByFolder.get(folder.id) ?? [];
                const active =
                  pathname === href || pathname.startsWith(`${href}/`);
                const assignHref = `${href}#assign`;
                return (
                  <div key={folder.id} className="flex items-center gap-0.5">
                    <Link
                      href={href}
                      className={`flex min-w-0 flex-1 items-center gap-2 rounded px-2 py-1.5 text-sm ${
                        active
                          ? "bg-violet-100 font-semibold text-violet-900"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span aria-hidden>📁</span>
                      <span className="truncate">{folder.name}</span>
                      <span className="ml-auto shrink-0 text-xs text-slate-400">
                        {folderSets.length}
                      </span>
                    </Link>
                    <Link
                      href={assignHref}
                      title="학생·반 배정"
                      className="shrink-0 rounded px-1.5 py-1 text-[10px] font-bold leading-none text-violet-600 hover:bg-violet-100"
                    >
                      배정
                    </Link>
                  </div>
                );
              })}
              {unfiled.length > 0 && (
                <p className="px-2 text-xs text-slate-400">
                  폴더 없음 {unfiled.length}개 세트
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
