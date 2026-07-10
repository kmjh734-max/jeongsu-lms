import { QuestionPrintView } from "@/components/question-generator/QuestionPrintView";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string; autoprint?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const mode = sp.mode === "answers" ? "answers" : "exam";
  const autoPrint = sp.autoprint === "1" || sp.autoprint === "true";
  return (
    <QuestionPrintView
      jobId={id}
      backHref={`/admin/question-generator/generations/${id}`}
      mode={mode}
      autoPrint={autoPrint}
    />
  );
}
