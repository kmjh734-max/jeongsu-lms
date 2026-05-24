import type { SupabaseClient } from "@supabase/supabase-js";
import { computeVocabSetStats } from "@/lib/vocab/stats";
import {
  stage3Completed,
  stage4BestScore,
  stage4LastScore,
  stage4Passed,
} from "@/lib/vocab/stage-progress-fields";
import type { StudentVocabSetSummary, VocabSet, VocabStageProgress } from "@/types/database";

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

  const [{ data: items }, { data: stageRows }] = await Promise.all([
    supabase
      .from("vocab_items")
      .select("id, set_id")
      .in("set_id", publishedIds),
    supabase
      .from("vocab_stage_progress")
      .select(
        "set_id, stage1_completed, stage2_completed, stage3_completed, stage4_passed, stage4_last_score, stage4_best_score, stage4_attempt_count, stage3_passed, stage3_last_score, stage3_best_score, stage3_attempt_count"
      )
      .eq("student_id", studentId)
      .in("set_id", publishedIds),
  ]);

  const itemsBySet = new Map<string, { id: string }[]>();
  const allItemIds: string[] = [];
  for (const item of items ?? []) {
    allItemIds.push(item.id);
    const list = itemsBySet.get(item.set_id) ?? [];
    list.push({ id: item.id });
    itemsBySet.set(item.set_id, list);
  }

  const { data: progress } =
    allItemIds.length > 0
      ? await supabase
          .from("vocab_progress")
          .select("item_id, status")
          .eq("student_id", studentId)
          .in("item_id", allItemIds)
      : { data: [] as { item_id: string; status: string }[] };

  const progressList = progress ?? [];

  const stageBySet = new Map(
    (stageRows ?? []).map((r) => [r.set_id as string, r])
  );

  return publishedSets.map((set) => {
    const setItems = itemsBySet.get(set.id) ?? [];
    const itemIds = new Set(setItems.map((i) => i.id));
    const setProgress = progressList.filter((p) => itemIds.has(p.item_id));
    const stats = computeVocabSetStats(setItems, setProgress);
    const stage = stageBySet.get(set.id) as VocabStageProgress | undefined;
    const progress: VocabStageProgress =
      stage ??
      ({
        stage1_completed: false,
        stage2_completed: false,
        stage3_completed: false,
        stage4_passed: false,
        stage4_last_score: 0,
        stage4_best_score: 0,
        stage3_passed: false,
        stage3_last_score: 0,
        stage3_best_score: 0,
      } as VocabStageProgress);

    return {
      set,
      itemCount: stats.itemCount,
      stage1Completed: Boolean(progress.stage1_completed),
      stage2Completed: Boolean(progress.stage2_completed),
      stage3Completed: stage3Completed(progress),
      stage4Passed: stage4Passed(progress),
      stage4LastScore: stage4LastScore(progress),
      stage4BestScore: stage4BestScore(progress),
    };
  });
}
