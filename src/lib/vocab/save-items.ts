import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchAllPages } from "@/lib/vocab/fetch-all";

export interface VocabItemSaveInput {
  id?: string;
  word: string;
  meaning: string;
  example_sentence?: string;
  example_meaning?: string;
  synonyms?: string;
  antonyms?: string;
  /** 편집기는 품사를 고치지 않는다 — 넘길 때만 쓰고, 안 넘기면 기존 값을 그대로 둔다 */
  part_of_speech?: string | null;
  order_index: number;
}

export async function persistVocabItems(
  supabase: SupabaseClient,
  setId: string,
  items: VocabItemSaveInput[]
): Promise<{ ok: true } | { ok: false; message: string }> {
  const valid = items
    .map((item, index) => ({
      ...item,
      word: item.word.trim(),
      meaning: item.meaning.trim(),
      example_sentence: item.example_sentence?.trim() || null,
      example_meaning: item.example_meaning?.trim() || null,
      synonyms: item.synonyms?.trim() || null,
      antonyms: item.antonyms?.trim() || null,
      order_index: index,
    }))
    .filter((item) => item.word && item.meaning);

  let existing: { id: string }[];
  try {
    // 1000단어가 넘는 세트도 빠짐없이(빠지면 중복으로 새로 들어간다)
    existing = await fetchAllPages<{ id: string }>((from, to) =>
      supabase
        .from("vocab_items")
        .select("id")
        .eq("set_id", setId)
        .order("id")
        .range(from, to)
    );
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "단어를 불러오지 못했어요." };
  }

  const existingIds = new Set(existing.map((r) => r.id));
  const keptIds = new Set<string>();

  const toUpdate = valid.filter((item) => item.id && existingIds.has(item.id));
  const toCreate = valid.filter((item) => !item.id || !existingIds.has(item.id));

  const updateResults = await Promise.all(
    toUpdate.map((item) =>
      supabase
        .from("vocab_items")
        .update({
          word: item.word,
          meaning: item.meaning,
          ...(item.part_of_speech !== undefined
            ? { part_of_speech: item.part_of_speech?.trim() || null }
            : {}),
          example_sentence: item.example_sentence,
          example_meaning: item.example_meaning,
          synonyms: item.synonyms,
          antonyms: item.antonyms,
          order_index: item.order_index,
        })
        .eq("id", item.id!)
        .eq("set_id", setId)
    )
  );
  const updateErr = updateResults.find((r) => r.error);
  if (updateErr?.error) return { ok: false, message: updateErr.error.message };
  for (const item of toUpdate) {
    if (item.id) keptIds.add(item.id);
  }

  if (toCreate.length > 0) {
    const { data: inserted, error } = await supabase
      .from("vocab_items")
      .insert(
        toCreate.map((item) => ({
          set_id: setId,
          word: item.word,
          meaning: item.meaning,
          part_of_speech: item.part_of_speech?.trim() || null,
          example_sentence: item.example_sentence,
          example_meaning: item.example_meaning,
          synonyms: item.synonyms,
          antonyms: item.antonyms,
          order_index: item.order_index,
        }))
      )
      .select("id");

    if (error) return { ok: false, message: error.message };
    for (const row of inserted ?? []) {
      if (row.id) keptIds.add(row.id);
    }
  }

  const toDelete = [...existingIds].filter((id) => !keptIds.has(id));
  if (toDelete.length > 0) {
    const { error } = await supabase
      .from("vocab_items")
      .delete()
      .in("id", toDelete);

    if (error) return { ok: false, message: error.message };
  }

  return { ok: true };
}
