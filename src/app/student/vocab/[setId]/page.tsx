import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { VocabStudentSetHub } from "@/components/vocab/VocabStudentSetHub";
import { fetchStudentVocabSummaries } from "@/lib/vocab/student-sets";

interface PageProps {
  params: Promise<{ setId: string }>;
}

export default async function StudentVocabSetPage({ params }: PageProps) {
  const { setId } = await params;
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const summaries = await fetchStudentVocabSummaries(supabase, profile!.id);
  const summary = summaries.find((s) => s.set.id === setId);

  if (!summary) notFound();

  return (
    <div className="mx-auto w-full max-w-4xl py-6 px-4 sm:py-10">
      <VocabStudentSetHub
        setId={setId}
        setTitle={summary.set.title}
        itemCount={summary.itemCount}
      />
    </div>
  );
}
