import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ExamVocabGuestClient } from "@/components/vocab/ExamVocabGuestClient";
import type { VocabItem } from "@/types/database";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ setId: string }>;
}

/** 시험지 QR — 로그인 없이 보기 단어 학습 */
export default async function ExamVocabPublicPage({ params }: PageProps) {
  const { setId } = await params;
  const admin = createAdminClient();
  const { data: set } = await admin
    .from("vocab_sets")
    .select("id, title, exam_compact")
    .eq("id", setId)
    .maybeSingle();

  if (!set || !set.exam_compact) notFound();

  const { data: items } = await admin
    .from("vocab_items")
    .select(
      "id, set_id, word, meaning, example_sentence, example_meaning, order_index, created_at"
    )
    .eq("set_id", setId)
    .order("order_index")
    .order("created_at");

  return (
    <ExamVocabGuestClient
      setId={set.id}
      title={set.title || "보기 단어"}
      items={(items ?? []) as VocabItem[]}
    />
  );
}
