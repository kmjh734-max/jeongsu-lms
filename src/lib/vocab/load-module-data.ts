import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { fetchAllPages } from "@/lib/vocab/fetch-all";
import type {
  VocabModuleData,
  VocabModuleFolder,
  VocabModuleSet,
  VocabRole,
} from "@/lib/vocab/module-types";

type SetRow = {
  id: string;
  title: string;
  folder_id: string | null;
  is_locked: boolean | null;
  order_index: number | null;
  created_at: string;
  teacher: { name: string | null } | { name: string | null }[] | null;
};

/**
 * 단어학습 화면 공통 자료 — 폴더, 세트(단어 수·통계 제외), 강사 목록.
 * 강사는 RLS로 본인 세트 + 학원 교재만 보인다.
 * 한 요청 안에서 레이아웃과 페이지가 같이 불러도 한 번만 조회한다.
 */
export const loadVocabModuleData = cache(async function loadVocabModuleData(
  role: VocabRole
): Promise<VocabModuleData> {
  // 역할만 키로 써야 레이아웃·페이지가 같은 결과를 나눠 쓴다(클라이언트 객체는 매번 새로 만들어짐)
  const supabase = await createClient();
  const [foldersRes, setRows, teachersRes] = await Promise.all([
    supabase.from("vocab_folders").select("id, name").order("name"),
    fetchAllPages<SetRow>((from, to) =>
      supabase
        .from("vocab_sets")
        .select(
          "id, title, folder_id, is_locked, order_index, created_at, teacher:profiles!vocab_sets_teacher_id_fkey(name)"
        )
        .order("order_index", { ascending: true })
        .order("created_at", { ascending: true })
        .range(from, to)
    ),
    role === "admin"
      ? supabase
          .from("profiles")
          .select("id, name")
          .eq("role", "teacher")
          .eq("is_active", true)
          .order("name")
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);

  const sets: VocabModuleSet[] = setRows.map((s) => {
    const teacher = Array.isArray(s.teacher) ? s.teacher[0] : s.teacher;
    return {
      id: s.id,
      title: s.title,
      folderId: s.folder_id ?? null,
      isLocked: Boolean(s.is_locked),
      orderIndex: s.order_index ?? 0,
      createdAt: s.created_at,
      teacherName: teacher?.name ?? null,
    };
  });

  const countByFolder = new Map<string, number>();
  const lockedFolderIds = new Set<string>();
  let unfiledCount = 0;
  let lockedUnfiledCount = 0;
  for (const s of sets) {
    if (s.folderId) {
      countByFolder.set(s.folderId, (countByFolder.get(s.folderId) ?? 0) + 1);
      if (s.isLocked) lockedFolderIds.add(s.folderId);
    } else if (s.isLocked) {
      lockedUnfiledCount += 1;
    } else {
      unfiledCount += 1;
    }
  }

  const folders: VocabModuleFolder[] = (foldersRes.data ?? []).map((f) => ({
    id: f.id as string,
    name: f.name as string,
    setCount: countByFolder.get(f.id as string) ?? 0,
    isCurriculum: lockedFolderIds.has(f.id as string),
  }));

  const mySetCount = sets.filter((s) =>
    s.folderId ? !lockedFolderIds.has(s.folderId) : !s.isLocked
  ).length;

  return {
    folders,
    sets,
    mySetCount,
    unfiledCount,
    lockedUnfiledCount,
    teachers: (teachersRes.data ?? []).map((t) => ({
      id: t.id as string,
      name: t.name as string,
    })),
  };
});

/** 필터에 맞는 세트만 고른다 (세트 탭 목록). */
export function filterModuleSets(
  data: VocabModuleData,
  filter:
    | { kind: "all" }
    | { kind: "unfiled" }
    | { kind: "locked" }
    | { kind: "folder"; folderId: string }
): VocabModuleSet[] {
  const curriculum = new Set(
    data.folders.filter((f) => f.isCurriculum).map((f) => f.id)
  );
  switch (filter.kind) {
    case "folder":
      return data.sets.filter((s) => s.folderId === filter.folderId);
    case "unfiled":
      return data.sets.filter((s) => !s.folderId && !s.isLocked);
    case "locked":
      return data.sets.filter((s) => !s.folderId && s.isLocked);
    case "all":
    default:
      return data.sets.filter((s) =>
        s.folderId ? !curriculum.has(s.folderId) : !s.isLocked
      );
  }
}
