import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Class, VocabFolder } from "@/types/database";
import type { VocabSidebarSet } from "@/components/vocab/vocab-sidebar-types";

/** 사이드바용 — 단어 수 RPC는 생략 (폴더 클릭·세트 상세에서만 조회) */
export const loadVocabSidebarData = cache(async function loadVocabSidebarData(
  supabase: SupabaseClient,
  role: "admin" | "teacher",
  userId: string
): Promise<{
  classes: Class[];
  folders: VocabFolder[];
  sets: VocabSidebarSet[];
}> {
  const classesQuery =
    role === "admin"
      ? supabase
          .from("classes")
          .select("id, name")
          .eq("is_active", true)
          .order("name")
      : supabase
          .from("classes")
          .select("id, name")
          .eq("teacher_id", userId)
          .eq("is_active", true)
          .order("name");

  // Teachers: RLS allows own sets + locked curriculum in academy
  const foldersQuery = supabase
    .from("vocab_folders")
    .select("id, name, created_at")
    .order("name");

  const setsQuery = supabase
    .from("vocab_sets")
    .select("id, title, folder_id, is_locked")
    .order("created_at", { ascending: false });

  const [classesRes, foldersRes, setsRes] = await Promise.all([
    classesQuery,
    foldersQuery,
    setsQuery,
  ]);

  const sets = (setsRes.data ?? []).map((s) => ({
    id: s.id as string,
    title: s.title as string,
    folder_id: (s.folder_id as string | null) ?? null,
    item_count: 0,
  }));

  return {
    classes: (classesRes.data ?? []) as Class[],
    folders: (foldersRes.data ?? []) as VocabFolder[],
    sets,
  };
});
