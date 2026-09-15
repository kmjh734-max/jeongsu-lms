import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { VocabStage3ExampleBlank } from "@/components/vocab/VocabStage3ExampleBlank";
import { buildExampleBlankQuestions } from "@/lib/vocab/example-blank";
import { loadStudentVocabSetContext } from "@/lib/vocab/load-student-vocab-set";

interface PageProps {
  params: Promise<{ setId: string }>;
}

export default async function StudentVocabStage3Page({ params }: PageProps) {
  const { setId } = await params;
  const [profile, supabase] = await Promise.all([
    getCurrentProfile(),
    createClient(),
  ]);

  const ctx = await loadStudentVocabSetContext(supabase, profile!.id, setId, {
    items: "stage3",
    progress: "hub",
  });
  if (!ctx) notFound();
  if (ctx.set.exam_compact) {
    redirect(`/student/vocab/${setId}`);
  }
  if (!ctx.progress.stage2_completed) {
    redirect(`/student/vocab/${setId}`);
  }
  if (ctx.itemCount < 1) redirect(`/student/vocab/${setId}`);

  const questions = buildExampleBlankQuestions(ctx.items);
  const excludedCount = ctx.items.length - questions.length;

  // 아직 끝내지 않았으면 지난번에 맞힌 문제는 건너뛰고 이어서 푼다 (완료 확인도 이 기록을 센다)
  let initialCorrectIds: string[] = [];
  if (!ctx.progress.stage3_completed) {
    const { data } = await supabase
      .from("vocab_example_attempts")
      .select("item_id")
      .eq("student_id", profile!.id)
      .eq("set_id", setId)
      .eq("is_correct", true);
    initialCorrectIds = [
      ...new Set(((data ?? []) as { item_id: string }[]).map((r) => r.item_id)),
    ];
  }

  return (
    <VocabStage3ExampleBlank
      setId={setId}
      setTitle={ctx.set.title}
      itemCount={ctx.itemCount}
      questions={questions}
      excludedCount={excludedCount}
      initialCorrectIds={initialCorrectIds}
      nextHref={
        ctx.progress.stage4_passed ? undefined : `/student/vocab/${setId}/stage4`
      }
      nextLabel="4단계 종합테스트 시작"
    />
  );
}
