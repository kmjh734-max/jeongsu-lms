import type { SupabaseClient } from "@supabase/supabase-js";
import { attemptBundleToDraft } from "@/lib/nelt/attempt-to-draft";
import type { NeltAttemptBundle } from "@/lib/nelt/compare/types";
import type { NeltGrowthAnalysis } from "@/lib/nelt/compare/types";
import { isReportUuid } from "@/lib/nelt/is-report-uuid";
import {
  loadNeltAttemptsByReportIds,
  loadStudentNeltAttempts,
} from "@/lib/nelt/load-student-attempts";
import {
  findNeltReportIdBySourceUrl,
  persistNeltBatchItems,
} from "@/lib/nelt/persist-batch-items";

/**
 * 공유/성장용 회차 로드.
 * 규칙: 링크(분석 회차) 2개 이상이면 성장 리포트 — DB에 없으면 자동 저장.
 */
export async function resolveNeltShareAttempts(
  supabase: SupabaseClient,
  params: {
    academyId: string;
    createdBy: string;
    studentName: string;
    analysis?: NeltGrowthAnalysis | null;
    reportIds?: string[] | null;
  }
): Promise<
  | { ok: true; attempts: NeltAttemptBundle[] }
  | { ok: false; message: string }
> {
  const studentName = params.studentName.trim();
  const fromBody = (params.reportIds ?? []).filter(isReportUuid);
  const fromAnalysis = (params.analysis?.attempts ?? [])
    .map((a) => a.id)
    .filter(isReportUuid);
  const uuidIds = [...new Set([...fromBody, ...fromAnalysis])];

  let attempts: NeltAttemptBundle[] = [];
  if (uuidIds.length >= 2) {
    attempts = await loadNeltAttemptsByReportIds(supabase, uuidIds);
  }
  if (attempts.length < 2) {
    attempts = await loadStudentNeltAttempts(
      supabase,
      params.academyId,
      studentName
    );
  }

  // 미리보기(local-*) = 링크 2개 이상 분석 완료 → 자동 저장 후 공유
  const previewAttempts = params.analysis?.attempts ?? [];
  if (attempts.length < 2 && previewAttempts.length >= 2) {
    const items = [];
    for (const attempt of previewAttempts) {
      const sourceUrl = (attempt.sourceUrl ?? "").trim();
      if (!sourceUrl) {
        return {
          ok: false,
          message: "결과 링크가 없는 회차가 있어 저장할 수 없습니다.",
        };
      }
      const overwriteId = await findNeltReportIdBySourceUrl(
        supabase,
        params.academyId,
        studentName,
        sourceUrl
      );
      items.push({
        draft: attemptBundleToDraft(attempt, studentName),
        sourceUrl,
        overwriteId,
      });
    }

    const saved = await persistNeltBatchItems(supabase, {
      academyId: params.academyId,
      createdBy: params.createdBy,
      studentName,
      items,
    });
    if (!saved.ok) {
      return { ok: false, message: saved.message };
    }
    attempts = await loadNeltAttemptsByReportIds(supabase, saved.reportIds);
  }

  if (attempts.length < 2) {
    return {
      ok: false,
      message:
        "결과 링크를 2개 이상 분석한 뒤 다시 시도해 주세요.",
    };
  }

  return { ok: true, attempts };
}
