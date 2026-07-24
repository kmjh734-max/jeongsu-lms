import { NextResponse } from "next/server";
import { requireNeltStaff } from "@/lib/nelt/require-nelt-staff";
import {
  buildNeltParentMessageFallback,
  ensureNeltMessageTitle,
  generateNeltParentMessageAi,
  NELT_MESSAGE_VERSION_COUNT,
  resolveNeltMessageVersion,
  type NeltParentMessageMeta,
  type NeltParentMessageTone,
} from "@/lib/nelt/generate-parent-message";
import { buildNeltGrowthAnalysis } from "@/lib/nelt/compare/build-growth";
import { loadStudentNeltAttempts } from "@/lib/nelt/load-student-attempts";
import { ACADEMY_NAME } from "@/lib/branding";
import type { NeltGrowthAnalysis } from "@/lib/nelt/compare/types";

export const runtime = "nodejs";
export const maxDuration = 60;

function normalizeTone(value: unknown): NeltParentMessageTone {
  if (value === "short" || value === "detail" || value === "standard") {
    return value;
  }
  return "standard";
}

function pickMeta(body: {
  meta?: NeltParentMessageMeta;
  parentTitle?: string;
  senderRole?: string;
  senderName?: string;
  enrollmentDate?: string | null;
  studyDuration?: string | null;
  reportUrl?: string | null;
}): NeltParentMessageMeta {
  const m = body.meta ?? {};
  return {
    academyName: m.academyName ?? ACADEMY_NAME,
    parentTitle: body.parentTitle ?? m.parentTitle,
    senderRole: body.senderRole ?? m.senderRole,
    senderName: body.senderName ?? m.senderName,
    enrollmentDate: body.enrollmentDate ?? m.enrollmentDate,
    studyDuration: body.studyDuration ?? m.studyDuration,
    reportUrl: body.reportUrl ?? m.reportUrl,
  };
}

export async function POST(request: Request) {
  const auth = await requireNeltStaff();
  if (!auth.ok) return auth.error;

  let body: {
    studentName?: string;
    analysis?: NeltGrowthAnalysis;
    tone?: NeltParentMessageTone;
    meta?: NeltParentMessageMeta;
    parentTitle?: string;
    senderRole?: string;
    senderName?: string;
    enrollmentDate?: string | null;
    studyDuration?: string | null;
    reportUrl?: string | null;
    variationSeed?: number | string | null;
    messageVersion?: number | null;
    previousMessage?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "요청 본문이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  let analysis = body.analysis ?? null;
  const studentName = body.studentName?.trim() || analysis?.studentName?.trim();
  const tone = normalizeTone(body.tone);
  const messageVersion =
    typeof body.messageVersion === "number"
      ? body.messageVersion
      : typeof body.meta?.messageVersion === "number"
        ? body.meta.messageVersion
        : null;
  const meta: NeltParentMessageMeta = {
    ...pickMeta(body),
    variationSeed:
      body.variationSeed ??
      body.meta?.variationSeed ??
      `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    messageVersion,
    previousMessage:
      body.previousMessage ?? body.meta?.previousMessage ?? null,
  };
  const version = resolveNeltMessageVersion(
    meta.messageVersion,
    meta.variationSeed
  );

  if (!analysis && studentName) {
    const attempts = await loadStudentNeltAttempts(
      auth.supabase,
      auth.academyId,
      studentName
    );
    analysis = buildNeltGrowthAnalysis(studentName, attempts);
  }

  if (!analysis || analysis.attemptCount < 2) {
    return NextResponse.json(
      { ok: false, message: "성장 비교 데이터가 부족합니다." },
      { status: 400 }
    );
  }

  const ai = await generateNeltParentMessageAi(analysis, meta, tone);
  const message = ensureNeltMessageTitle(
    ai.ok
      ? ai.message
      : buildNeltParentMessageFallback(
          analysis,
          { ...meta, messageVersion: version.index },
          tone
        )
  );

  await auth.supabase
    .from("nelt_growth_reports")
    .update({
      parent_message: message,
      updated_at: new Date().toISOString(),
    })
    .eq("academy_id", auth.academyId)
    .eq("student_name_raw", analysis.studentName);

  return NextResponse.json({
    ok: true,
    message,
    source: ai.ok ? "ai" : "fallback",
    model: ai.ok ? ai.model : null,
    versionIndex: ai.ok ? ai.versionIndex : version.index,
    versionLabel: ai.ok ? ai.versionLabel : version.label,
    versionCount: NELT_MESSAGE_VERSION_COUNT,
  });
}
