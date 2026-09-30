import { QuestionPrintView } from "@/components/question-generator/QuestionPrintView";
import { getAcademyBrandingForCurrentUser } from "@/lib/tenant/academy-branding";

/** 골라 묶은 시험지 인쇄 — 생성 묶음 인쇄와 같은 화면을 쓴다 */
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string; layout?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const mode = sp.mode === "answers" ? "answers" : "exam";
  const layout = sp.layout === "byType" || sp.layout === "byPassage" ? sp.layout : "mixed";
  const branding = await getAcademyBrandingForCurrentUser();
  return (
    <QuestionPrintView
      jobId=""
      setId={id}
      backHref="/teacher/question-generator/sets"
      printBaseHref={`/teacher/question-generator/sets/${id}`}
      mode={mode}
      layout={layout}
      academyName={branding.name}
      logoSrc={branding.logoUrl}
    />
  );
}
