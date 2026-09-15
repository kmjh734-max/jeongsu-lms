import type { SupabaseClient } from "@supabase/supabase-js";
import {
  listListeningSetFolders,
  type ListeningSetFolderRow,
} from "@/lib/listening/folder-access";
import type { UserRole } from "@/types/database";

export interface ListeningSetListItem {
  id: string;
  title: string;
  is_published: boolean;
  created_at: string;
  folder_id: string | null;
  order_index: number;
  is_locked?: boolean;
  description?: string | null;
  grade_level?: string | null;
  dictation_enabled?: boolean | null;
  dictation_pass_score?: number | null;
}

export type ListeningSetFolderItem = ListeningSetFolderRow;

const BASE_COLUMNS =
  "id, title, is_published, created_at, folder_id, order_index, description, grade_level, dictation_enabled, dictation_pass_score";

export async function loadListeningPageData(
  supabase: SupabaseClient,
  role: UserRole,
  viewerId: string,
  /**
   * 관리자 RLS 는 자기 학원 세트만 보여 준다. 학원을 직접 걸면 같은 행을
   * 학원 색인으로 읽어, 다른 학원 행마다 권한 함수를 돌리지 않는다.
   */
  academyId?: string | null
) {
  const buildSetsQuery = (columns: string) => {
    let query = supabase
      .from("listening_sets")
      .select(columns)
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(200);
    if (role === "teacher") {
      // 본인 세트 + 커리큘럼 잠금 세트(description 마커; is_locked 컬럼 있으면 RLS로도 허용)
      query = query.or(
        `teacher_id.eq.${viewerId},description.ilike.%curriculum_locked%`
      );
    } else if (role === "admin" && academyId) {
      query = query.eq("academy_id", academyId);
    }
    return query;
  };

  const loadSets = async (): Promise<ListeningSetListItem[]> => {
    const withLock = await buildSetsQuery(`${BASE_COLUMNS}, is_locked`);
    if (!withLock.error) {
      return (withLock.data ?? []) as unknown as ListeningSetListItem[];
    }
    // is_locked 컬럼이 없는 환경
    const fallback = await buildSetsQuery(BASE_COLUMNS);
    return (fallback.data ?? []) as unknown as ListeningSetListItem[];
  };

  const [folders, sets] = await Promise.all([
    listListeningSetFolders(supabase, role, viewerId, academyId).catch(
      () => [] as ListeningSetFolderRow[]
    ),
    loadSets(),
  ]);

  const setList = sets.map((s) => ({
    ...s,
    is_locked:
      s.is_locked === true ||
      (s.description ?? "").includes("curriculum_locked"),
  }));

  return { sets: setList, folders };
}
