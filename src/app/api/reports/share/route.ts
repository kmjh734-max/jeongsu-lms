import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { canViewStudentReport } from "@/lib/reports/access";
import {
  buildShareUrl,
  generateShareToken,
  resolveShareBaseUrl,
  shareExpiresAt,
} from "@/lib/reports/share-token";
import type { StudentReport } from "@/lib/reports/types";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

interface ShareBody {
  studentId?: string;
  reportData?: StudentReport;
  parentMessage?: string;
  aiReportText?: string;
}

export async function POST(request: Request) {
  try {
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

    let body: ShareBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, message: "요청 형식이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    const { studentId, reportData, parentMessage, aiReportText } = body;
    if (!studentId || !reportData) {
      return NextResponse.json(
        { ok: false, message: "studentId와 reportData가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const allowed = await canViewStudentReport(
      supabase,
      profile.role,
      profile.id,
      studentId
    );
    if (!allowed) {
      return NextResponse.json(
        { ok: false, message: "해당 학생 리포트에 접근할 수 없습니다." },
        { status: 403 }
      );
    }

    const token = generateShareToken();
    const expiresAt = shareExpiresAt(30);
    const baseUrl = resolveShareBaseUrl();

    const admin = createAdminClient();

    const { data: studentProfile } = await admin
      .from("profiles")
      .select("academy_id")
      .eq("id", studentId)
      .maybeSingle();

    const academyId =
      (studentProfile?.academy_id as string | null) ??
      (profile.academy_id as string | null) ??
      null;

    const { error } = await admin.from("shared_reports").insert({
      token,
      student_id: studentId,
      created_by: profile.id,
      academy_id: academyId,
      report_data: reportData,
      parent_message: parentMessage ?? "",
      ai_report_text: aiReportText ?? "",
      expires_at: expiresAt,
    });

    if (error) {
      console.error("[reports/share] insert failed:", error.message);
      return NextResponse.json(
        { ok: false, message: "리포트 링크 생성에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      shareUrl: buildShareUrl(token, baseUrl),
      token,
      expiresAt,
    });
  } catch (e) {
    console.error("[reports/share] POST error:", e);
    return NextResponse.json(
      { ok: false, message: "리포트 링크 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
