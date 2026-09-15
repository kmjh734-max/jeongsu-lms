import { notFound } from "next/navigation";
import { VocabSetDetail, type VocabSetTab } from "@/components/vocab/VocabSetDetail";
import { createClient } from "@/lib/supabase/server";
import { loadVocabModuleData } from "@/lib/vocab/load-module-data";
import { loadSetStageProgressRows } from "@/lib/vocab/load-set-stage-progress";
import { EMPTY_SET_STATS, loadVocabSetStats } from "@/lib/vocab/load-set-stats";
import { vocabBasePath, type VocabRole } from "@/lib/vocab/module-types";
import type { VocabItem, VocabSet } from "@/types/database";

/** 세트 상세 — [단어] [학생 진행] [설정] */
export async function renderVocabSetPage(
  role: VocabRole,
  setId: string,
  opts: { importOpen: boolean; tab?: string }
) {
  const supabase = await createClient();
  const base = vocabBasePath(role);

  // 강사는 RLS로 본인 세트 + 학원 교재만 읽을 수 있다
  const { data: setRow } = await supabase
    .from("vocab_sets")
    .select("*")
    .eq("id", setId)
    .maybeSingle();
  if (!setRow) notFound();
  const set = setRow as VocabSet;

  const [moduleData, itemsRes, progressRows, statsMap] = await Promise.all([
    loadVocabModuleData(role),
    supabase
      .from("vocab_items")
      .select("*")
      .eq("set_id", setId)
      .order("order_index")
      .order("created_at"),
    loadSetStageProgressRows(supabase, setId),
    loadVocabSetStats(supabase, [setId]),
  ]);

  const folder = set.folder_id
    ? moduleData.folders.find((f) => f.id === set.folder_id)
    : undefined;
  const backHref = folder
    ? `${base}/folder/${folder.id}`
    : set.is_locked
      ? `${base}/sets?view=locked`
      : `${base}/unfiled`;
  const backLabel = folder?.name ?? (set.is_locked ? "학원 교재" : "미분류");

  const tab: VocabSetTab =
    opts.tab === "progress" || opts.tab === "settings" ? opts.tab : "words";

  return (
    <VocabSetDetail
      key={set.id}
      role={role}
      set={set}
      items={(itemsRes.data ?? []) as VocabItem[]}
      stats={statsMap.get(setId) ?? EMPTY_SET_STATS}
      progressRows={progressRows}
      teachers={moduleData.teachers}
      folders={moduleData.folders
        .filter((f) => !f.isCurriculum)
        .map((f) => ({ id: f.id, name: f.name }))}
      backHref={backHref}
      backLabel={backLabel}
      initialTab={tab}
      initialImportOpen={opts.importOpen}
    />
  );
}
