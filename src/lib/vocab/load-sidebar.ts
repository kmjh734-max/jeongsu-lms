import type { SupabaseClient } from "@supabase/supabase-js";
import type { Class, VocabFolder, VocabSet } from "@/types/database";
import type { VocabSidebarSet } from "@/components/vocab/VocabSidebar";
import { fetchVocabItemCountsBySetIds } from "@/lib/vocab/vocab-item-counts";

export async function loadVocabSidebarData(
  supabase: SupabaseClient,
  role: "admin" | "teacher",
  userId: string
): Promise<{
  classes: Class[];
  folders: VocabFolder[];
  sets: VocabSidebarSet[];
}> {
  const [classesRes, foldersRes, setsRes] = await Promise.all([
    role === "admin"
      ? supabase
          .from("classes")
          .select("*")
          .eq("is_active", true)
          .order("name")
      : supabase
          .from("classes")
          .select("*")
          .eq("teacher_id", userId)
          .eq("is_active", true)
          .order("name"),
    role === "admin"
      ? supabase.from("vocab_folders").select("*").order("name")
      : supabase
          .from("vocab_folders")
          .select("*")
          .or(`teacher_id.eq.${userId},created_by.eq.${userId}`)
          .order("name"),
    role === "admin"
      ? supabase.from("vocab_sets").select("*").order("created_at", { ascending: false })
      : supabase
          .from("vocab_sets")
          .select("*")
          .or(`teacher_id.eq.${userId},created_by.eq.${userId}`)
          .order("created_at", { ascending: false }),
  ]);

  const setList = (setsRes.data ?? []) as VocabSet[];
  const itemCountBySet = await fetchVocabItemCountsBySetIds(
    supabase,
    setList.map((s) => s.id)
  );

  const sets = setList.map((s) => ({
    id: s.id,
    title: s.title,
    folder_id: s.folder_id,
    item_count: itemCountBySet.get(s.id) ?? 0,
  }));

  return {
    classes: (classesRes.data ?? []) as Class[],
    folders: (foldersRes.data ?? []) as VocabFolder[],
    sets,
  };
}
