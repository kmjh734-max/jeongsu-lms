import { createClient } from "@/lib/supabase/server";
import { resolveDocumentProjectIds } from "@/lib/lesson-materials/document-page";
import { AnalysisReportWorkbench } from "@/components/lesson-materials/AnalysisReportWorkbench";
import type { AnalysisReportData } from "@/lib/lesson-materials/generate-analysis-report";
import { getAcademyBrandingForCurrentUser } from "@/lib/tenant/academy-branding";
import { LOGO_SRC } from "@/lib/branding";
import Link from "next/link";

export default async function AdminAnalysisReportPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string; doc?: string; newDoc?: string }>;
}) {
  // ?doc=면 저장된 파일의 지문을, 아니면 ?ids=를 쓴다.
  const params = await searchParams;
  const ids = await resolveDocumentProjectIds(params, "analysis_report");
  // 제작 버튼으로 연 경우(?newDoc=1)는 이미 만든 적이 있어도 새로 만든다.
  const regenerate = params.newDoc === "1" && !params.doc;

  if (ids.length === 0) {
    return (
      <div className="px-4 py-10">
        <p className="text-sm text-slate-600">선택된 자료가 없습니다.</p>
        <Link
          href="/admin/lesson-materials"
          className="mt-3 inline-block text-sm text-violet-700"
        >
          ← 자료함
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("lesson_material_projects")
    .select("id,title,title_en,source,analysis_report_json,deleted_at")
    .in("id", ids)
    .is("deleted_at", null);

  const branding = await getAcademyBrandingForCurrentUser();
  const byId = new Map((projects ?? []).map((p) => [p.id, p] as const));
  const ordered = ids.map((id) => byId.get(id)).filter(Boolean);

  const payload = ordered.map((p) => {
    const report = (p!.analysis_report_json ?? null) as AnalysisReportData | null;
    const hasSentences =
      !!report && Array.isArray(report.sentences) && report.sentences.length > 0;
    return {
      id: p!.id,
      title: p!.title,
      titleEn: (p!.title_en as string | null) ?? null,
      source: (p!.source as string | null) ?? null,
      headerLabel: report?.headerLabel || "26년도 1학기 중간고사 대비",
      report: hasSentences ? report : null,
    };
  });

  return (
    <AnalysisReportWorkbench
      regenerate={regenerate}
      role="admin"
      projects={payload}
      logoSrc={branding.logoUrl || LOGO_SRC}
    />
  );
}
