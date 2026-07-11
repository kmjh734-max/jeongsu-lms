import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ setId: string }>;
}

/** 구 QR 경로 → 로그인 없는 공개 학습으로 */
export default async function StudentExamVocabRedirect({ params }: PageProps) {
  const { setId } = await params;
  redirect(`/exam-vocab/${setId}`);
}
