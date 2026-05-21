import type { SupabaseClient } from "@supabase/supabase-js";

export async function assignVocabSetToClass(
  supabase: SupabaseClient,
  setId: string,
  classId: string,
  assignedBy: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { data: existing } = await supabase
    .from("vocab_assignments")
    .select("id")
    .eq("set_id", setId)
    .eq("class_id", classId)
    .maybeSingle();

  if (existing) {
    return { ok: false, message: "이미 이 반에 배정된 단어장입니다." };
  }

  const { error } = await supabase.from("vocab_assignments").insert({
    set_id: setId,
    class_id: classId,
    assigned_by: assignedBy,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, message: "이미 이 반에 배정된 단어장입니다." };
    }
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

export async function removeVocabSetFromClass(
  supabase: SupabaseClient,
  assignmentId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await supabase
    .from("vocab_assignments")
    .delete()
    .eq("id", assignmentId);

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}
