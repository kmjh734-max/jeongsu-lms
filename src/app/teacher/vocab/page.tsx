import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { VocabOverview } from "@/components/vocab/VocabOverview";
import { loadVocabSidebarData } from "@/lib/vocab/load-sidebar";

export default async function TeacherVocabPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const { classes, folders, sets } = await loadVocabSidebarData(
    supabase,
    "teacher",
    profile!.id
  );

  return (
    <VocabOverview
      role="teacher"
      classes={classes}
      folders={folders}
      sets={sets}
      classesHref="/teacher/classes"
    />
  );
}
