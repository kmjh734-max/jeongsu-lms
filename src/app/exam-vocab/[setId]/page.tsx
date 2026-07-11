import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ setId: string }>;
}

/** 구 공개 QR URL → 기존 학생 단어학습 진입으로 */
export default async function ExamVocabLegacyRedirect({ params }: PageProps) {
  const { setId } = await params;
  redirect(`/student/vocab/exam/${setId}`);
}
