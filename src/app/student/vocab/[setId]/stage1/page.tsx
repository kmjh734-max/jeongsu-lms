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

  // 지난번 알아요/몰라요 (이어 할 때 완료 화면에서 함께 센다)
  const { data: statusRows } = await supabase
    .from("vocab_progress")
    .select("item_id, status")
    .eq("student_id", profile!.id)
    .in("item_id", [...currentIds]);
  const initialStatuses: Record<string, "known" | "review"> = {};
  for (const row of (statusRows ?? []) as { item_id: string; status: string }[]) {
    if (row.status === "known" || row.status === "review") {
      initialStatuses[row.item_id] = row.status;
    }
  }

  return (
    <VocabStage1Study
      setId={setId}
      setTitle={ctx.set.title}
      items={ctx.items}
      initialSeenIds={seenIds}
      stage1Completed={ctx.progress.stage1_completed}
      initialStatuses={initialStatuses}
      nextHref={
        ctx.progress.stage2_completed ? undefined : `/student/vocab/${setId}/stage2`
      }
      nextLabel="2단계 스펠링 시작"
    />
  );
}
