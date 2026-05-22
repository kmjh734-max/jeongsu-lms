import type { SupabaseClient } from "@supabase/supabase-js";
import { SITE_NAME } from "@/lib/branding";
import { loadFolderAssignPanelData } from "@/lib/vocab/load-assign-panel";
import type { Profile, VocabFolder, VocabSet } from "@/types/database";

export interface VocabFolderSetRow {
  id: string;
  title: string;
  itemCount: number;
  teacherName: string | null;
}

export interface VocabFolderPageData {
  folder: VocabFolder;
  academyName: string;
  ownerName: string;
  ownerUsername: string | null;
  sets: VocabFolderSetRow[];
  folderOptions: { id: string; name: string }[];
  assignPanel: Awaited<ReturnType<typeof loadFolderAssignPanelData>>;
  teachers?: Profile[];
}

export async function loadVocabFolderPageData(
  supabase: SupabaseClient,
  role: "admin" | "teacher",
  userId: string,
  folderId: string
): Promise<VocabFolderPageData | null> {
  const folderQuery = supabase
    .from("vocab_folders")
    .select("*")
    .eq("id", folderId);

  const folderRes =
    role === "admin"
      ? await folderQuery.single()
      : await folderQuery
          .or(`teacher_id.eq.${userId},created_by.eq.${userId}`)
          .single();

  if (!folderRes.data) return null;

  const folder = folderRes.data as VocabFolder;

  const setsQuery = supabase
    .from("vocab_sets")
    .select("*, teacher:profiles!vocab_sets_teacher_id_fkey(id, name)")
    .eq("folder_id", folderId)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });

  const foldersQuery =
    role === "admin"
      ? supabase.from("vocab_folders").select("id, name").order("name")
      : supabase
          .from("vocab_folders")
          .select("id, name")
          .or(`teacher_id.eq.${userId},created_by.eq.${userId}`)
          .order("name");

  const [
    setsRes,
    itemRowsRes,
    foldersRes,
    ownerRes,
    teachersRes,
    assignPanel,
  ] = await Promise.all([
    role === "admin"
      ? setsQuery
      : setsQuery.or(
          `teacher_id.eq.${userId},created_by.eq.${userId}`
        ),
    supabase.from("vocab_items").select("set_id"),
    foldersQuery,
    supabase
      .from("profiles")
      .select("name, username")
      .eq("id", folder.created_by ?? folder.teacher_id ?? userId)
      .maybeSingle(),
    role === "admin"
      ? supabase
          .from("profiles")
          .select("*")
          .eq("role", "teacher")
          .eq("is_active", true)
          .order("name")
      : Promise.resolve({ data: [] as Profile[] }),
    loadFolderAssignPanelData(supabase, role, userId, folderId),
  ]);

  const itemCountBySet = new Map<string, number>();
  for (const row of itemRowsRes.data ?? []) {
    itemCountBySet.set(
      row.set_id,
      (itemCountBySet.get(row.set_id) ?? 0) + 1
    );
  }

  const setList = (setsRes.data ?? []) as (VocabSet & {
    teacher: { id: string; name: string } | null;
  })[];

  const sets: VocabFolderSetRow[] = setList.map((s) => ({
    id: s.id,
    title: s.title,
    itemCount: itemCountBySet.get(s.id) ?? 0,
    teacherName: s.teacher?.name ?? null,
  }));

  const owner = ownerRes.data as { name: string; username: string | null } | null;

  return {
    folder,
    academyName: SITE_NAME.replace(/\s*LMS\s*$/i, "").trim() || SITE_NAME,
    ownerName: owner?.name ?? "—",
    ownerUsername: owner?.username ?? null,
    sets,
    folderOptions: (foldersRes.data ?? []).map((f) => ({
      id: f.id as string,
      name: f.name as string,
    })),
    assignPanel,
    teachers:
      role === "admin" ? ((teachersRes.data ?? []) as Profile[]) : undefined,
  };
}
