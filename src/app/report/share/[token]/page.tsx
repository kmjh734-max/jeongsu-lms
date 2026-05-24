import type { Metadata } from "next";
import { ACADEMY_NAME, LOGO_SRC, SITE_URL } from "@/lib/branding";
import { lookupSharedReport } from "@/lib/reports/get-shared-report";
import { buildShareUrl } from "@/lib/reports/share-token";
import { SharedReportPrintView } from "@/components/reports/SharedReportPrintView";
import { SharedReportPublicView } from "@/components/reports/SharedReportPublicView";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ view?: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { token } = await params;
  const lookup = await lookupSharedReport(token);
  const pageUrl = buildShareUrl(token);

  if (lookup.status !== "ok") {
    return {
      title: `학습 리포트 | ${ACADEMY_NAME}`,
      robots: { index: false, follow: false },
    };
  }

  const { studentName, report } = lookup.payload;
  const title = `${studentName} 학생 학습 리포트`;
  const description = `${report.rangeLabel} 온라인 학습 현황 리포트입니다.`;

  return {
    title: `${title} | ${ACADEMY_NAME}`,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      type: "website",
      locale: "ko_KR",
      url: pageUrl,
      siteName: ACADEMY_NAME,
      title,
      description,
      images: [{ url: `${SITE_URL}${LOGO_SRC}`, width: 800, height: 800 }],
    },
  };
}

export default async function SharedReportPage({
  params,
  searchParams,
}: PageProps) {
  const { token } = await params;
  const { view } = await searchParams;
  const lookup = await lookupSharedReport(token);

  if (lookup.status !== "ok") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">
            {lookup.status === "expired"
              ? "만료된 리포트입니다"
              : "리포트를 찾을 수 없습니다"}
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            {lookup.status === "expired"
              ? "이 링크는 열람 기간이 만료되었습니다."
              : "유효하지 않은 링크입니다."}
            <br />
            {ACADEMY_NAME} 강사에게 새 링크를 요청해 주세요.
          </p>
        </div>
      </div>
    );
  }

  const { payload } = lookup;

  if (view === "print") {
    return (
      <SharedReportPrintView
        report={payload.report}
        parentMessage={payload.parentMessage}
        aiReportText={payload.aiReportText}
        shareToken={token}
      />
    );
  }

  return (
    <SharedReportPublicView
      report={payload.report}
      parentMessage={payload.parentMessage}
      aiReportText={payload.aiReportText}
      expiresAt={payload.expiresAt}
      studentName={payload.studentName}
      shareToken={token}
    />
  );
}
