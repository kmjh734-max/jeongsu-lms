import type { SupabaseClient } from "@supabase/supabase-js";
import { loadStageProgress } from "@/lib/vocab/load-stage-progress";
import { isStudentAssignedToVocabSet } from "@/lib/vocab/student-assignment";
import type { VocabItem, VocabSet } from "@/types/database";

export async function loadStudentVocabSetContext(
  supabase: SupabaseClient,
  studentId: string,
  setId: string
) {
  const [{ data: set, error: setError }, assigned, { data: items }, progress] =
    await Promise.all([
      supabase.from("vocab_sets").select("*").eq("id", setId).maybeSingle(),
      isStudentAssignedToVocabSet(supabase, studentId, setId),
      supabase
        .from("vocab_items")
        .select("*")
        .eq("set_id", setId)
        .order("order_index")
        .order("created_at"),
      loadStageProgress(supabase, studentId, setId),
    ]);

  if (setError || !set || !assigned) return null;

  const itemList = (items ?? []) as VocabItem[];

  return {
    set: set as VocabSet,
    items: itemList,
    itemCount: itemList.length,
    progress,
  };
}
