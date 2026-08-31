"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useLessonMaterialsSidebar } from "@/components/lesson-materials/LessonMaterialsSidebarContext";

interface LessonMaterialsSidebarProps {
  role: "admin" | "teacher";
  onCreateFolder?: (name: string) => Promise<{ ok: boolean; message: string }>;
  onDeleteFolder?: (
    folderId: string
  ) => Promise<{ ok: boolean; message: string }>;
}

export function LessonMaterialsSidebar({
  role,
  onCreateFolder,
  onDeleteFolder,
}: LessonMaterialsSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const base =
    role === "admin" ? "/admin/lesson-materials" : "/teacher/lesson-materials";
  const { folders, projects } = useLessonMaterialsSidebar();
  const [folderName, setFolderName] = useState("");
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const unfiledCount = projects.filter((p) => !p.folder_id).length;
  const activeClass =
    "bg-brand-50 font-semibold text-brand-900 ring-1 ring-brand-200/80";

  async function handleCreateFolder() {
    if (!onCreateFolder || !folderName.trim()) return;
    setCreating(true);
    setMsg(null);
    const result = await onCreateFolder(folderName.trim());
    setMsg(result.message);
    if (result.ok) setFolderName("");
    setCreating(false);
  }

  function folderLinkClass(href: string) {
    const active =
      pathname === href || pathname.startsWith(`${href}/`);
    return active
      ? activeClass
      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900";
  }

  return (
    <aside className="flex w-full shrink-0 flex-col border-r border-slate-200 bg-white lg:w-64">
      <div className="shrink-0 border-b border-slate-100 px-4 py-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          수업자료
        </p>
        <p className="mt-1 text-sm text-slate-600">지문 · 한줄해석 · 통합</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-3 flex items-center justify-between px-1">
          <p className="text-xs font-bold text-slate-600">자료함 폴더</p>
        </div>

        {onCreateFolder && (
          <div className="mb-3 flex gap-1.5">
            <input
              className="ui-input min-h-0 flex-1 py-2 text-sm"
              placeholder="새 폴더 이름"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void handleCreateFolder()}
            />
            <button
              type="button"
              disabled={creating}
              onClick={() => void handleCreateFolder()}
              className="shrink-0 rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              + 폴더
            </button>
          </div>
        )}
        {msg ? <p className="mb-2 px-1 text-xs text-slate-500">{msg}</p> : null}

        <nav className="space-y-1">
          <Link
            href={`${base}/projects`}
            className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${folderLinkClass(`${base}/projects`)}`}
          >
            <span>전체 자료</span>
            <span className="text-xs text-slate-500">{projects.length}</span>
          </Link>
          <Link
            href={`${base}/unfiled`}
            className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${folderLinkClass(`${base}/unfiled`)}`}
          >
            <span>미분류</span>
            <span className="text-xs text-slate-500">{unfiledCount}</span>
          </Link>

          {folders.map((folder) => {
            const count = projects.filter((p) => p.folder_id === folder.id).length;
            const href = `${base}/folder/${folder.id}`;
            return (
              <div key={folder.id} className="group flex items-center gap-1">
                <Link
                  href={href}
                  className={`flex min-w-0 flex-1 items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${folderLinkClass(href)}`}
                >
                  <span className="truncate">{folder.name}</span>
                  <span className="ml-2 shrink-0 text-xs text-slate-500">
                    {count}
                  </span>
                </Link>
                {onDeleteFolder && count === 0 ? (
                  <button
                    type="button"
                    title="폴더 삭제"
                    className="rounded-lg px-2 py-1 text-xs text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                    onClick={() => {
                      if (
                        window.confirm(
                          `「${folder.name}」 폴더를 삭제할까요?`
                        )
                      ) {
                        void onDeleteFolder(folder.id).then(() => router.refresh());
                      }
                    }}
                  >
                    삭제
                  </button>
                ) : null}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
