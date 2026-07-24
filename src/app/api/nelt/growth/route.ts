import { NextResponse } from "next/server";
import { requireNeltStaff } from "@/lib/nelt/require-nelt-staff";
import { loadStudentNeltAttempts } from "@/lib/nelt/load-student-attempts";
import { upsertNeltGrowthReport } from "@/lib/nelt/upsert-growth-report";

export const runtime = "nodejs";

/** 기존 회차로 성장 리포트 재생성 */
export async function POST(request: Request) {
  const auth = await requireNeltStaff();
  if (!auth.ok) return auth.error;

  let body: { studentName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "요청 본문이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  const studentName = body.studentName?.trim();
  if (!studentName) {
    return NextResponse.json(
      { ok: false, message: "학생 이름이 필요합니다." },
      { status: 400 }
    );
  }

  const attempts = await loadStudentNeltAttempts(
    auth.supabase,
    auth.academyId,
    studentName
  );
  const g = await upsertNeltGrowthReport(auth.supabase, {
    academyId: auth.academyId,
    studentName,
    createdBy: auth.profile.id,
    attempts,
    reportIds: attempts.map((a) => a.id),
  });

  if (!g.ok) {
    return NextResponse.json({ ok: false, message: g.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    growthId: g.growthId,
    attemptCount: g.attemptCount,
  });
}
