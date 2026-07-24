import { NextResponse } from "next/server";
import { requireNeltStaff } from "@/lib/nelt/require-nelt-staff";

export const runtime = "nodejs";

/** 학생 이름 기준 NELT 회차·성장 리포트 전체 삭제 */
export async function DELETE(request: Request) {
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

  // 공유·성장 리포트 먼저 (report FK는 set null)
  const { error: growthErr } = await auth.supabase
    .from("nelt_growth_reports")
    .delete()
    .eq("academy_id", auth.academyId)
    .eq("student_name_raw", studentName);

  if (growthErr) {
    return NextResponse.json(
      { ok: false, message: growthErr.message },
      { status: 500 }
    );
  }

  const { data: deletedReports, error: reportErr } = await auth.supabase
    .from("nelt_reports")
    .delete()
    .eq("academy_id", auth.academyId)
    .eq("student_name_raw", studentName)
    .select("id");

  if (reportErr) {
    return NextResponse.json(
      { ok: false, message: reportErr.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    deletedReportCount: deletedReports?.length ?? 0,
    studentName,
  });
}
