import { NextResponse } from "next/server";
import { lookupSharedReport } from "@/lib/reports/get-shared-report";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    if (!token?.trim()) {
      return NextResponse.json(
        { ok: false, message: "토큰이 필요합니다." },
        { status: 400 }
      );
    }

    const lookup = await lookupSharedReport(token.trim());

    if (lookup.status === "expired") {
      return NextResponse.json({
        ok: false,
        expired: true,
        message: "만료된 리포트입니다.",
      });
    }

    if (lookup.status === "not_found") {
      return NextResponse.json(
        {
          ok: false,
          expired: false,
          message: "존재하지 않는 리포트입니다.",
        },
        { status: 404 }
      );
    }

    const { payload } = lookup;
    return NextResponse.json({
      ok: true,
      expired: false,
      report: payload.report,
      parentMessage: payload.parentMessage,
      aiReportText: payload.aiReportText,
      expiresAt: payload.expiresAt,
      studentName: payload.studentName,
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "리포트를 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
