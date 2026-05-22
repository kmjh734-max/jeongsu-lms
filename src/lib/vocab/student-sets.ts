import type { SupabaseClient } from "@supabase/supabase-js";
import { computeVocabSetStats } from "@/lib/vocab/stats";
import type { StudentVocabSetSummary, VocabSet } from "@/types/database";

export async function fetchStudentVocabSummaries(
  supabase: SupabaseClient,
  studentId: string
): Promise<StudentVocabSetSummary[]> {
  const [{ data: classMemberships }, { data: directAssignments }] =
    await Promise.all([
      supabase
        .from("class_students")
        .select("class_id")
        .eq("student_id", studentId),
      supabase
        .from("vocab_assignments")
        .select("set_id")
        .eq("student_id", studentId),
    ]);

  const classIds = (classMemberships ?? []).map((r) => r.class_id);

  const { data: classAssignments } =
    classIds.length > 0
      ? await supabase
          .from("vocab_assignments")
          .select("set_id")
          .in("class_id", classIds)
      : { data: [] as { set_id: string }[] };

  const setIds = [
    ...new Set([
      ...(directAssignments ?? []).map((a) => a.set_id),
      ...(classAssignments ?? []).map((a) => a.set_id),
    ]),
  ];

  if (setIds.length === 0) return [];

  const { data: sets } = await supabase
    .from("vocab_sets")
    .select("*")
    .in("id", setIds)
    .order("created_at", { ascending: false });

  const publishedSets = (sets ?? []) as VocabSet[];
  if (publishedSets.length === 0) return [];

  const publishedIds = publishedSets.map((s) => s.id);

  const [{ data: items }, { data: progress }, { data: stageRows }] =
    await Promise.all([
      supabase
        .from("vocab_items")
        .select("id, set_id")
        .in("set_id", publishedIds),
      supabase
        .from("vocab_progress")
        .select("item_id, status")
        .eq("student_id", studentId),
      supabase
        .from("vocab_stage_progress")
        .select(
          "set_id, stage1_completed, stage2_completed, stage3_passed, stage3_last_score, stage3_best_score"
        )
        .eq("student_id", studentId)
        .in("set_id", publishedIds),
    ]);

  const itemsBySet = new Map<string, { id: string }[]>();
  const allItemIds = new Set<string>();
  for (const item of items ?? []) {
    allItemIds.add(item.id);
    const list = itemsBySet.get(item.set_id) ?? [];
    list.push({ id: item.id });
    itemsBySet.set(item.set_id, list);
  }

  const progressList = (progress ?? []).filter((p) =>
    allItemIds.has(p.item_id)
  );

  const stageBySet = new Map(
    (stageRows ?? []).map((r) => [r.set_id as string, r])
  );

  return publishedSets.map((set) => {
    const setItems = itemsBySet.get(set.id) ?? [];
    const itemIds = new Set(setItems.map((i) => i.id));
    const setProgress = progressList.filter((p) => itemIds.has(p.item_id));
    const stats = computeVocabSetStats(setItems, setProgress);
    const stage = stageBySet.get(set.id);

    return {
      set,
      itemCount: stats.itemCount,
      stage1Completed: Boolean(stage?.stage1_completed),
      stage2Completed: Boolean(stage?.stage2_completed),
      stage3Passed: Boolean(stage?.stage3_passed),
      stage3LastScore: (stage?.stage3_last_score as number) ?? 0,
      stage3BestScore: (stage?.stage3_best_score as number) ?? 0,
    };
  });
}
