import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { generateReportDraft } from "@/lib/reports/generate-report-draft";
import type { StudentReport } from "@/lib/reports/types";

export const runtime = "nodejs";

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

    let body: { report?: StudentReport };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, message: "요청 형식이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    if (!body.report) {
      return NextResponse.json(
        { ok: false, message: "report가 필요합니다." },
        { status: 400 }
      );
    }

    const result = await generateReportDraft(body.report);

    if (!result.ok) {
      return NextResponse.json({ ok: false, message: result.message });
    }

    return NextResponse.json({ ok: true, text: result.text });
  } catch {
    return NextResponse.json(
      { ok: false, message: "AI 리포트 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
