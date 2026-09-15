import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { VocabStage1Study } from "@/components/vocab/VocabStage1Study";
import { loadStudentVocabSetContext } from "@/lib/vocab/load-student-vocab-set";

interface PageProps {
  params: Promise<{ setId: string }>;
}

export default async function StudentVocabStage1Page({ params }: PageProps) {
  const { setId } = await params;
  const [profile, supabase] = await Promise.all([
    getCurrentProfile(),
    createClient(),
  ]);

  const ctx = await loadStudentVocabSetContext(supabase, profile!.id, setId, {
    items: "stage1",
    progress: "stage1",
  });
  if (!ctx) notFound();
  if (ctx.itemCount < 1) redirect(`/student/vocab/${setId}`);

  // 지워진 단어의 기록은 세지 않는다
  const currentIds = new Set(ctx.items.map((it) => it.id));
  const seenIds = (ctx.progress.stage1_seen_item_ids ?? []).filter((id) =>
    currentIds.has(id)
  );

  return (
    <VocabStage1Study
      setId={setId}
      setTitle={ctx.set.title}
      items={ctx.items}
      initialSeenIds={seenIds}
      stage1Completed={ctx.progress.stage1_completed}
    />
  );
}
