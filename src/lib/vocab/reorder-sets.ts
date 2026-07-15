import type { SupabaseClient } from "@supabase/supabase-js";

export async function persistVocabSetOrder(
  supabase: SupabaseClient,
  folderId: string | null,
  orderedSetIds: string[]
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (orderedSetIds.length === 0) {
    return { ok: false, message: "정렬할 단어장이 없습니다." };
  }

  const updates = orderedSetIds.map((setId, index) => {
    let q = supabase
      .from("vocab_sets")
      .update({ order_index: index })
      .eq("id", setId);
    q = folderId ? q.eq("folder_id", folderId) : q.is("folder_id", null);
    return q;
  });

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) {
    return { ok: false, message: failed.error.message };
  }

  return { ok: true };
}

export async function nextVocabSetOrderIndex(
  supabase: SupabaseClient,
  folderId: string | null
): Promise<number> {
  let query = supabase
    .from("vocab_sets")
    .select("order_index")
    .order("order_index", { ascending: false })
    .limit(1);

  query = folderId
    ? query.eq("folder_id", folderId)
    : query.is("folder_id", null);

  const { data } = await query.maybeSingle();

  return ((data?.order_index as number | undefined) ?? -1) + 1;
}
