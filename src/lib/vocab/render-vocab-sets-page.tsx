import { notFound } from "next/navigation";
import { VocabSetsBrowser } from "@/components/vocab/VocabSetsBrowser";
import { createClient } from "@/lib/supabase/server";
import { filterModuleSets, loadVocabModuleData } from "@/lib/vocab/load-module-data";
import { EMPTY_SET_STATS, loadVocabSetStats } from "@/lib/vocab/load-set-stats";
import type {
  VocabRole,
  VocabSetListRow,
  VocabSetsFilter,
} from "@/lib/vocab/module-types";
import { fetchVocabItemCountsBySetIds } from "@/lib/vocab/vocab-item-counts";

/** 세트 탭(전체·미분류·폴더·학원 교재) — 같은 화면에 필터만 다르게 */
export async function renderVocabSetsPage(role: VocabRole, filter: VocabSetsFilter) {
  const supabase = await createClient();
  const data = await loadVocabModuleData(role);

  const folder =
    filter.kind === "folder" ? data.folders.find((f) => f.id === filter.folderId) : null;
  if (filter.kind === "folder" && !folder) notFound();

  let sets = filterModuleSets(data, filter);
  if (filter.kind === "all") {
    // 여러 폴더가 섞이므로 폴더 이름 순 → 폴더 안 순서 (미분류는 맨 뒤)
    const folderRank = new Map(data.folders.map((f, i) => [f.id, i]));
    sets = [...sets].sort((a, b) => {
      const ra = a.folderId ? (folderRank.get(a.folderId) ?? 0) : Number.MAX_SAFE_INTEGER;
      const rb = b.folderId ? (folderRank.get(b.folderId) ?? 0) : Number.MAX_SAFE_INTEGER;
      return ra - rb || a.orderIndex - b.orderIndex;
    });
  }

  const ids = sets.map((s) => s.id);
  const [itemCounts, stats] = await Promise.all([
    fetchVocabItemCountsBySetIds(supabase, ids),
    loadVocabSetStats(supabase, ids),
  ]);

  const rows: VocabSetListRow[] = sets.map((s) => ({
    ...s,
    itemCount: itemCounts.get(s.id) ?? 0,
    stats: stats.get(s.id) ?? EMPTY_SET_STATS,
  }));

  const heading =
    filter.kind === "folder"
      ? folder!.name
      : filter.kind === "unfiled"
        ? "미분류"
        : filter.kind === "locked"
          ? "학원 교재"
          : "전체";

  // 강사는 잠긴 교재의 순서를 바꿀 수 없다(수정 권한 없음)
  const canReorder =
    (filter.kind === "folder" && !(role === "teacher" && folder!.isCurriculum)) ||
    filter.kind === "unfiled";

  return (
    <VocabSetsBrowser
      role={role}
      filter={filter}
      heading={heading}
      rows={rows}
      folders={data.folders}
      mySetCount={data.mySetCount}
      unfiledCount={data.unfiledCount}
      lockedUnfiledCount={data.lockedUnfiledCount}
      canReorder={canReorder}
    />
  );
}
