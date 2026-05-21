import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { VocabManageShell } from "@/components/vocab/VocabManageShell";
import { loadVocabSidebarData } from "@/lib/vocab/load-sidebar";
import * as actions from "@/app/admin/vocab/actions";

export default async function AdminVocabLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") redirect("/login");

  const supabase = await createClient();
  const { classes, folders, sets } = await loadVocabSidebarData(
    supabase,
    "admin",
    profile.id
  );

  return (
    <VocabManageShell
      role="admin"
      classes={classes}
      folders={folders}
      sets={sets}
      classesHref="/admin/classes"
      onCreateFolder={actions.createVocabFolder}
    >
      {children}
    </VocabManageShell>
  );
}
