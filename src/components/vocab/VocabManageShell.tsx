import type { ReactNode } from "react";
import { VocabSidebar, type VocabSidebarSet } from "@/components/vocab/VocabSidebar";
import type { Class, VocabFolder } from "@/types/database";

interface VocabManageShellProps {
  role: "admin" | "teacher";
  classes: Class[];
  folders: VocabFolder[];
  sets: VocabSidebarSet[];
  classesHref: string;
  onCreateFolder: (name: string) => Promise<{ ok: boolean; message: string }>;
  onDeleteFolder: (folderId: string) => Promise<{ ok: boolean; message: string }>;
  children: ReactNode;
}

export function VocabManageShell({
  role,
  classes,
  folders,
  sets,
  classesHref,
  onCreateFolder,
  onDeleteFolder,
  children,
}: VocabManageShellProps) {
  return (
    <div className="-mx-4 flex min-h-[calc(100vh-7rem)] flex-col bg-slate-100/80 sm:mx-0 sm:rounded-2xl sm:border sm:border-slate-200 sm:shadow-sm">
      <div className="flex flex-1 flex-col lg:flex-row">
        <VocabSidebar
          role={role}
          classes={classes}
          folders={folders}
          sets={sets}
          classesHref={classesHref}
          onCreateFolder={onCreateFolder}
          onDeleteFolder={onDeleteFolder}
        />
        <main className="min-w-0 flex-1 bg-slate-50/50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
