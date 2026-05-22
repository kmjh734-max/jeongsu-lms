import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { VocabManageShell } from "@/components/vocab/VocabManageShell";
import { loadVocabSidebarData } from "@/lib/vocab/load-sidebar";
import * as actions from "@/app/teacher/vocab/actions";

export default async function TeacherVocabLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "teacher") redirect("/login");

  const supabase = await createClient();
  const { classes, folders, sets } = await loadVocabSidebarData(
    supabase,
    "teacher",
    profile.id
  );

  return (
    <VocabManageShell
      role="teacher"
      classes={classes}
      folders={folders}
      sets={sets}
      classesHref="/teacher/classes"
      onCreateFolder={actions.createVocabFolder}
      onDeleteFolder={actions.deleteVocabFolder}
    >
      {children}
    </VocabManageShell>
  );
}
