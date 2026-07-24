import { NextResponse } from "next/server";
import { requireNeltStaff } from "@/lib/nelt/require-nelt-staff";
import { buildNeltGrowthAnalysis } from "@/lib/nelt/compare/build-growth";
import { loadStudentNeltAttempts } from "@/lib/nelt/load-student-attempts";
import { upsertNeltGrowthReport } from "@/lib/nelt/upsert-growth-report";
import {
  buildNeltShareUrl,
  generateShareToken,
  resolveShareBaseUrl,
  shareExpiresAt,
} from "@/lib/nelt/share-token";
import {
  attachReportUrlToMessage,
  buildNeltParentMessageFallback,
  generateNeltParentMessageAi,
  type NeltParentMessageMeta,
} from "@/lib/nelt/generate-parent-message";
import { ACADEMY_NAME } from "@/lib/branding";
import { createAdminClient } from "@/lib/supabase/admin";
import type { NeltGrowthAnalysis } from "@/lib/nelt/compare/types";

export const runtime = "nodejs";
export const maxDuration = 60;

/** 학부모용 공유 링크 생성 */
export async function POST(request: Request) {
  const auth = await requireNeltStaff();
  if (!auth.ok) return auth.error;

  let body: {
    studentName?: string;
    parentMessage?: string;
    analysis?: NeltGrowthAnalysis;
    meta?: NeltParentMessageMeta;
  };
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
  const analysis =
    body.analysis ?? buildNeltGrowthAnalysis(studentName, attempts);
  if (!analysis || analysis.attemptCount < 2) {
    return NextResponse.json(
      { ok: false, message: "회차가 2개 이상이어야 공유할 수 있습니다." },
      { status: 400 }
    );
  }

  const growth = await upsertNeltGrowthReport(auth.supabase, {
    academyId: auth.academyId,
    studentName,
    createdBy: auth.profile.id,
  });
  if (!growth.ok) {
    return NextResponse.json(
      { ok: false, message: growth.message },
      { status: 400 }
    );
  }

  const meta: NeltParentMessageMeta = {
    academyName: ACADEMY_NAME,
    ...(body.meta ?? {}),
  };

  let parentMessage = body.parentMessage?.trim() || "";
  if (!parentMessage) {
    const ai = await generateNeltParentMessageAi(analysis, meta);
    parentMessage = ai.ok
      ? ai.message
      : buildNeltParentMessageFallback(analysis, meta);
  }

  const token = generateShareToken();
  const expiresAt = shareExpiresAt(30);
  const shareUrl = buildNeltShareUrl(token, resolveShareBaseUrl());
  parentMessage = attachReportUrlToMessage(parentMessage, shareUrl);

  await auth.supabase
    .from("nelt_growth_reports")
    .update({
      parent_message: parentMessage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", growth.growthId);

  const admin = createAdminClient();

  const { error } = await admin.from("nelt_shared_reports").insert({
    academy_id: auth.academyId,
    growth_report_id: growth.growthId,
    token,
    expires_at: expiresAt,
    created_by: auth.profile.id,
    parent_message: parentMessage,
    report_snapshot: analysis as unknown as Record<string, unknown>,
    student_name_raw: studentName,
  });

  if (error) {
    console.error("[nelt/share]", error.message);
    return NextResponse.json(
      {
        ok: false,
        message:
          error.message.includes("parent_message") ||
          error.message.includes("report_snapshot")
            ? "공유 테이블 마이그레이션(100)이 필요합니다."
            : "공유 링크 생성에 실패했습니다.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    shareUrl,
    token,
    expiresAt,
    parentMessage,
  });
}

/** 공개 조회 (토큰) */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")?.trim();
  if (!token) {
    return NextResponse.json(
      { ok: false, message: "토큰이 없습니다." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("nelt_shared_reports")
    .select(
      "token, expires_at, parent_message, report_snapshot, student_name_raw, academy_id"
    )
    .eq("token", token)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { ok: false, message: "리포트를 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
    return NextResponse.json(
      { ok: false, message: "만료된 공유 링크입니다." },
      { status: 410 }
    );
  }

  return NextResponse.json({
    ok: true,
    studentName: data.student_name_raw,
    parentMessage: data.parent_message,
    analysis: data.report_snapshot,
    expiresAt: data.expires_at,
  });
}
