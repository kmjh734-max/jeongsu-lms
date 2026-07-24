import { NextResponse } from "next/server";
import { requireNeltStaff } from "@/lib/nelt/require-nelt-staff";
import { upsertNeltGrowthReport } from "@/lib/nelt/upsert-growth-report";
import { loadNeltAttemptsByReportIds } from "@/lib/nelt/load-student-attempts";
import {
  persistNeltBatchItems,
  type NeltPersistBatchItem,
} from "@/lib/nelt/persist-batch-items";
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

  const persistItems: NeltPersistBatchItem[] = items.map((i) => ({
    draft: i.draft,
    sourceUrl: i.sourceUrl,
    overwriteId: i.overwriteId,
  }));

  const saved = await persistNeltBatchItems(auth.supabase, {
    academyId: auth.academyId,
    createdBy: auth.profile.id,
    studentName,
    items: persistItems,
  });
  if (!saved.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: saved.message,
        savedIds: saved.reportIds,
      },
      { status: 400 }
    );
  }

  const savedIds = saved.reportIds;
  let growth: {
    ok: true;
    growthId: string;
    attemptCount: number;
  } | null = null;

  // 링크 2개 이상 저장 = 성장 리포트
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
