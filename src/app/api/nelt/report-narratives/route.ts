import { NextResponse } from "next/server";
import { requireNeltStaff } from "@/lib/nelt/require-nelt-staff";
import { buildNeltGrowthAnalysis } from "@/lib/nelt/compare/build-growth";
import { loadStudentNeltAttempts } from "@/lib/nelt/load-student-attempts";
import {
  buildAttemptFingerprint,
  generateNeltReportNarrativesAi,
  narrativesFromRuleBased,
  parseStoredNarratives,
  type NeltAiNarratives,
} from "@/lib/nelt/generate-report-narratives";
import { isReportUuid } from "@/lib/nelt/is-report-uuid";
import { upsertNeltGrowthReport } from "@/lib/nelt/upsert-growth-report";
import type { NeltGrowthAnalysis } from "@/lib/nelt/compare/types";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(request: Request) {
  const auth = await requireNeltStaff();
  if (!auth.ok) return auth.error;

  let body: {
    studentName?: string;
    analysis?: NeltGrowthAnalysis;
    force?: boolean;
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
  const force = Boolean(body.force);

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

  const fingerprint = buildAttemptFingerprint(analysis);
  const persistedIds = analysis.attempts.map((a) => a.id).filter(isReportUuid);

  // 재생성 버튼이 아니면 AI 호출 금지 — 저장분 또는 규칙 문구만
  if (!force) {
    const { data: existing } = await auth.supabase
      .from("nelt_growth_reports")
      .select("id, generated_summary")
      .eq("academy_id", auth.academyId)
      .eq("student_name_raw", analysis.studentName)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const cached = parseStoredNarratives(existing?.generated_summary);
    if (cached?.overallSummary?.trim()) {
      return NextResponse.json({
        ok: true,
        narratives: cached,
        source: cached.model ? "cache" : "fallback",
        model: cached.model,
        growthId: existing?.id ?? null,
      });
    }

    return NextResponse.json({
      ok: true,
      narratives: narrativesFromRuleBased(analysis),
      source: "fallback",
      model: null,
      growthId: existing?.id ?? null,
    });
  }

  if (persistedIds.length >= 2) {
    await upsertNeltGrowthReport(auth.supabase, {
      academyId: auth.academyId,
      studentName: analysis.studentName,
      createdBy: auth.profile.id,
      attempts: analysis.attempts.filter((a) => isReportUuid(a.id)),
      reportIds: persistedIds,
    });
  }

  const result = await generateNeltReportNarrativesAi(analysis);
  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: result.message || "AI 서술 생성에 실패했습니다.",
        source: "fallback",
        narratives: null,
      },
      { status: 502 }
    );
  }

  const narratives: NeltAiNarratives = {
    ...result.narratives,
    attemptFingerprint: fingerprint,
  };

  if (persistedIds.length >= 2) {
    await auth.supabase
      .from("nelt_growth_reports")
      .update({
        generated_summary: JSON.stringify(narratives),
        updated_at: new Date().toISOString(),
      })
      .eq("academy_id", auth.academyId)
      .eq("student_name_raw", analysis.studentName);
  }

  return NextResponse.json({
    ok: true,
    narratives,
    source: "ai",
    model: result.model,
  });
}
