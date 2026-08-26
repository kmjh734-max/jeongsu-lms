import { notFound, redirect } from "next/navigation";
import { WorkbookSetPrintView } from "@/components/exam-prep/WorkbookSetPrintView";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import { getAcademyBrandingForCurrentUser } from "@/lib/tenant/academy-branding";
import { loadSetWorkbookPrintData } from "@/lib/exam-prep/load-set-workbook-print";

interface PageProps {
  params: Promise<{ setId: string }>;
  searchParams: Promise<{ answers?: string }>;
}

export default async function AdminExamPrepSetPrintPage({
  params,
  searchParams,
}: PageProps) {
  if (!isExamPrepEnabled()) redirect("/admin");
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin" || !profile.academy_id) {
    redirect("/login");
  }

  const { setId } = await params;
  const sp = await searchParams;
  const showAnswers = sp.answers === "1";

  const data = await loadSetWorkbookPrintData(
    setId,
    profile.academy_id,
    showAnswers
  );
  if (!data) notFound();
  const branding = await getAcademyBrandingForCurrentUser();

  return (
    <WorkbookSetPrintView
      setTitle={data.setTitle}
      workbooks={data.workbooks}
      missingPassageTitles={data.missingPassageTitles}
      showAnswers={showAnswers}
      backHref="/admin/exam-prep/passages"
      academyName={branding.name}
      logoSrc={branding.logoUrl}
    />
  );
}
