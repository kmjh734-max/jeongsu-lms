import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { VocabSetStageHub } from "@/components/vocab/VocabSetStageHub";
import { loadStudentVocabSetContext } from "@/lib/vocab/load-student-vocab-set";

interface PageProps {
  params: Promise<{ setId: string }>;
}

export default async function StudentVocabSetPage({ params }: PageProps) {
  const { setId } = await params;
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const ctx = await loadStudentVocabSetContext(supabase, profile!.id, setId);
  if (!ctx) notFound();

  return (
    <div className="py-4">
      <VocabSetStageHub
        setId={setId}
        setTitle={ctx.set.title}
        itemCount={ctx.itemCount}
        progress={ctx.progress}
      />
    </div>
  );
}
