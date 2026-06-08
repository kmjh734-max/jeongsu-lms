"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { DeleteFolderButton } from "@/components/vocab/DeleteFolderButton";
import type { VocabSidebarSet } from "@/components/vocab/vocab-sidebar-types";
import type { VocabFolder } from "@/types/database";

interface VocabFolderSidebarProps {
  role: "admin" | "teacher";
  folders: VocabFolder[];
  sets: VocabSidebarSet[];
  classesHref: string;
  onCreateFolder: (name: string) => Promise<{ ok: boolean; message: string }>;
  onDeleteFolder: (folderId: string) => Promise<{ ok: boolean; message: string }>;
}

export function VocabFolderSidebar({
  role,
  folders,
  sets,
  classesHref,
  onCreateFolder,
  onDeleteFolder,
}: VocabFolderSidebarProps) {
  const pathname = usePathname();
  const base = role === "admin" ? "/admin/vocab" : "/teacher/vocab";
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
    <aside className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-white lg:w-60 lg:border-b-0 lg:border-r">
      <div className="border-b border-slate-100 px-4 py-3">
        <p className="text-xs font-bold text-slate-600">나의 폴더</p>
      </div>
      <div className="max-h-[50vh] flex-1 overflow-y-auto px-3 py-3 lg:max-h-none">
        <div className="flex gap-1.5">
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
            onClick={() => void handleCreateFolder()}
            className="shrink-0 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            + 폴더
          </button>
        </div>
        {msg && (
          <p className="mt-1 px-1 text-xs text-slate-600" role="status">
            {msg}
          </p>
        )}
        <div className="mt-2 space-y-0.5">
          <Link
            href={`${base}/sets`}
            className={`block rounded-lg px-3 py-2 text-sm ${
              pathname === `${base}/sets` ? activeNav : "text-slate-600 hover:bg-slate-50"
            }`}
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
            <p className="px-2 pt-1 text-xs text-slate-400">
              미분류 세트 {unfiledCount}개
            </p>
          )}
        </div>
        <Link
          href={classesHref}
          className="mt-4 block rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          반 관리 (클래스)
        </Link>
      </div>
    </aside>
  );
}
