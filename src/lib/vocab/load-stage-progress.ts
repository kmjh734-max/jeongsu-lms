import type { SupabaseClient } from "@supabase/supabase-js";
import type { VocabStageProgress } from "@/types/database";

export async function loadStageProgress(
  supabase: SupabaseClient,
  studentId: string,
  setId: string
): Promise<VocabStageProgress> {
  const { data } = await supabase
    .from("vocab_stage_progress")
    .select("*")
    .eq("student_id", studentId)
    .eq("set_id", setId)
    .maybeSingle();

  if (data) return data as VocabStageProgress;

  const { data: inserted, error } = await supabase
    .from("vocab_stage_progress")
    .insert({ student_id: studentId, set_id: setId })
    .select("*")
    .single();

  if (error || !inserted) {
    throw new Error(error?.message ?? "진행 상태를 만들 수 없습니다.");
  }

  return inserted as VocabStageProgress;
}

export function stage2Unlocked(progress: VocabStageProgress): boolean {
  return progress.stage1_completed;
}

export function stage3Unlocked(progress: VocabStageProgress): boolean {
  return progress.stage2_completed;
}

export function stage4Unlocked(progress: VocabStageProgress): boolean {
  return progress.stage3_completed;
}
