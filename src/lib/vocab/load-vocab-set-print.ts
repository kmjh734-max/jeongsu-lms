import type { SupabaseClient } from "@supabase/supabase-js";
import type { VocabItem, VocabSet } from "@/types/database";
import type { VocabPrintSection } from "@/lib/vocab/vocab-print-types";

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

export async function loadVocabSetsPrintData(
  supabase: SupabaseClient,
  setIds: string[],
  teacherScopeId?: string
): Promise<VocabPrintSection[]> {
  const uniqueIds = [...new Set(setIds.filter(Boolean))];
  const sections: VocabPrintSection[] = [];

  for (const setId of uniqueIds) {
    const loaded = await loadVocabSetPrintData(
      supabase,
      setId,
      teacherScopeId
    );
    if (!loaded || loaded.items.length === 0) continue;
    sections.push({
      setId: loaded.set.id,
      title: loaded.set.title,
      description: loaded.set.description,
      items: loaded.items,
    });
  }

  return sections;
}
