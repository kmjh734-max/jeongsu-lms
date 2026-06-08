import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { VocabSetsSectionLayout } from "@/components/vocab/VocabSetsSectionLayout";

export async function renderVocabSetsSection(
  role: "admin" | "teacher",
  classesHref: string,
  actions: {
    createVocabFolder: (name: string) => Promise<{ ok: boolean; message: string }>;
    deleteVocabFolder: (
      folderId: string
    ) => Promise<{ ok: boolean; message: string }>;
  },
  children: ReactNode
) {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  return (
    <VocabSetsSectionLayout
      role={role}
      userId={profile!.id}
      supabase={supabase}
      classesHref={classesHref}
      onCreateFolder={actions.createVocabFolder}
      onDeleteFolder={actions.deleteVocabFolder}
    >
      {children}
    </VocabSetsSectionLayout>
  );
}
