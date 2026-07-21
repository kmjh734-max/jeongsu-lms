import { notFound, redirect } from "next/navigation";
import { syncExamVocabSetFromJob } from "@/lib/question-generator/exam-vocab";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ jobId: string }>;
}

/** 시험지 QR (job 기준) — 단어장 없으면 생성 후 허브로 이동 */
export default async function ExamVocabJobRedirectPage({ params }: PageProps) {
  const { jobId } = await params;
  const setId = await syncExamVocabSetFromJob(jobId);
  if (!setId) notFound();
  redirect(`/exam-vocab/${setId}`);
}
