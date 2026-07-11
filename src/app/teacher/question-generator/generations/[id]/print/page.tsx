import { QuestionPrintView } from "@/components/question-generator/QuestionPrintView";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string; autoprint?: string; layout?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const mode = sp.mode === "answers" ? "answers" : "exam";
  const autoPrint = sp.autoprint === "1" || sp.autoprint === "true";
  const layout = sp.layout === "byType" ? "byType" : "mixed";
  return (
    <QuestionPrintView
      jobId={id}
      backHref={`/teacher/question-generator/generations/${id}`}
      mode={mode}
      autoPrint={autoPrint}
      layout={layout}
    />
  );
}
