import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { VocabStage3Test } from "@/components/vocab/VocabStage3Test";
import {
  buildStage3Questions,
  stage4QuestionSeed,
  toClientQuestions,
} from "@/lib/vocab/build-stage3-questions";
import { ensureExamCompactStageSkip } from "@/lib/question-generator/exam-vocab";
import { loadStageProgress } from "@/lib/vocab/load-stage-progress";
import { loadStudentVocabSetContext } from "@/lib/vocab/load-student-vocab-set";

interface PageProps {
  params: Promise<{ setId: string }>;
}

export default async function StudentVocabStage4Page({ params }: PageProps) {
  const { setId } = await params;
  const [profile, supabase] = await Promise.all([
    getCurrentProfile(),
    createClient(),
  ]);

  const ctx = await loadStudentVocabSetContext(supabase, profile!.id, setId, {
    items: "stage4",
    progress: "hub",
  });
  if (!ctx) notFound();

  if (ctx.set.exam_compact) {
    await ensureExamCompactStageSkip(profile!.id, setId);
  }

  const progress = await loadStageProgress(supabase, profile!.id, setId, {
    createIfMissing: false,
    fields: "hub",
  });

  const unlocked = ctx.set.exam_compact
    ? progress.stage2_completed
    : progress.stage3_completed;
  if (!unlocked) redirect(`/student/vocab/${setId}`);
  if (ctx.itemCount < 1) redirect(`/student/vocab/${setId}`);

  // 서버 채점과 같은 시드로 문항을 만들고, 정답은 빼고 보낸다
  const attemptNumber = progress.stage4_attempt_count ?? 0;
  const questions = toClientQuestions(
    buildStage3Questions(
      ctx.items,
      stage4QuestionSeed(setId, profile!.id, attemptNumber)
    )
  );

  return (
    <VocabStage3Test
      setId={setId}
      setTitle={ctx.set.title}
      questions={questions}
      attemptNumber={attemptNumber}
      stageNumber={ctx.set.exam_compact ? 3 : 4}
    />
  );
}
