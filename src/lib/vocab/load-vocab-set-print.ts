import type { SupabaseClient } from "@supabase/supabase-js";
import type { VocabItem, VocabSet } from "@/types/database";

export interface VocabSetPrintData {
  set: VocabSet;
  items: VocabItem[];
}

export async function loadVocabSetPrintData(
  supabase: SupabaseClient,
  setId: string,
  teacherScopeId?: string
): Promise<VocabSetPrintData | null> {
  let query = supabase.from("vocab_sets").select("*").eq("id", setId);

  if (teacherScopeId) {
    query = query.or(
      `teacher_id.eq.${teacherScopeId},created_by.eq.${teacherScopeId}`
    );
  }

  const { data: set } = await query.single();
  if (!set) return null;

  const { data: items } = await supabase
    .from("vocab_items")
    .select("*")
    .eq("set_id", setId)
    .order("order_index")
    .order("created_at");

  return {
    set: set as VocabSet,
    items: (items ?? []) as VocabItem[],
  };
}
