import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { VocabStage2Spelling } from "@/components/vocab/VocabStage2Spelling";
import { loadStudentVocabSetContext } from "@/lib/vocab/load-student-vocab-set";

interface PageProps {
  params: Promise<{ setId: string }>;
}

export default async function StudentVocabStage2Page({ params }: PageProps) {
  const { setId } = await params;
  const [profile, supabase] = await Promise.all([
    getCurrentProfile(),
    createClient(),
  ]);

  const ctx = await loadStudentVocabSetContext(supabase, profile!.id, setId, {
    items: "stage2",
    progress: "hub",
  });
  if (!ctx) notFound();
  if (!ctx.progress.stage1_completed) {
    redirect(`/student/vocab/${setId}`);
  }
  if (ctx.itemCount < 1) redirect(`/student/vocab/${setId}`);

  // 아직 끝내지 않았으면 지난번에 맞힌 단어는 건너뛰고 이어서 푼다 (완료 확인도 이 기록을 센다)
  let initialCorrectIds: string[] = [];
  if (!ctx.progress.stage2_completed) {
    const { data } = await supabase
      .from("vocab_spelling_attempts")
      .select("item_id")
      .eq("student_id", profile!.id)
      .eq("set_id", setId)
      .eq("is_correct", true);
    initialCorrectIds = [
      ...new Set(((data ?? []) as { item_id: string }[]).map((r) => r.item_id)),
    ];
  }

  const examCompact = Boolean(ctx.set.exam_compact);
  return (
    <VocabStage2Spelling
      setId={setId}
      setTitle={ctx.set.title}
      items={ctx.items}
      initialCorrectIds={initialCorrectIds}
      nextHref={
        ctx.progress.stage2_completed
          ? undefined
          : `/student/vocab/${setId}/${examCompact ? "stage4" : "stage3"}`
      }
      nextLabel={examCompact ? "3단계 종합테스트 시작" : "3단계 예문 빈칸 시작"}
    />
  );
}
