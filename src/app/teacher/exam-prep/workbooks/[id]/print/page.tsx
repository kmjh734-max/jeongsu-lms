import { notFound, redirect } from "next/navigation";
import { WorkbookPrintView } from "@/components/exam-prep/WorkbookPrintView";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import { getAcademyBrandingForCurrentUser } from "@/lib/tenant/academy-branding";
import { loadWorkbookPrintData } from "@/lib/exam-prep/load-workbook-print";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ answers?: string }>;
}

export default async function TeacherExamPrepWorkbookPrintPage({
  params,
  searchParams,
}: PageProps) {
  if (!isExamPrepEnabled()) redirect("/teacher");
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "teacher" || !profile.academy_id) {
    redirect("/login");
  }

  const { id } = await params;
  const sp = await searchParams;
  const showAnswers = sp.answers === "1";

  const data = await loadWorkbookPrintData(
    id,
    profile.academy_id,
    showAnswers
  );
  if (!data) notFound();
  const branding = await getAcademyBrandingForCurrentUser();

  return (
    <WorkbookPrintView
      workbookTitle={data.workbookTitle}
      passageTitle={data.passageTitle}
      metaLine={data.metaLine}
      stages={data.stages}
      showAnswers={showAnswers}
      backHref={`/teacher/exam-prep/workbooks/${id}/edit`}
      academyName={branding.name}
      logoSrc={branding.logoUrl}
    />
  );
}
