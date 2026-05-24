import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { getStudentReport } from "@/lib/reports/get-student-report";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
    return NextResponse.json(
      { ok: false, message: "권한이 없습니다." },
      { status: 403 }
    );
  }

  if (profile.role === "teacher" && profile.is_active === false) {
    return NextResponse.json(
      { ok: false, message: "비활성화된 계정입니다." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  const range = searchParams.get("range");

  if (!studentId) {
    return NextResponse.json(
      { ok: false, message: "studentId가 필요합니다." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const report = await getStudentReport(
    supabase,
    profile.role,
    profile.id,
    studentId,
    range
  );

  if (!report) {
    return NextResponse.json(
      { ok: false, message: "리포트를 조회할 수 없습니다." },
      { status: 403 }
    );
  }

  return NextResponse.json({ ok: true, report });
}
