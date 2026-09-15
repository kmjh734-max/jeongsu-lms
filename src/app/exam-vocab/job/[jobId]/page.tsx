import { notFound, redirect } from "next/navigation";
import { syncExamVocabSetFromJob } from "@/lib/question-generator/exam-vocab";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ jobId: string }>;
}

/**
 * 시험지 QR (job 기준) — 단어장이 이미 있으면 그대로 이동, 없을 때만 만든다.
 * QR 접속으로는 기존 단어를 다시 쓰지 않는다(학생 기록 보호).
 */
export default async function ExamVocabJobRedirectPage({ params }: PageProps) {
  const { jobId } = await params;
  const setId = await syncExamVocabSetFromJob(jobId, "ensure");
  if (!setId) notFound();
  redirect(`/exam-vocab/${setId}`);
}
