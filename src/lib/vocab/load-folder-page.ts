import type { SupabaseClient } from "@supabase/supabase-js";
import { SITE_NAME } from "@/lib/branding";
import { fetchVocabItemCountsBySetIds } from "@/lib/vocab/vocab-item-counts";
import type { Profile, VocabFolder, VocabSet } from "@/types/database";

export interface VocabFolderSetRow {
  id: string;
  title: string;
  itemCount: number;
  teacherName: string | null;
  isLocked?: boolean;
}

export interface VocabFolderPageData {
  folder: VocabFolder;
  academyName: string;
  ownerName: string;
  ownerUsername: string | null;
  sets: VocabFolderSetRow[];
  folderOptions: { id: string; name: string }[];
  teachers?: Profile[];
}

export async function loadVocabFolderPageData(
  supabase: SupabaseClient,
  role: "admin" | "teacher",
  userId: string,
  folderId: string
): Promise<VocabFolderPageData | null> {
  const folderRes = await supabase
    .from("vocab_folders")
    .select("*")
    .eq("id", folderId)
    .maybeSingle();

  if (!folderRes.data) return null;

  const folder = folderRes.data as VocabFolder;

  const setsQuery = supabase
    .from("vocab_sets")
    .select("*, teacher:profiles!vocab_sets_teacher_id_fkey(id, name)")
    .eq("folder_id", folderId)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });

  const foldersQuery = supabase
    .from("vocab_folders")
    .select("id, name")
    .order("name");

  const [setsRes, foldersRes, ownerRes, teachersRes] = await Promise.all([
    setsQuery,
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
  ]);

  const setList = (setsRes.data ?? []) as (VocabSet & {
    teacher: { id: string; name: string } | null;
  })[];

  const itemCountBySet = await fetchVocabItemCountsBySetIds(
    supabase,
    setList.map((s) => s.id)
  );

  const sets: VocabFolderSetRow[] = setList.map((s) => ({
    id: s.id,
    title: s.title,
    itemCount: itemCountBySet.get(s.id) ?? 0,
    teacherName: s.teacher?.name ?? null,
    isLocked: !!s.is_locked,
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
    teachers:
      role === "admin" ? ((teachersRes.data ?? []) as Profile[]) : undefined,
  };
}

/** 폴더 없는(미분류) 단어세트 목록 — 폴더 보기와 동일 UI */
export async function loadVocabUnfiledPageData(
  supabase: SupabaseClient,
  role: "admin" | "teacher",
  userId: string
): Promise<Omit<VocabFolderPageData, "folder"> & { setCount: number }> {
  const setsQuery = supabase
    .from("vocab_sets")
    .select("*, teacher:profiles!vocab_sets_teacher_id_fkey(id, name)")
    .is("folder_id", null)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });

  const foldersQuery = supabase
    .from("vocab_folders")
    .select("id, name")
    .order("name");

  const [setsRes, foldersRes, ownerRes, teachersRes] = await Promise.all([
    setsQuery,
    foldersQuery,
    supabase
      .from("profiles")
      .select("name, username")
      .eq("id", userId)
      .maybeSingle(),
    role === "admin"
      ? supabase
          .from("profiles")
          .select("*")
          .eq("role", "teacher")
          .eq("is_active", true)
          .order("name")
      : Promise.resolve({ data: [] as Profile[] }),
  ]);

  const setList = (setsRes.data ?? []) as (VocabSet & {
    teacher: { id: string; name: string } | null;
  })[];

  const itemCountBySet = await fetchVocabItemCountsBySetIds(
    supabase,
    setList.map((s) => s.id)
  );

  const sets: VocabFolderSetRow[] = setList.map((s) => ({
    id: s.id,
    title: s.title,
    itemCount: itemCountBySet.get(s.id) ?? 0,
    teacherName: s.teacher?.name ?? null,
    isLocked: !!s.is_locked,
  }));

  const owner = ownerRes.data as { name: string; username: string | null } | null;

  return {
    academyName: SITE_NAME.replace(/\s*LMS\s*$/i, "").trim() || SITE_NAME,
    ownerName: owner?.name ?? "—",
    ownerUsername: owner?.username ?? null,
    sets,
    folderOptions: (foldersRes.data ?? []).map((f) => ({
      id: f.id as string,
      name: f.name as string,
    })),
    teachers:
      role === "admin" ? ((teachersRes.data ?? []) as Profile[]) : undefined,
    setCount: sets.length,
  };
}
