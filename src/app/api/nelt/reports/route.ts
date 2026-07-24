import { NextResponse } from "next/server";
import { requireNeltStaff } from "@/lib/nelt/require-nelt-staff";
import { saveNeltDraftAsReport } from "@/lib/nelt/save-draft-report";
import type { NeltExtractedDraft } from "@/lib/nelt/types-draft";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireNeltStaff();
  if (!auth.ok) return auth.error;

  let body: {
    draft?: NeltExtractedDraft;
    studentName?: string;
    sourceUrl?: string;
    overwriteId?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "요청 본문이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  if (!body.draft || !body.sourceUrl) {
    return NextResponse.json(
      { ok: false, message: "저장할 데이터가 없습니다." },
      { status: 400 }
    );
  }

  const studentName =
    body.studentName?.trim() || body.draft.studentName?.trim() || "";
  if (!studentName) {
    return NextResponse.json(
      { ok: false, message: "학생 이름을 확인해 주세요." },
      { status: 400 }
    );
  }

  if (body.overwriteId) {
    await auth.supabase
      .from("nelt_reports")
      .delete()
      .eq("id", body.overwriteId)
      .eq("academy_id", auth.academyId);
  }

  const saved = await saveNeltDraftAsReport(auth.supabase, {
    academyId: auth.academyId,
    createdBy: auth.profile.id,
    draft: body.draft,
    studentName,
    sourceUrl: body.sourceUrl,
  });

  if (!saved.ok) {
    return NextResponse.json(
      { ok: false, message: saved.message },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    reportId: saved.reportId,
    studentName,
  });
}
