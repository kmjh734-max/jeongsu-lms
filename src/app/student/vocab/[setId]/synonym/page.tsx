import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { VocabSynonymTest } from "@/components/vocab/VocabSynonymTest";
import { loadStudentVocabSetContext } from "@/lib/vocab/load-student-vocab-set";
import {
  buildSynonymQuestions,
  synonymQuestionSeed,
  toSynonymClientQuestions,
} from "@/lib/vocab/synonym-test";

interface PageProps {
  params: Promise<{ setId: string }>;
}

/** 4단계 · 동반의어 객관식. 동의어·반의어가 있는 단어가 없으면 건너뛰고 5단계 종합테스트로 보낸다. */
export default async function StudentVocabSynonymPage({ params }: PageProps) {
  const { setId } = await params;
  const [profile, supabase] = await Promise.all([getCurrentProfile(), createClient()]);

  const ctx = await loadStudentVocabSetContext(supabase, profile!.id, setId, {
    items: "full",
    progress: "hub",
  });
  if (!ctx) notFound();
  if (ctx.set.exam_compact) redirect(`/student/vocab/${setId}/stage4`);
  if (!ctx.progress.stage3_completed || !ctx.progress.id) redirect(`/student/vocab/${setId}`);

  const attemptNumber = ctx.progress.stage_syn_attempt_count ?? 0;
  const questions = buildSynonymQuestions(ctx.items, synonymQuestionSeed(setId, profile!.id, attemptNumber));

  if (questions.length === 0) {
    // 학생 계정은 진행 기록을 쓸 수 없다(마이그레이션 130) — 서버가 본인 기록만 고친다
    if (!ctx.progress.stage_syn_skipped) {
      await createAdminClient()
        .from("vocab_stage_progress")
        .update({ stage_syn_skipped: true, updated_at: new Date().toISOString() })
        .eq("id", ctx.progress.id)
        .eq("student_id", profile!.id);
    }
    redirect(`/student/vocab/${setId}/stage4`);
  }

  return (
    <VocabSynonymTest
      setId={setId}
      setTitle={ctx.set.title}
      questions={toSynonymClientQuestions(questions)}
      attemptNumber={attemptNumber}
      alreadyPassed={Boolean(ctx.progress.stage_syn_passed)}
      bestScore={ctx.progress.stage_syn_best_score ?? 0}
    />
  );
}
