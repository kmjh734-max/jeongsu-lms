import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { VocabTestResultView } from "@/components/vocab/VocabTestResultView";
import { loadTestAttemptDetail } from "@/lib/vocab/load-test-attempt";

interface PageProps {
  params: Promise<{ setId: string }>;
  searchParams: Promise<{ attemptId?: string }>;
}

export default async function StudentVocabTestResultPage({
  params,
  searchParams,
}: PageProps) {
  const { setId } = await params;
  const { attemptId } = await searchParams;

  if (!attemptId) {
    redirect(`/student/vocab/${setId}`);
  }

  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const detail = await loadTestAttemptDetail(
    supabase,
    attemptId,
    profile!.id
  );

  if (!detail || detail.attempt.set_id !== setId) {
    notFound();
  }

  return (
    <div className="py-6 sm:py-10">
      <VocabTestResultView
        setId={setId}
        attempt={detail.attempt}
        answers={detail.answers}
      />
    </div>
  );
}
