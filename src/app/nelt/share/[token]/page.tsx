import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NeltGrowthReportView } from "@/components/nelt/NeltGrowthReportView";
import { buildNeltGrowthAnalysis } from "@/lib/nelt/compare/build-growth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { NeltGrowthAnalysis } from "@/lib/nelt/compare/types";
import { ACADEMY_NAME } from "@/lib/branding";

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { token: raw } = await params;
  const token = decodeURIComponent(raw).trim();
  if (!token) return { title: "[NELT 성장 리포트]" };

  const admin = createAdminClient();
  const { data } = await admin
    .from("nelt_shared_reports")
    .select("student_name_raw")
    .eq("token", token)
    .maybeSingle();

  const name = data?.student_name_raw?.trim();
  const title = name
    ? `[NELT 성장 리포트] ${name}`
    : "[NELT 성장 리포트]";

  return {
    title,
    openGraph: {
      title,
      description: `${ACADEMY_NAME} NELT 영어 누적 성장 리포트`,
      type: "website",
    },
  };
}

export default async function NeltSharePage({ params }: PageProps) {
  const { token: raw } = await params;
  const token = decodeURIComponent(raw).trim();
  if (!token) notFound();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("nelt_shared_reports")
    .select("expires_at, report_snapshot, student_name_raw")
    .eq("token", token)
    .maybeSingle();

  if (error || !data?.report_snapshot) notFound();
  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-slate-900">만료된 링크입니다</h1>
        <p className="mt-2 text-sm text-slate-600">
          학원에 새 공유 링크를 요청해 주세요.
        </p>
      </main>
    );
  }

  let analysis = data.report_snapshot as unknown as NeltGrowthAnalysis;
  if (!analysis?.attempts || analysis.attempts.length < 2) notFound();
  if (!analysis.attemptSteps || !analysis.trendPoints) {
    analysis =
      buildNeltGrowthAnalysis(analysis.studentName, analysis.attempts) ??
      analysis;
  }

  return (
    <main className="mx-auto max-w-[1180px] bg-[#f4f7fb] px-3 py-6 sm:px-5 sm:py-10">
      <p className="mb-4 text-center text-xs font-semibold tracking-wide text-[#68748a]">
        {ACADEMY_NAME} · NELT 영어 성장 리포트
      </p>
      {/* 카톡에 이미 안내문을 보냈으므로 공개 페이지에는 리포트만 표시 */}
      <NeltGrowthReportView
        role="admin"
        analysis={analysis}
        parentView
      />
    </main>
  );
}
