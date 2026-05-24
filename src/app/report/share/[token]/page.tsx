import { ACADEMY_NAME } from "@/lib/branding";
import { lookupSharedReport } from "@/lib/reports/get-shared-report";
import { SharedReportPublicView } from "@/components/reports/SharedReportPublicView";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function SharedReportPage({ params }: PageProps) {
  const { token } = await params;
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
  return (
    <SharedReportPublicView
      report={payload.report}
      parentMessage={payload.parentMessage}
      aiReportText={payload.aiReportText}
      expiresAt={payload.expiresAt}
      studentName={payload.studentName}
    />
  );
}
