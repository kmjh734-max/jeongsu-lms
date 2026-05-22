import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchStudentVocabSummaries } from "@/lib/vocab/student-sets";
import { loadStageProgress } from "@/lib/vocab/load-stage-progress";
import type { VocabItem, VocabSet } from "@/types/database";

export async function loadStudentVocabSetContext(
  supabase: SupabaseClient,
  studentId: string,
  setId: string
) {
  const summaries = await fetchStudentVocabSummaries(supabase, studentId);
  const summary = summaries.find((s) => s.set.id === setId);
  if (!summary) return null;

  const [{ data: items }, progress] = await Promise.all([
    supabase
      .from("vocab_items")
      .select("*")
      .eq("set_id", setId)
      .order("order_index")
      .order("created_at"),
    loadStageProgress(supabase, studentId, setId),
  ]);

  return {
    set: summary.set as VocabSet,
    items: (items ?? []) as VocabItem[],
    itemCount: summary.itemCount,
    progress,
  };
}
