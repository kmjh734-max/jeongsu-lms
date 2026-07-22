import type { SupabaseClient } from "@supabase/supabase-js";
import type { VocabItem, VocabSet } from "@/types/database";
import type { VocabPrintSection } from "@/lib/vocab/vocab-print-types";
import { chunkIds, fetchAllRows } from "@/lib/supabase/fetch-all-rows";

const VOCAB_ITEM_PRINT_COLS =
  "id, set_id, word, meaning, part_of_speech, example_sentence, example_meaning, synonyms, antonyms, order_index, created_at";

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

  const [{ data: set }, items] = await Promise.all([
    query.single(),
    fetchAllRows<VocabItem>((from, to) =>
      supabase
        .from("vocab_items")
        .select(VOCAB_ITEM_PRINT_COLS)
        .eq("set_id", setId)
        .order("order_index")
        .order("created_at")
        .range(from, to)
    ),
  ]);
  if (!set) return null;

  return {
    set: set as VocabSet,
    items,
  };
}

async function loadSetsByIds(
  supabase: SupabaseClient,
  setIds: string[],
  teacherScopeId?: string
): Promise<VocabSet[]> {
  const sets: VocabSet[] = [];
  for (const batch of chunkIds(setIds, 80)) {
    let setsQuery = supabase.from("vocab_sets").select("*").in("id", batch);
    if (teacherScopeId) {
      setsQuery = setsQuery.or(
        `teacher_id.eq.${teacherScopeId},created_by.eq.${teacherScopeId}`
      );
    }
    const { data, error } = await setsQuery;
    if (error) throw new Error(error.message);
    for (const row of data ?? []) sets.push(row as VocabSet);
  }
  return sets;
}

async function loadItemsBySetIds(
  supabase: SupabaseClient,
  setIds: string[]
): Promise<VocabItem[]> {
  const items: VocabItem[] = [];
  for (const batch of chunkIds(setIds, 80)) {
    const batchItems = await fetchAllRows<VocabItem>((from, to) =>
      supabase
        .from("vocab_items")
        .select(VOCAB_ITEM_PRINT_COLS)
        .in("set_id", batch)
        .order("order_index", { ascending: true })
        .order("created_at", { ascending: true })
        .range(from, to)
    );
    items.push(...batchItems);
  }
  return items;
}

export async function loadVocabSetsPrintData(
  supabase: SupabaseClient,
  setIds: string[],
  teacherScopeId?: string
): Promise<VocabPrintSection[]> {
  const uniqueIds = [...new Set(setIds.filter(Boolean))];
  if (uniqueIds.length === 0) return [];

  const sets = await loadSetsByIds(supabase, uniqueIds, teacherScopeId);
  if (!sets.length) return [];

  const allowedSetIds = sets.map((s) => s.id);
  const items = await loadItemsBySetIds(supabase, allowedSetIds);

  const itemsBySet = new Map<string, VocabItem[]>();
  for (const item of items) {
    const sid = item.set_id;
    const list = itemsBySet.get(sid) ?? [];
    list.push(item);
    itemsBySet.set(sid, list);
  }

  // Keep stable per-set order even if pages interleaved across batches
  for (const [sid, list] of itemsBySet) {
    list.sort((a, b) => {
      if (a.order_index !== b.order_index) return a.order_index - b.order_index;
      return a.created_at.localeCompare(b.created_at);
    });
    itemsBySet.set(sid, list);
  }

  const setById = new Map(sets.map((s) => [s.id, s]));
  const sections: VocabPrintSection[] = [];

  for (const setId of uniqueIds) {
    const set = setById.get(setId);
    const setItems = itemsBySet.get(setId);
    if (!set || !setItems?.length) continue;
    sections.push({
      setId: set.id,
      title: set.title,
      description: set.description,
      items: setItems,
    });
  }

  return sections;
}
