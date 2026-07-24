import { NextResponse } from "next/server";
import { requireNeltStaff } from "@/lib/nelt/require-nelt-staff";
import { saveNeltDraftAsReport } from "@/lib/nelt/save-draft-report";
import { upsertNeltGrowthReport } from "@/lib/nelt/upsert-growth-report";
import {
  loadNeltAttemptsByReportIds,
  renumberNeltAttempts,
} from "@/lib/nelt/load-student-attempts";
import type { NeltExtractedDraft } from "@/lib/nelt/types-draft";

export const runtime = "nodejs";
export const maxDuration = 60;

type BatchItem = {
  draft: NeltExtractedDraft;
  sourceUrl: string;
  overwriteId?: string | null;
};

/** 여러 링크(1·2·3차)를 한 번에 저장하고 성장 리포트 생성 */
export async function POST(request: Request) {
  const auth = await requireNeltStaff();
  if (!auth.ok) return auth.error;

  let body: { studentName?: string; items?: BatchItem[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "요청 본문이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  const items = Array.isArray(body.items) ? body.items.slice(0, 10) : [];
  if (items.length === 0) {
    return NextResponse.json(
      { ok: false, message: "저장할 회차가 없습니다." },
      { status: 400 }
    );
  }

  const studentName =
    body.studentName?.trim() ||
    items.map((i) => i.draft.studentName?.trim()).find(Boolean) ||
    "";
  if (!studentName) {
    return NextResponse.json(
      { ok: false, message: "학생 이름을 확인해 주세요." },
      { status: 400 }
    );
  }

  // 시험일 오름차순 → 입력 순서 그대로면 1·2·3차로 인식
  const sorted = [...items].sort((a, b) => {
    const da = a.draft.testDate ?? "";
    const db = b.draft.testDate ?? "";
    if (da && db && da !== db) return da.localeCompare(db);
    return 0;
  });

  const savedIds: string[] = [];
  for (const item of sorted) {
    if (item.overwriteId) {
      await auth.supabase
        .from("nelt_reports")
        .delete()
        .eq("id", item.overwriteId)
        .eq("academy_id", auth.academyId);
    }
    const draft = { ...item.draft, studentName };
    const saved = await saveNeltDraftAsReport(auth.supabase, {
      academyId: auth.academyId,
      createdBy: auth.profile.id,
      draft,
      studentName,
      sourceUrl: item.sourceUrl,
    });
    if (!saved.ok) {
      return NextResponse.json(
        { ok: false, message: saved.message, savedIds },
        { status: 400 }
      );
    }
    savedIds.push(saved.reportId);
  }

  await renumberNeltAttempts(auth.supabase, auth.academyId, studentName);

  let growth: {
    ok: true;
    growthId: string;
    attemptCount: number;
  } | null = null;

  // 링크 2개 이상 저장 = 성장 리포트 (방금 저장한 id로 바로 생성)
  if (savedIds.length >= 2) {
    const attempts = await loadNeltAttemptsByReportIds(
      auth.supabase,
      savedIds
    );
    const g = await upsertNeltGrowthReport(auth.supabase, {
      academyId: auth.academyId,
      studentName,
      createdBy: auth.profile.id,
      attempts,
      reportIds: savedIds,
    });
    if (!g.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: g.message,
          savedIds,
          studentName,
        },
        { status: 400 }
      );
    }
    growth = g;
  }

  return NextResponse.json({
    ok: true,
    studentName,
    reportIds: savedIds,
    growthId: growth?.growthId ?? null,
    attemptCount: growth?.attemptCount ?? savedIds.length,
  });
}
