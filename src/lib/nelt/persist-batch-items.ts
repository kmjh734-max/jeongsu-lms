import type { SupabaseClient } from "@supabase/supabase-js";
import { saveNeltDraftAsReport } from "@/lib/nelt/save-draft-report";
import { renumberNeltAttempts } from "@/lib/nelt/load-student-attempts";
import type { NeltExtractedDraft } from "@/lib/nelt/types-draft";

export type NeltPersistBatchItem = {
  draft: NeltExtractedDraft;
  sourceUrl: string;
  overwriteId?: string | null;
};

/** 링크 2개 이상 저장 (시험일 순 → 1·2·3차) */
export async function persistNeltBatchItems(
  supabase: SupabaseClient,
  params: {
    academyId: string;
    createdBy: string;
    studentName: string;
    items: NeltPersistBatchItem[];
  }
): Promise<
  | { ok: true; reportIds: string[]; studentName: string }
  | { ok: false; message: string; reportIds: string[] }
> {
  const studentName = params.studentName.trim();
  if (!studentName) {
    return { ok: false, message: "학생 이름을 확인해 주세요.", reportIds: [] };
  }

  const items = params.items.slice(0, 10);
  if (items.length === 0) {
    return { ok: false, message: "저장할 회차가 없습니다.", reportIds: [] };
  }

  const sorted = [...items].sort((a, b) => {
    const da = a.draft.testDate ?? "";
    const db = b.draft.testDate ?? "";
    if (da && db && da !== db) return da.localeCompare(db);
    return 0;
  });

  const savedIds: string[] = [];
  for (const item of sorted) {
    if (item.overwriteId) {
      await supabase
        .from("nelt_reports")
        .delete()
        .eq("id", item.overwriteId)
        .eq("academy_id", params.academyId);
    }
    const draft = { ...item.draft, studentName };
    const saved = await saveNeltDraftAsReport(supabase, {
      academyId: params.academyId,
      createdBy: params.createdBy,
      draft,
      studentName,
      sourceUrl: item.sourceUrl,
    });
    if (!saved.ok) {
      return { ok: false, message: saved.message, reportIds: savedIds };
    }
    savedIds.push(saved.reportId);
  }

  await renumberNeltAttempts(supabase, params.academyId, studentName);
  return { ok: true, reportIds: savedIds, studentName };
}

/** 같은 학생·같은 source_url이 있으면 overwrite id 반환 */
export async function findNeltReportIdBySourceUrl(
  supabase: SupabaseClient,
  academyId: string,
  studentName: string,
  sourceUrl: string
): Promise<string | null> {
  const url = sourceUrl.trim();
  if (!url) return null;
  const { data } = await supabase
    .from("nelt_reports")
    .select("id")
    .eq("academy_id", academyId)
    .eq("student_name_raw", studentName.trim())
    .eq("source_url", url)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.id as string | undefined) ?? null;
}
