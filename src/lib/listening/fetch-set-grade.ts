import { createAdminClient } from "@/lib/supabase/admin";
import { parseListeningGradeLevel, type ListeningGradeLevel } from "@/lib/listening/grade-level";

export async function fetchListeningSetGradeLevel(setId: string): Promise<ListeningGradeLevel> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("listening_sets")
    .select("grade_level")
    .eq("id", setId)
    .maybeSingle();
  return parseListeningGradeLevel(data?.grade_level);
}
