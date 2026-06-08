import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReactNode } from "react";
import { VocabFolderSidebar } from "@/components/vocab/VocabFolderSidebar";
import { VocabSidebarProvider } from "@/components/vocab/VocabSidebarContext";
import { loadVocabSidebarData } from "@/lib/vocab/load-sidebar";

interface VocabSetsSectionLayoutProps {
  role: "admin" | "teacher";
  userId: string;
  supabase: SupabaseClient;
  classesHref: string;
  onCreateFolder: (name: string) => Promise<{ ok: boolean; message: string }>;
  onDeleteFolder: (folderId: string) => Promise<{ ok: boolean; message: string }>;
  children: ReactNode;
}

export async function VocabSetsSectionLayout({
  role,
  userId,
  supabase,
  classesHref,
  onCreateFolder,
  onDeleteFolder,
  children,
}: VocabSetsSectionLayoutProps) {
  const { folders, sets } = await loadVocabSidebarData(supabase, role, userId);

  return (
    <VocabSidebarProvider
      value={{ classes: [], folders, sets }}
    >
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <VocabFolderSidebar
          role={role}
          folders={folders}
          sets={sets}
          classesHref={classesHref}
          onCreateFolder={onCreateFolder}
          onDeleteFolder={onDeleteFolder}
        />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </VocabSidebarProvider>
  );
}
