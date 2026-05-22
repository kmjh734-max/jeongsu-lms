import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ setId: string }>;
}

/** 3단계 종합테스트로 통합됨 */
export default async function StudentVocabTestRedirect({
  params,
}: PageProps) {
  const { setId } = await params;
  redirect(`/student/vocab/${setId}`);
}
