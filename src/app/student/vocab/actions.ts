"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/vocab/actions-shared";
import { getCurrentProfile } from "@/lib/auth/get-profile";

export async function recordVocabProgress(
  itemId: string,
  known: boolean
): Promise<ActionResult> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "student") {
    return actionError("학생 권한이 필요합니다.");
  }

  const supabase = await createClient();

  const { data: item, error: itemError } = await supabase
    .from("vocab_items")
    .select("id, set_id")
    .eq("id", itemId)
    .single();

  if (itemError || !item) {
    return actionError("단어를 찾을 수 없습니다.");
  }

  const { data: existing } = await supabase
    .from("vocab_progress")
    .select("id, studied_count")
    .eq("student_id", profile.id)
    .eq("item_id", itemId)
    .maybeSingle();

  const status = known ? "known" : "review";
  const now = new Date().toISOString();

  if (existing) {
    const { error: updateError } = await supabase
      .from("vocab_progress")
      .update({
        status,
        studied_count: (existing.studied_count ?? 0) + 1,
        last_studied_at: now,
      })
      .eq("id", existing.id);

    if (updateError) return actionError(updateError.message);
  } else {
    const { error: insertError } = await supabase.from("vocab_progress").insert({
      student_id: profile.id,
      item_id: itemId,
      status,
      studied_count: 1,
      last_studied_at: now,
    });

    if (insertError) return actionError(insertError.message);
  }

  revalidatePath("/student/vocab");
  revalidatePath(`/student/vocab/${item.set_id}`);
  return actionSuccess(known ? "알아요로 저장했습니다." : "복습 필요로 저장했습니다.");
}
