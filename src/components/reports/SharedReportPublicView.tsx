import { SharedReportHtmlView } from "@/components/reports/SharedReportHtmlView";
import type { StudentReport } from "@/lib/reports/types";

interface SharedReportPublicViewProps {
  report: StudentReport;
  parentMessage: string;
  aiReportText: string;
  expiresAt: string;
  studentName: string;
  shareToken: string;
  academyName?: string;
  logoSrc?: string;
}

/** 학부모 공개 — 모바일 HTML 리포트 */
export function SharedReportPublicView(props: SharedReportPublicViewProps) {
  return <SharedReportHtmlView {...props} />;
}
