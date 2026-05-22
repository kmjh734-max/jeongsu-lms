import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { fetchStudentVocabSummaries } from "@/lib/vocab/student-sets";
import {
  VocabCardStudy,
  type VocabStudyItem,
} from "@/components/vocab/VocabCardStudy";
import type { VocabItem, VocabProgressStatus } from "@/types/database";

interface PageProps {
  params: Promise<{ setId: string }>;
}

export default async function StudentVocabStudyPage({ params }: PageProps) {
  const { setId } = await params;
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const summaries = await fetchStudentVocabSummaries(supabase, profile!.id);
  const summary = summaries.find((s) => s.set.id === setId);

  if (!summary) {
    notFound();
  }

  const { data: items } = await supabase
    .from("vocab_items")
    .select("*")
    .eq("set_id", setId)
    .order("order_index")
    .order("created_at");

  const itemList = (items ?? []) as VocabItem[];

  if (itemList.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-8">
        <VocabCardStudy setId={setId} setTitle={summary.set.title} items={[]} />
      </div>
    );
  }

  const itemIds = itemList.map((i) => i.id);
  const { data: progress } = await supabase
    .from("vocab_progress")
    .select("item_id, status")
    .eq("student_id", profile!.id)
    .in("item_id", itemIds);

  const statusByItem = new Map(
    (progress ?? []).map((p) => [
      p.item_id,
      p.status as VocabProgressStatus,
    ])
  );

  const studyItems: VocabStudyItem[] = itemList.map((item) => ({
    ...item,
    progressStatus: statusByItem.get(item.id) ?? "unknown",
  }));

  return (
    <div className="mx-auto w-full max-w-4xl py-6 px-4 sm:py-10">
      <VocabCardStudy
        setId={setId}
        setTitle={summary.set.title}
        items={studyItems}
      />
    </div>
  );
}
