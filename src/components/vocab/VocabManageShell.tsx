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
  children: ReactNode;
}

export function VocabManageShell({
  role,
  classes,
  folders,
  sets,
  classesHref,
  onCreateFolder,
  children,
}: VocabManageShellProps) {
  return (
    <div className="-mx-4 flex min-h-[calc(100vh-8rem)] flex-col border border-slate-200 bg-slate-50 sm:mx-0 sm:rounded-xl sm:overflow-hidden">
      <div className="flex flex-1 flex-col lg:flex-row">
        <VocabSidebar
          role={role}
          classes={classes}
          folders={folders}
          sets={sets}
          classesHref={classesHref}
          onCreateFolder={onCreateFolder}
        />
        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
