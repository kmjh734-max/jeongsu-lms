import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { LessonMaterialsSidebar } from "@/components/lesson-materials/LessonMaterialsSidebar";
import { LessonMaterialsSidebarProvider } from "@/components/lesson-materials/LessonMaterialsSidebarContext";
import { loadLessonMaterialsSidebarData } from "@/lib/lesson-materials/load-sidebar";

export async function renderLessonMaterialsShell(
  role: "admin" | "teacher",
  children: ReactNode,
  actions?: {
    createFolder: (name: string) => Promise<{ ok: boolean; message: string }>;
    deleteFolder: (
      folderId: string
    ) => Promise<{ ok: boolean; message: string }>;
  }
) {
  const supabase = await createClient();
  const sidebarData = await loadLessonMaterialsSidebarData(supabase);

  return (
    <LessonMaterialsSidebarProvider value={sidebarData}>
      <div className="-mx-4 flex min-h-[calc(100vh-7rem)] flex-col bg-slate-100/80 sm:mx-0 sm:rounded-2xl sm:border sm:border-slate-200 sm:shadow-sm">
        <div className="flex flex-1 flex-col lg:flex-row">
          <LessonMaterialsSidebar
            role={role}
            onCreateFolder={actions?.createFolder}
            onDeleteFolder={actions?.deleteFolder}
          />
          <main className="flex min-w-0 flex-1 flex-col bg-slate-50/50 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </LessonMaterialsSidebarProvider>
  );
}
