import { createClient } from "@/lib/supabase/server";
import { loadAnalysisReportProjects } from "@/lib/lesson-materials/load-material-payloads";
import { resolveDocumentProjectIds } from "@/lib/lesson-materials/document-page";
import { AnalysisReportWorkbench } from "@/components/lesson-materials/AnalysisReportWorkbench";
import type { AnalysisReportData } from "@/lib/lesson-materials/generate-analysis-report";
import { getAcademyBrandingForCurrentUser } from "@/lib/tenant/academy-branding";
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
  const branding = await getAcademyBrandingForCurrentUser();
  // 지문 분석서·최종통합자료가 같은 불러오기를 쓴다(1장 자료 재료 = 문장 밑 주석 포함)
  const payload = await loadAnalysisReportProjects(supabase, ids);

  return (
    <AnalysisReportWorkbench
      regenerate={regenerate}
      role="admin"
      projects={payload}
      logoSrc={branding.logoUrl}
    />
  );
}
