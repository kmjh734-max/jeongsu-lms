import { NextResponse } from "next/server";
import { requireNeltStaff } from "@/lib/nelt/require-nelt-staff";
import { buildNeltGrowthAnalysis } from "@/lib/nelt/compare/build-growth";
import { loadStudentNeltAttempts } from "@/lib/nelt/load-student-attempts";
import {
  generateNeltReportNarrativesAi,
  parseStoredNarratives,
  type NeltAiNarratives,
} from "@/lib/nelt/generate-report-narratives";
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
    if (cached?.model) {
      return NextResponse.json({
        ok: true,
        narratives: cached,
        source: "cache",
        model: cached.model,
        growthId: existing?.id ?? null,
      });
    }
  }

  const result = await generateNeltReportNarrativesAi(analysis);
  const narratives: NeltAiNarratives = result.narratives;

  await auth.supabase
    .from("nelt_growth_reports")
    .update({
      generated_summary: JSON.stringify(narratives),
      updated_at: new Date().toISOString(),
    })
    .eq("academy_id", auth.academyId)
    .eq("student_name_raw", analysis.studentName);

  return NextResponse.json({
    ok: true,
    narratives,
    source: result.source,
    model: result.ok ? result.model : null,
    message: result.ok ? undefined : result.message,
  });
}
