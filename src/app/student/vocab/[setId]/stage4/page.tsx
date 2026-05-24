import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { VocabStage3Test } from "@/components/vocab/VocabStage3Test";
import { buildStage3Questions } from "@/lib/vocab/build-stage3-questions";
import { loadStudentVocabSetContext } from "@/lib/vocab/load-student-vocab-set";

interface PageProps {
  params: Promise<{ setId: string }>;
}

export default async function StudentVocabStage4Page({ params }: PageProps) {
  const { setId } = await params;
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const ctx = await loadStudentVocabSetContext(supabase, profile!.id, setId);
  if (!ctx) notFound();
  if (!ctx.progress.stage3_completed) {
    redirect(`/student/vocab/${setId}`);
  }
  if (ctx.itemCount < 1) redirect(`/student/vocab/${setId}`);

  const questions = buildStage3Questions(ctx.items);

  return (
    <div className="py-6 sm:py-10">
      <VocabStage3Test
        setId={setId}
        setTitle={ctx.set.title}
        questions={questions}
        stageNumber={4}
      />
    </div>
  );
}
