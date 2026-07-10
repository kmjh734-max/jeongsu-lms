import { QuestionPrintView } from "@/components/question-generator/QuestionPrintView";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <QuestionPrintView
      jobId={id}
      backHref={`/teacher/question-generator/generations/${id}`}
    />
  );
}
