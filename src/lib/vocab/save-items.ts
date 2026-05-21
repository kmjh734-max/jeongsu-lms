import type { SupabaseClient } from "@supabase/supabase-js";

export interface VocabItemSaveInput {
  id?: string;
  word: string;
  meaning: string;
  example_sentence?: string;
  example_meaning?: string;
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
      order_index: index,
    }))
    .filter((item) => item.word && item.meaning);

  const { data: existing, error: fetchError } = await supabase
    .from("vocab_items")
    .select("id")
    .eq("set_id", setId);

  if (fetchError) {
    return { ok: false, message: fetchError.message };
  }

  const existingIds = new Set((existing ?? []).map((r) => r.id));
  const keptIds = new Set<string>();

  for (const item of valid) {
    if (item.id && existingIds.has(item.id)) {
      const { error } = await supabase
        .from("vocab_items")
        .update({
          word: item.word,
          meaning: item.meaning,
          part_of_speech: null,
          example_sentence: item.example_sentence,
          example_meaning: item.example_meaning,
          order_index: item.order_index,
        })
        .eq("id", item.id)
        .eq("set_id", setId);

      if (error) return { ok: false, message: error.message };
      keptIds.add(item.id);
    } else {
      const { data: inserted, error } = await supabase
        .from("vocab_items")
        .insert({
          set_id: setId,
          word: item.word,
          meaning: item.meaning,
          part_of_speech: null,
          example_sentence: item.example_sentence,
          example_meaning: item.example_meaning,
          order_index: item.order_index,
        })
        .select("id")
        .single();

      if (error) return { ok: false, message: error.message };
      if (inserted?.id) keptIds.add(inserted.id);
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
