import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { VocabSetStageHub } from "@/components/vocab/VocabSetStageHub";
import { ensureExamCompactStageSkip } from "@/lib/question-generator/exam-vocab";
import { loadStudentVocabSetContext } from "@/lib/vocab/load-student-vocab-set";

interface PageProps {
  params: Promise<{ setId: string }>;
}

export default async function StudentVocabSetPage({ params }: PageProps) {
  const { setId } = await params;
  const [profile, supabase] = await Promise.all([
    getCurrentProfile(),
    createClient(),
  ]);

  // 단어 목록 카드용: 단어·뜻만 1단계와 같은 순서로 가볍게 불러온다
  const ctx = await loadStudentVocabSetContext(supabase, profile!.id, setId, {
    items: "stage2",
    progress: "hub",
  });
  if (!ctx) notFound();

  if (ctx.set.exam_compact) {
    await ensureExamCompactStageSkip(profile!.id, setId);
  }

  const progress =
    ctx.set.exam_compact
      ? await (
          await import("@/lib/vocab/load-stage-progress")
        ).loadStageProgress(supabase, profile!.id, setId, {
          createIfMissing: false,
          fields: "hub",
        })
      : ctx.progress;

  return (
    <VocabSetStageHub
      setId={setId}
      setTitle={ctx.set.title}
      itemCount={ctx.itemCount}
      progress={progress}
      items={ctx.items.map((it) => ({
        id: it.id,
        word: it.word,
        meaning: it.meaning,
      }))}
      examCompact={Boolean(ctx.set.exam_compact)}
    />
  );
}
