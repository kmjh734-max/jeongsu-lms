import { NextResponse } from "next/server";
import { requireNeltStaff } from "@/lib/nelt/require-nelt-staff";
import {
  buildNeltParentMessageFallback,
  generateNeltParentMessageAi,
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

export async function POST(request: Request) {
  const auth = await requireNeltStaff();
  if (!auth.ok) return auth.error;

  let body: {
    studentName?: string;
    analysis?: NeltGrowthAnalysis;
    tone?: NeltParentMessageTone;
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

  const ai = await generateNeltParentMessageAi(analysis, ACADEMY_NAME, tone);
  const message = ai.ok
    ? ai.message
    : buildNeltParentMessageFallback(analysis, ACADEMY_NAME, tone);

  // 성장 리포트에 저장 (있으면)
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
  });
}
