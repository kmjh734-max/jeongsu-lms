import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { VocabOverview } from "@/components/vocab/VocabOverview";
import { loadVocabSidebarData } from "@/lib/vocab/load-sidebar";

export default async function AdminVocabPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const { classes, folders, sets } = await loadVocabSidebarData(
    supabase,
    "admin",
    profile!.id
  );

  return (
    <VocabOverview
      role="admin"
      classes={classes}
      folders={folders}
      sets={sets}
      classesHref="/admin/classes"
    />
  );
}
