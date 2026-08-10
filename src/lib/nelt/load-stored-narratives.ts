import type { SupabaseClient } from "@supabase/supabase-js";
import {
  parseStoredNarratives,
  type NeltAiNarratives,
} from "@/lib/nelt/generate-report-narratives";

/** 이미 저장된 AI/서술 JSON — 없으면 null (AI 재호출 없음) */
export async function loadStoredNeltNarratives(
  supabase: SupabaseClient,
  academyId: string,
  studentName: string
): Promise<NeltAiNarratives | null> {
  const name = studentName.trim();
  if (!name) return null;

  const { data } = await supabase
    .from("nelt_growth_reports")
    .select("generated_summary")
    .eq("academy_id", academyId)
    .eq("student_name_raw", name)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const parsed = parseStoredNarratives(data?.generated_summary);
  if (!parsed?.overallSummary?.trim()) return null;
  return parsed;
}
